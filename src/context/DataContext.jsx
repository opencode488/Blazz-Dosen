import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_LECTURERS,
  INITIAL_COURSES,
  INITIAL_SCHEDULES,
  INITIAL_AUTOMATIONS,
  INITIAL_TEMPLATES,
  INITIAL_CHAT_HISTORY,
  INITIAL_SETTINGS
} from '../services/dummyData';
import { calculateHMinusOne, formatIndonesianDate, formatScheduledTimestamp, getDayNameFromDate } from '../utils/dateUtils';
import { normalizePhoneNumber } from '../utils/phoneUtils';
import {
  getSupabase,
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  fetchAllFromSupabase,
  clearSupabaseDatabase,
  mapLecturerToDb,
  mapCourseToDb,
  mapScheduleToDb,
  mapAutomationToDb,
  mapTemplateToDb,
  mapChatHistoryToDb
} from '../services/supabase';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import whatsappService from '../services/whatsappService';
import WhatsAppModal from '../components/whatsapp/WhatsAppModal';

const DataContext = createContext({});

// Ensure previous dummy data is purged from localStorage on first run
const cleanLegacyDummyData = () => {
  try {
    const isCleaned = localStorage.getItem('dosen_db_cleaned_v3');
    if (!isCleaned) {
      const savedLecturers = localStorage.getItem('dosen_lecturers');
      if (savedLecturers && (savedLecturers.includes('lec-1') || savedLecturers.includes('Dr. Budi Santoso'))) {
        localStorage.removeItem('dosen_lecturers');
        localStorage.removeItem('dosen_courses');
        localStorage.removeItem('dosen_schedules');
        localStorage.removeItem('dosen_automations');
        localStorage.removeItem('dosen_chat_history');
        localStorage.removeItem('dosen_templates');
      }
      localStorage.setItem('dosen_db_cleaned_v3', 'true');
    }
  } catch (e) {
    console.error('Failed to cleanup legacy dummy data:', e);
  }
};

cleanLegacyDummyData();

export function DataProvider({ children }) {
  // 1. Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1b. Global Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: null,
    note: null,
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    variant: 'danger',
    onConfirm: () => {}
  });

  const openConfirm = ({
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    itemName = null,
    note = null,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger',
    onConfirm = () => {}
  }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      itemName,
      note,
      confirmText,
      cancelText,
      variant,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // 2. Supabase Integration State
  const [supabaseStatus, setSupabaseStatus] = useState({
    isConfigured: isSupabaseConfigured(),
    isConnected: false,
    checking: false,
    errorMessage: null
  });
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // 2b. WhatsApp Web Integration State (Multi-Device / QR Code Scan)
  const [whatsAppStatus, setWhatsAppStatus] = useState({
    status: 'disconnected',
    qrCode: null,
    user: null,
    isConnected: false
  });
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  const refreshWhatsAppStatus = useCallback(async () => {
    try {
      const res = await whatsappService.getStatus();
      if (res) {
        setWhatsAppStatus(res);
      }
      return res;
    } catch (e) {
      console.warn('Gagal refresh status WhatsApp:', e);
    }
  }, []);

  const connectWhatsApp = async (forceFresh = false) => {
    try {
      const res = await whatsappService.connect(forceFresh);
      setWhatsAppStatus(res);
      return res;
    } catch (err) {
      console.error('Error connect WhatsApp:', err);
      throw err;
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const res = await whatsappService.disconnect();
      setWhatsAppStatus({
        status: 'disconnected',
        qrCode: null,
        user: null,
        isConnected: false
      });
      return res;
    } catch (err) {
      console.error('Error disconnect WhatsApp:', err);
      throw err;
    }
  };

  const sendTestWhatsApp = async (phone, message) => {
    return whatsappService.sendMessage({ to: phone, message });
  };

  const openWaModal = () => setIsWaModalOpen(true);
  const closeWaModal = () => setIsWaModalOpen(false);

  // Periodically check WhatsApp status
  useEffect(() => {
    refreshWhatsAppStatus();
    const intervalTime = (isWaModalOpen || whatsAppStatus.status === 'qr_ready' || whatsAppStatus.status === 'connecting') ? 3000 : 10000;
    const interval = setInterval(() => {
      refreshWhatsAppStatus();
    }, intervalTime);
    return () => clearInterval(interval);
  }, [isWaModalOpen, whatsAppStatus.status, refreshWhatsAppStatus]);

  // 3. Data state loaded from localStorage with initial fallbacks (all empty by default)
  const [lecturers, setLecturers] = useState(() => {
    const saved = localStorage.getItem('dosen_lecturers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let changed = false;
        const cleaned = parsed.map((lec) => {
          if (lec.avatar && typeof lec.avatar === 'string' && lec.avatar.includes('photo-1534528741775-53994a69daeb')) {
            changed = true;
            return { ...lec, avatar: '' };
          }
          return lec;
        });
        if (changed) {
          localStorage.setItem('dosen_lecturers', JSON.stringify(cleaned));
        }
        return cleaned;
      } catch {
        // ignore parse error
      }
    }
    return INITIAL_LECTURERS;
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('dosen_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('dosen_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [automations, setAutomations] = useState(() => {
    const saved = localStorage.getItem('dosen_automations');
    return saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
  });

  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('dosen_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('dosen_chat_history');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_HISTORY;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dosen_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.studentName && (parsed.studentName.includes('Ahmad') || parsed.studentName.includes('Dinur'))) {
          parsed.studentName = 'idk dan direxx';
          parsed.studentEmail = 'idk.direxx@student.univ.ac.id';
          localStorage.setItem('dosen_settings', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        // ignore parse error
      }
    }
    return INITIAL_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dosen_lecturers', JSON.stringify(lecturers));
  }, [lecturers]);

  useEffect(() => {
    localStorage.setItem('dosen_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('dosen_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('dosen_automations', JSON.stringify(automations));
  }, [automations]);

  useEffect(() => {
    localStorage.setItem('dosen_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('dosen_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('dosen_settings', JSON.stringify(settings));
  }, [settings]);

  // Synchronize from Supabase on mount or credential update
  const syncWithSupabase = useCallback(async (silent = false) => {
    if (!isSupabaseConfigured()) {
      setSupabaseStatus({
        isConfigured: false,
        isConnected: false,
        checking: false,
        errorMessage: 'Kredensial Supabase belum diatur.'
      });
      return;
    }

    setSupabaseStatus((prev) => ({ ...prev, checking: true, errorMessage: null }));
    if (!silent) setIsLoadingDb(true);

    try {
      const connTest = await testSupabaseConnection();
      if (!connTest.success) {
        setSupabaseStatus({
          isConfigured: true,
          isConnected: false,
          checking: false,
          errorMessage: connTest.message
        });
        if (!silent) addToast(connTest.message, 'warning');
        return;
      }

      setSupabaseStatus({
        isConfigured: true,
        isConnected: true,
        checking: false,
        errorMessage: null
      });

      const dbData = await fetchAllFromSupabase();
      if (dbData) {
        setLecturers(dbData.lecturers || []);
        setCourses(dbData.courses || []);
        setSchedules(dbData.schedules || []);
        setAutomations(dbData.automations || []);
        setTemplates(dbData.templates || []);
        setChatHistory(dbData.chatHistory || []);
        if (!silent) addToast('Data berhasil disinkronkan dari Supabase PostgreSQL.');
      }
    } catch (err) {
      console.error('Error syncing with Supabase:', err);
      setSupabaseStatus({
        isConfigured: true,
        isConnected: false,
        checking: false,
        errorMessage: err.message || 'Gagal tersambung ke Supabase'
      });
    } finally {
      if (!silent) setIsLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      syncWithSupabase(true);
    }
  }, [syncWithSupabase]);

  // Configure Supabase credentials
  const configureSupabase = async (url, anonKey) => {
    saveSupabaseConfig(url, anonKey);
    const configured = isSupabaseConfigured();
    setSupabaseStatus((prev) => ({ ...prev, isConfigured: configured }));
    if (configured) {
      await syncWithSupabase(false);
    } else {
      addToast('Kredensial Supabase disimpan (belum lengkap).', 'info');
    }
  };

  // --- CLEAR / EMPTY DATABASE ACTION ---
  const clearAllData = async () => {
    // 1. Clear local state
    setLecturers([]);
    setCourses([]);
    setSchedules([]);
    setAutomations([]);
    setTemplates([]);
    setChatHistory([]);

    // 2. Clear localStorage
    localStorage.removeItem('dosen_lecturers');
    localStorage.removeItem('dosen_courses');
    localStorage.removeItem('dosen_schedules');
    localStorage.removeItem('dosen_automations');
    localStorage.removeItem('dosen_templates');
    localStorage.removeItem('dosen_chat_history');

    // 3. Clear Supabase database if configured
    if (isSupabaseConfigured()) {
      try {
        const res = await clearSupabaseDatabase();
        if (res.success) {
          addToast('Seluruh tabel database di Supabase dan data lokal berhasil dikosongkan!');
        } else {
          addToast(`Data lokal dikosongkan, namun Supabase gagal: ${res.error}`, 'warning');
        }
      } catch (err) {
        addToast(`Gagal mengosongkan Supabase: ${err.message}`, 'error');
      }
    } else {
      addToast('Seluruh data dummy dan penyimpanan lokal telah dikosongkan.');
    }
  };

  // --- LECTURER ACTIONS ---
  const addLecturer = async (data) => {
    const normalizedPhone = normalizePhoneNumber(data.phone);
    const newLec = {
      ...data,
      id: 'lec-' + Date.now(),
      phone: normalizedPhone,
      status: data.status || 'Aktif',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLecturers((prev) => [newLec, ...prev]);
    addToast(`Dosen ${newLec.name} berhasil ditambahkan.`);

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        const { error } = await client.from('lecturers').insert(mapLecturerToDb(newLec));
        if (error) console.error('Supabase addLecturer error:', error);
      } catch (err) {
        console.error('Supabase addLecturer error:', err);
      }
    }

    return newLec;
  };

  const updateLecturer = async (id, data) => {
    const normalizedPhone = data.phone ? normalizePhoneNumber(data.phone) : undefined;
    let updatedLecturer = null;

    setLecturers((prev) =>
      prev.map((lec) => {
        if (lec.id === id) {
          updatedLecturer = { ...lec, ...data, ...(normalizedPhone ? { phone: normalizedPhone } : {}) };
          return updatedLecturer;
        }
        return lec;
      })
    );
    addToast('Data dosen berhasil diperbarui.');

    const client = getSupabase();
    if (client && isSupabaseConfigured() && updatedLecturer) {
      try {
        const { error } = await client
          .from('lecturers')
          .update(mapLecturerToDb(updatedLecturer))
          .eq('id', id);
        if (error) console.error('Supabase updateLecturer error:', error);
      } catch (err) {
        console.error('Supabase updateLecturer error:', err);
      }
    }
  };

  const deleteLecturer = async (id) => {
    const lec = lecturers.find((l) => l.id === id);
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    addToast(`Dosen ${lec?.name || ''} telah dihapus.`);

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        const { error } = await client.from('lecturers').delete().eq('id', id);
        if (error) console.error('Supabase deleteLecturer error:', error);
      } catch (err) {
        console.error('Supabase deleteLecturer error:', err);
      }
    }
  };

  // --- COURSE ACTIONS ---
  const addCourse = async (data) => {
    const newCrs = {
      ...data,
      id: 'crs-' + Date.now(),
      credits: Number(data.credits) || 3
    };
    setCourses((prev) => [newCrs, ...prev]);
    addToast(`Mata kuliah ${newCrs.name} berhasil ditambahkan.`);

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        const { error } = await client.from('courses').insert(mapCourseToDb(newCrs));
        if (error) console.error('Supabase addCourse error:', error);
      } catch (err) {
        console.error('Supabase addCourse error:', err);
      }
    }

    return newCrs;
  };

  const updateCourse = async (id, data) => {
    let updatedCourse = null;
    setCourses((prev) =>
      prev.map((crs) => {
        if (crs.id === id) {
          updatedCourse = { ...crs, ...data, credits: Number(data.credits) || crs.credits };
          return updatedCourse;
        }
        return crs;
      })
    );
    addToast('Mata kuliah berhasil diperbarui.');

    const client = getSupabase();
    if (client && isSupabaseConfigured() && updatedCourse) {
      try {
        const { error } = await client
          .from('courses')
          .update(mapCourseToDb(updatedCourse))
          .eq('id', id);
        if (error) console.error('Supabase updateCourse error:', error);
      } catch (err) {
        console.error('Supabase updateCourse error:', err);
      }
    }
  };

  const deleteCourse = async (id) => {
    const crs = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    addToast(`Mata kuliah ${crs?.name || ''} telah dihapus.`);

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        const { error } = await client.from('courses').delete().eq('id', id);
        if (error) console.error('Supabase deleteCourse error:', error);
      } catch (err) {
        console.error('Supabase deleteCourse error:', err);
      }
    }
  };

  // --- AUTO CHAT HELPER ---
  const generateMessageBody = (lecturer, course, schedule) => {
    const formattedDate = formatIndonesianDate(schedule.date);
    const meetingText = schedule.meetingNumber ? ` (Pertemuan ${schedule.meetingNumber})` : '';
    return `Selamat pagi, ${lecturer?.name || 'Bapak/Ibu'}${lecturer?.title ? ', ' + lecturer.title : ''}. Mohon izin mengingatkan bahwa pada ${formattedDate} terdapat perkuliahan ${course?.name || 'Mata Kuliah'}${meetingText} pada pukul ${schedule.startTime} - ${schedule.endTime} di ${schedule.room}. Apakah perkuliahan tetap dilaksanakan sesuai jadwal? Terima kasih banyak.`;
  };

  // --- SCHEDULE ACTIONS ---
  const addSchedule = async (data) => {
    // If user selected recurring weekly with multiple dates (e.g. 14 meetings for semester)
    if (data.scheduleType === 'weekly' && Array.isArray(data.weeklyDates) && data.weeklyDates.length > 1) {
      const groupId = 'grp-' + Date.now();
      const newSchedules = [];
      const newAutomations = [];
      const lec = lecturers.find((l) => l.id === data.lecturerId);
      const crs = courses.find((c) => c.id === data.courseId);

      data.weeklyDates.forEach((meetingDate, idx) => {
        const meetingNumber = idx + 1;
        const totalMeetings = data.weeklyDates.length;
        const schId = `sch-${Date.now()}-${meetingNumber}`;
        const scheduledAt = data.autoChat ? calculateHMinusOne(meetingDate, '08:00') : null;

        const schObj = {
          ...data,
          id: schId,
          date: meetingDate,
          dayOfWeek: data.dayOfWeek || getDayNameFromDate(meetingDate),
          recurringGroupId: groupId,
          meetingNumber,
          totalMeetings,
          autoChat: Boolean(data.autoChat),
          scheduledAt,
          status: data.autoChat ? 'scheduled' : 'inactive',
          notes: data.notes 
            ? `${data.notes} (Pertemuan ${meetingNumber})` 
            : `Pertemuan ${meetingNumber} dari ${totalMeetings}`
        };
        newSchedules.push(schObj);

        if (schObj.autoChat) {
          const msgBody = generateMessageBody(lec, crs, schObj);
          newAutomations.push({
            id: `msg-${Date.now()}-${meetingNumber}`,
            scheduleId: schId,
            lecturerId: data.lecturerId,
            courseId: data.courseId,
            phoneNumber: lec?.phone || '',
            message: msgBody,
            scheduledAt,
            sentAt: null,
            status: 'scheduled',
            providerMessageId: `wam_msg_${Date.now()}_${meetingNumber}`,
            errorMessage: null,
            createdAt: new Date().toISOString()
          });
        }
      });

      setSchedules((prev) => [...newSchedules, ...prev]);
      if (newAutomations.length > 0) {
        setAutomations((prev) => [...newAutomations, ...prev]);
      }

      addToast(`Jadwal semester berhasil dibuat: ${newSchedules.length} pertemuan setiap hari ${data.dayOfWeek || 'minggu'} dengan pengingat otomatis.`);

      const client = getSupabase();
      if (client && isSupabaseConfigured()) {
        try {
          await client.from('schedules').insert(newSchedules.map(mapScheduleToDb));
          if (newAutomations.length > 0) {
            await client.from('scheduled_messages').insert(newAutomations.map(mapAutomationToDb));
          }
        } catch (err) {
          console.error('Supabase batch addSchedule error:', err);
        }
      }

      return newSchedules[0];
    }

    // Single schedule creation (or 1 session)
    const newId = 'sch-' + Date.now();
    const scheduledAt = data.autoChat ? calculateHMinusOne(data.date, '08:00') : null;
    const dayOfWeek = data.dayOfWeek || getDayNameFromDate(data.date);

    const newSchedule = {
      ...data,
      id: newId,
      dayOfWeek,
      autoChat: Boolean(data.autoChat),
      scheduledAt,
      status: data.autoChat ? 'scheduled' : 'inactive'
    };

    setSchedules((prev) => [newSchedule, ...prev]);

    let newAutomation = null;
    if (newSchedule.autoChat) {
      const lec = lecturers.find((l) => l.id === data.lecturerId);
      const crs = courses.find((c) => c.id === data.courseId);
      const msgBody = generateMessageBody(lec, crs, newSchedule);

      newAutomation = {
        id: 'msg-' + Date.now(),
        scheduleId: newId,
        lecturerId: data.lecturerId,
        courseId: data.courseId,
        phoneNumber: lec?.phone || '',
        message: msgBody,
        scheduledAt,
        sentAt: null,
        status: 'scheduled',
        providerMessageId: 'wam_msg_' + Date.now(),
        errorMessage: null,
        createdAt: new Date().toISOString()
      };

      setAutomations((prev) => [newAutomation, ...prev]);
      const dateText = formatScheduledTimestamp(scheduledAt);
      addToast(`Jadwal berhasil ditambahkan. Pesan otomatis dijadwalkan untuk ${dateText}.`);
    } else {
      addToast('Jadwal berhasil ditambahkan.');
    }

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('schedules').insert(mapScheduleToDb(newSchedule));
        if (newAutomation) {
          await client.from('scheduled_messages').insert(mapAutomationToDb(newAutomation));
        }
      } catch (err) {
        console.error('Supabase addSchedule error:', err);
      }
    }

    return newSchedule;
  };

  const updateSchedule = async (id, data, applyToAllRecurring = false) => {
    const scheduledAt = data.autoChat ? calculateHMinusOne(data.date, '08:00') : null;
    const targetSchedule = schedules.find((s) => s.id === id);
    const recurringGroupId = targetSchedule?.recurringGroupId;

    if (applyToAllRecurring && recurringGroupId) {
      // Update all schedules in this recurring group for common attributes (time, room, lecturer, course, autoChat)
      const affectedIds = [];
      setSchedules((prev) =>
        prev.map((sch) => {
          if (sch.recurringGroupId === recurringGroupId) {
            affectedIds.push(sch.id);
            const schScheduledAt = data.autoChat ? calculateHMinusOne(sch.date, '08:00') : null;
            return {
              ...sch,
              courseId: data.courseId,
              lecturerId: data.lecturerId,
              startTime: data.startTime,
              endTime: data.endTime,
              room: data.room,
              autoChat: Boolean(data.autoChat),
              scheduledAt: schScheduledAt
            };
          }
          return sch;
        })
      );

      // Update automations
      setAutomations((prev) => {
        const lec = lecturers.find((l) => l.id === data.lecturerId);
        const crs = courses.find((c) => c.id === data.courseId);

        return prev.map((a) => {
          if (affectedIds.includes(a.scheduleId)) {
            const sch = schedules.find((s) => s.id === a.scheduleId);
            const schScheduledAt = data.autoChat ? calculateHMinusOne(sch?.date || a.scheduledAt, '08:00') : null;
            const msgBody = generateMessageBody(lec, crs, { ...(sch || {}), ...data });

            return {
              ...a,
              lecturerId: data.lecturerId,
              courseId: data.courseId,
              phoneNumber: lec?.phone || a.phoneNumber,
              scheduledAt: schScheduledAt,
              message: msgBody,
              status: data.autoChat ? (a.status === 'sent' ? 'sent' : 'scheduled') : 'cancelled'
            };
          }
          return a;
        });
      });

      addToast(`Seluruh (${affectedIds.length}) pertemuan rutin perkuliahan berhasil diperbarui.`);
      return;
    }

    let updatedSchedule = null;

    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === id) {
          updatedSchedule = { 
            ...sch, 
            ...data, 
            dayOfWeek: data.dayOfWeek || getDayNameFromDate(data.date),
            autoChat: Boolean(data.autoChat), 
            scheduledAt 
          };
          return updatedSchedule;
        }
        return sch;
      })
    );

    // Sync automations
    setAutomations((prev) => {
      const existing = prev.find((a) => a.scheduleId === id);
      const lec = lecturers.find((l) => l.id === data.lecturerId);
      const crs = courses.find((c) => c.id === data.courseId);

      if (data.autoChat) {
        const msgBody = generateMessageBody(lec, crs, data);
        if (existing) {
          return prev.map((a) =>
            a.scheduleId === id
              ? {
                  ...a,
                  lecturerId: data.lecturerId,
                  courseId: data.courseId,
                  phoneNumber: lec?.phone || a.phoneNumber,
                  scheduledAt,
                  status: 'scheduled',
                  message: msgBody
                }
              : a
          );
        } else {
          const newAuto = {
            id: 'msg-' + Date.now(),
            scheduleId: id,
            lecturerId: data.lecturerId,
            courseId: data.courseId,
            phoneNumber: lec?.phone || '',
            message: msgBody,
            scheduledAt,
            sentAt: null,
            status: 'scheduled',
            providerMessageId: 'wam_msg_' + Date.now(),
            errorMessage: null,
            createdAt: new Date().toISOString()
          };
          return [newAuto, ...prev];
        }
      } else {
        return prev.map((a) =>
          a.scheduleId === id && a.status === 'scheduled'
            ? { ...a, status: 'cancelled' }
            : a
        );
      }
    });

    addToast('Jadwal berhasil diperbarui.');

    const client = getSupabase();
    if (client && isSupabaseConfigured() && updatedSchedule) {
      try {
        await client.from('schedules').update(mapScheduleToDb(updatedSchedule)).eq('id', id);
        if (data.autoChat) {
          const existingAuto = automations.find((a) => a.scheduleId === id);
          const lec = lecturers.find((l) => l.id === data.lecturerId);
          const crs = courses.find((c) => c.id === data.courseId);
          const msgBody = generateMessageBody(lec, crs, data);

          if (existingAuto) {
            await client
              .from('scheduled_messages')
              .update({
                lecturer_id: data.lecturerId,
                course_id: data.courseId,
                phone_number: lec?.phone || existingAuto.phoneNumber,
                scheduled_at: scheduledAt,
                status: 'scheduled',
                message: msgBody,
                updated_at: new Date().toISOString()
              })
              .eq('schedule_id', id);
          }
        } else {
          await client
            .from('scheduled_messages')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('schedule_id', id)
            .eq('status', 'scheduled');
        }
      } catch (err) {
        console.error('Supabase updateSchedule error:', err);
      }
    }
  };

  const deleteSchedule = async (id, deleteAllRecurring = false) => {
    const target = schedules.find((s) => s.id === id);
    const groupId = target?.recurringGroupId;

    if (deleteAllRecurring && groupId) {
      const idsToDelete = schedules.filter((s) => s.recurringGroupId === groupId).map((s) => s.id);
      setSchedules((prev) => prev.filter((s) => s.recurringGroupId !== groupId));
      setAutomations((prev) =>
        prev.map((a) =>
          idsToDelete.includes(a.scheduleId) && a.status === 'scheduled'
            ? { ...a, status: 'cancelled' }
            : a
        )
      );
      addToast(`Seluruh rangkaian (${idsToDelete.length} pertemuan) jadwal perkuliahan berhasil dihapus.`);

      const client = getSupabase();
      if (client && isSupabaseConfigured()) {
        try {
          await client.from('schedules').delete().in('id', idsToDelete);
        } catch (err) {
          console.error('Supabase deleteSchedule recurring error:', err);
        }
      }
      return;
    }

    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setAutomations((prev) =>
      prev.map((a) =>
        a.scheduleId === id && a.status === 'scheduled'
          ? { ...a, status: 'cancelled' }
          : a
      )
    );
    addToast('Jadwal dihapus dan pesan otomatis terkait telah dibatalkan.');

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('schedules').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase deleteSchedule error:', err);
      }
    }
  };

  // --- AUTOMATION ACTIONS ---
  const cancelAutomation = async (id) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
    addToast('Pesan otomatis berhasil dibatalkan.', 'info');

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client
          .from('scheduled_messages')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.error('Supabase cancelAutomation error:', err);
      }
    }
  };

  const rescheduleAutomation = async (id, newScheduledAt) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, scheduledAt: newScheduledAt, status: 'scheduled', errorMessage: null }
          : a
      )
    );
    addToast('Jadwal pengiriman pesan berhasil diubah.');

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client
          .from('scheduled_messages')
          .update({
            scheduled_at: newScheduledAt,
            status: 'scheduled',
            error_message: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.error('Supabase rescheduleAutomation error:', err);
      }
    }
  };

  const sendAutomationNow = async (id) => {
    const target = automations.find((a) => a.id === id);
    if (!target) return;

    const lec = lecturers.find((l) => l.id === target.lecturerId);
    const crs = courses.find((c) => c.id === target.courseId);

    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'sent',
              sentAt: new Date().toISOString(),
              errorMessage: null
            }
          : a
      )
    );

    const newHistory = {
      id: 'hist-' + Date.now(),
      lecturerId: target.lecturerId,
      lecturerName: lec ? `${lec.name}${lec.title ? ', ' + lec.title : ''}` : 'Dosen',
      courseName: crs?.name || 'Mata Kuliah',
      phone: target.phoneNumber,
      type: 'auto_scheduled',
      message: target.message,
      sentAt: formatScheduledTimestamp(new Date().toISOString()),
      status: 'delivered',
      providerId: target.providerMessageId || 'wam_msg_' + Date.now()
    };
    setChatHistory((prev) => [newHistory, ...prev]);
    addToast(`Pesan berhasil dikirim ke WhatsApp ${lec?.name || 'Dosen'}!`);

    // Kirim pesan nyata melalui WhatsApp Web jika terhubung
    if (whatsAppStatus.isConnected) {
      whatsappService.sendMessage({ to: target.phoneNumber, message: target.message })
        .then(() => {
          console.log('[AutoChat] Pesan nyata WhatsApp berhasil terkirim!');
        })
        .catch((err) => {
          console.warn('[AutoChat] Gagal mengirim pesan nyata via WhatsApp Web:', err.message);
          addToast(`Peringatan WhatsApp Web: ${err.message}`, 'warning');
        });
    }

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client
          .from('scheduled_messages')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        await client.from('chat_history').insert(mapChatHistoryToDb(newHistory));
      } catch (err) {
        console.error('Supabase sendAutomationNow error:', err);
      }
    }
  };

  // --- TEMPLATE ACTIONS ---
  const addTemplate = async (data) => {
    const newTpl = {
      ...data,
      id: 'tpl-' + Date.now(),
      isDefault: false
    };
    setTemplates((prev) => [...prev, newTpl]);
    addToast('Template pesan berhasil ditambahkan.');

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('message_templates').insert(mapTemplateToDb(newTpl));
      } catch (err) {
        console.error('Supabase addTemplate error:', err);
      }
    }

    return newTpl;
  };

  const updateTemplate = async (id, data) => {
    let updatedTpl = null;
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTpl = { ...t, ...data };
          return updatedTpl;
        }
        return t;
      })
    );
    addToast('Template pesan berhasil diperbarui.');

    const client = getSupabase();
    if (client && isSupabaseConfigured() && updatedTpl) {
      try {
        await client
          .from('message_templates')
          .update(mapTemplateToDb(updatedTpl))
          .eq('id', id);
      } catch (err) {
        console.error('Supabase updateTemplate error:', err);
      }
    }
  };

  const deleteTemplate = async (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addToast('Template pesan telah dihapus.');

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('message_templates').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase deleteTemplate error:', err);
      }
    }
  };

  // --- CHAT ACTIONS ---
  const sendManualChat = async ({ lecturerId, courseId, message }) => {
    const lec = lecturers.find((l) => l.id === lecturerId);
    const crs = courses.find((c) => c.id === courseId);

    const newHistory = {
      id: 'hist-' + Date.now(),
      lecturerId,
      lecturerName: lec ? `${lec.name}${lec.title ? ', ' + lec.title : ''}` : 'Dosen',
      courseName: crs?.name || 'Mata Kuliah',
      phone: lec?.phone || '',
      type: 'manual_chat',
      message,
      sentAt: formatScheduledTimestamp(new Date().toISOString()),
      status: 'delivered',
      providerId: 'wam_msg_' + Date.now()
    };

    setChatHistory((prev) => [newHistory, ...prev]);
    addToast(`Pesan berhasil dikirim ke WhatsApp ${lec?.name || 'Dosen'}!`);

    // Kirim pesan nyata melalui WhatsApp Web jika terhubung
    if (whatsAppStatus.isConnected) {
      whatsappService.sendMessage({ to: lec?.phone, message })
        .then(() => {
          console.log('[ManualChat] Pesan nyata WhatsApp berhasil terkirim!');
        })
        .catch((err) => {
          console.warn('[ManualChat] Gagal mengirim pesan nyata via WhatsApp Web:', err.message);
          addToast(`Peringatan WhatsApp Web: ${err.message}`, 'warning');
        });
    }

    const client = getSupabase();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('chat_history').insert(mapChatHistoryToDb(newHistory));
      } catch (err) {
        console.error('Supabase sendManualChat error:', err);
      }
    }

    return newHistory;
  };

  // --- AI DRAFT GENERATOR ---
  const generateAiDraft = ({ prompt, lecturerId, courseId }) => {
    const lec = lecturers.find((l) => l.id === lecturerId);
    const crs = courses.find((c) => c.id === courseId);
    const lecName = lec ? `${lec.name}${lec.title ? ', ' + lec.title : ''}` : 'Bapak/Ibu Dosen';
    const crsName = crs ? crs.name : 'perkuliahan';

    const p = prompt.toLowerCase();
    let draft = '';

    if (p.includes('jadwal') || p.includes('tetap') || p.includes('apakah besok')) {
      draft = `Selamat pagi, ${lecName}. Mohon izin bertanya, apakah perkuliahan ${crsName} besok tetap dilaksanakan sesuai jadwal? Terima kasih banyak atas waktu dan arahannya, ${lec?.name?.includes('Dr.') || lec?.name?.includes('Prof.') ? 'Bapak/Ibu' : 'Pak/Bu'}.`;
    } else if (p.includes('izin') || p.includes('tidak hadir') || p.includes('sakit')) {
      draft = `Selamat pagi, ${lecName}. Saya ${settings.studentName} (NIM: ${settings.studentNim}) dari kelas ${crsName}. Mohon izin menyampaikan bahwa pada pertemuan kuliah berikutnya saya berhalangan hadir dikarenakan kondisi kesehatan yang kurang baik/keperluan mendesak. Surat keterangan akan saya lampirkan sesegera mungkin. Terima kasih banyak atas pengertiannya.`;
    } else if (p.includes('tugas') || p.includes('pengumpulan') || p.includes('deadline')) {
      draft = `Selamat siang, ${lecName}. Mohon maaf mengganggu waktunya. Saya ${settings.studentName} perwakilan kelas ${crsName}, izin menanyakan terkait tenggat waktu dan format pengumpulan tugas kelompok yang telah diberikan. Apakah pengumpulan dilakukan melalui portal atau email? Terima kasih banyak, ${lec?.name ? 'Pak/Bu' : 'Bapak/Ibu'}.`;
    } else if (p.includes('ruang') || p.includes('kelas') || p.includes('lab')) {
      draft = `Selamat pagi, ${lecName}. Mohon izin konfirmasi mengenai ruangan untuk perkuliahan ${crsName} besok, apakah perkuliahan tetap bertempat di ruangan sebelumnya atau ada pengalihan ke laboratorium? Terima kasih atas informasinya.`;
    } else if (p.includes('bimbingan') || p.includes('skripsi') || p.includes('proposal')) {
      draft = `Selamat pagi, ${lecName}. Mohon maaf mengganggu aktivitas Bapak/Ibu. Saya ${settings.studentName} (NIM: ${settings.studentNim}) bermaksud memohon arahan dan bimbingan terkait progres ${crsName}. Apakah Bapak/Ibu berkenan meluangkan waktu untuk sesi bimbingan minggu ini? Terima kasih banyak atas kesediaannya.`;
    } else {
      draft = `Selamat pagi, ${lecName}. Mohon izin menghubungi terkait mata kuliah ${crsName}. Mengenai hal "${prompt.trim()}", mohon arahan dan petunjuk lebih lanjut dari Bapak/Ibu. Terima kasih banyak atas perhatiannya.`;
    }

    return draft;
  };

  return (
    <DataContext.Provider
      value={{
        // Data lists (clean & empty by default)
        lecturers,
        courses,
        schedules,
        automations,
        templates,
        chatHistory,
        settings,
        setSettings,
        toasts,
        addToast,
        removeToast,

        // Supabase Status & Sync Actions
        supabaseStatus,
        isLoadingDb,
        syncWithSupabase,
        configureSupabase,
        clearAllData,

        // WhatsApp Integration State & Actions
        whatsAppStatus,
        isWaModalOpen,
        openWaModal,
        closeWaModal,
        refreshWhatsAppStatus,
        connectWhatsApp,
        disconnectWhatsApp,
        sendTestWhatsApp,

        // Actions
        addLecturer,
        updateLecturer,
        deleteLecturer,
        addCourse,
        updateCourse,
        deleteCourse,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        cancelAutomation,
        rescheduleAutomation,
        sendAutomationNow,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        sendManualChat,
        generateAiDraft,
        openConfirm
      }}
    >
      {children}
      <ConfirmDialog {...confirmDialog} onClose={closeConfirm} />
      <WhatsAppModal isOpen={isWaModalOpen} onClose={closeWaModal} />
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext) || {};
