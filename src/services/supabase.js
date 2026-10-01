import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from .env or localStorage (allowing user configuration from Settings UI)
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem('dosen_supabase_url') || '';
  const localKey = localStorage.getItem('dosen_supabase_anon_key') || '';

  const url = (localUrl && localUrl.trim() !== '') ? localUrl.trim() : envUrl.trim();
  const anonKey = (localKey && localKey.trim() !== '') ? localKey.trim() : envKey.trim();

  return { url, anonKey };
};

export const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('supabase.co') &&
    anonKey.length > 20
  );
};

let supabaseInstance = null;

export const initSupabaseClient = () => {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
      return null;
    }
  }
  supabaseInstance = null;
  return null;
};

// Initial instance
initSupabaseClient();

export const getSupabase = () => {
  if (!supabaseInstance && isSupabaseConfigured()) {
    initSupabaseClient();
  }
  return supabaseInstance;
};

export const saveSupabaseConfig = (url, anonKey) => {
  localStorage.setItem('dosen_supabase_url', (url || '').trim());
  localStorage.setItem('dosen_supabase_anon_key', (anonKey || '').trim());
  return initSupabaseClient();
};

export const testSupabaseConnection = async () => {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Kredensial Supabase (URL & Anon Key) belum diisi dengan lengkap.'
    };
  }

  try {
    const { error } = await client.from('lecturers').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet or permission denied
      if (error.code === '42P01') {
        return {
          success: false,
          code: 'TABLE_NOT_FOUND',
          message: 'Tabel database belum dibuat di Supabase. Silakan jalankan script SQL Schema di SQL Editor Supabase.'
        };
      }
      return {
        success: false,
        message: `Gagal mengakses Supabase: ${error.message}`
      };
    }
    return {
      success: true,
      message: 'Koneksi ke Supabase PostgreSQL berhasil terhubung!'
    };
  } catch (err) {
    return {
      success: false,
      message: `Error koneksi: ${err.message || 'Tidak dapat menghubungi server Supabase'}`
    };
  }
};

// ====================================================================
// DATA MAPPERS (CamelCase React <-> snake_case Supabase PostgreSQL)
// ====================================================================

export const mapLecturerFromDb = (row) => ({
  id: row.id,
  name: row.name,
  title: row.title || '',
  phone: row.phone,
  email: row.email || '',
  status: row.status || 'Aktif',
  notes: row.notes || '',
  avatar: row.avatar || '',
  createdAt: row.created_at ? row.created_at.split('T')[0] : ''
});

export const mapLecturerToDb = (lec) => ({
  id: lec.id,
  name: lec.name,
  title: lec.title || null,
  phone: lec.phone,
  email: lec.email || null,
  status: lec.status || 'Aktif',
  notes: lec.notes || null,
  avatar: lec.avatar || null,
  updated_at: new Date().toISOString()
});

export const mapCourseFromDb = (row) => ({
  id: row.id,
  code: row.code || '',
  name: row.name,
  credits: row.credits || 3,
  notes: row.notes || ''
});

export const mapCourseToDb = (crs) => ({
  id: crs.id,
  code: crs.code || null,
  name: crs.name,
  credits: Number(crs.credits) || 3,
  notes: crs.notes || null,
  updated_at: new Date().toISOString()
});

export const mapScheduleFromDb = (row) => ({
  id: row.id,
  courseId: row.course_id,
  lecturerId: row.lecturer_id,
  date: row.date,
  startTime: row.start_time,
  endTime: row.end_time,
  room: row.room,
  notes: row.notes || '',
  autoChat: Boolean(row.auto_chat),
  scheduledAt: row.scheduled_at,
  status: row.status || 'scheduled'
});

export const mapScheduleToDb = (sch) => ({
  id: sch.id,
  course_id: sch.courseId || null,
  lecturer_id: sch.lecturerId || null,
  date: sch.date,
  start_time: sch.startTime,
  end_time: sch.endTime,
  room: sch.room,
  notes: sch.notes || null,
  auto_chat: Boolean(sch.autoChat),
  scheduled_at: sch.scheduledAt || null,
  status: sch.status || 'scheduled',
  updated_at: new Date().toISOString()
});

export const mapTemplateFromDb = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category || 'Umum',
  content: row.content,
  isDefault: Boolean(row.is_default)
});

export const mapTemplateToDb = (tpl) => ({
  id: tpl.id,
  title: tpl.title,
  category: tpl.category || 'Umum',
  content: tpl.content,
  is_default: Boolean(tpl.isDefault),
  updated_at: new Date().toISOString()
});

export const mapAutomationFromDb = (row) => ({
  id: row.id,
  scheduleId: row.schedule_id,
  lecturerId: row.lecturer_id,
  courseId: row.course_id,
  phoneNumber: row.phone_number,
  message: row.message,
  scheduledAt: row.scheduled_at,
  sentAt: row.sent_at,
  status: row.status || 'scheduled',
  providerMessageId: row.provider_message_id,
  errorMessage: row.error_message,
  createdAt: row.created_at
});

export const mapAutomationToDb = (auto) => ({
  id: auto.id,
  schedule_id: auto.scheduleId || null,
  lecturer_id: auto.lecturerId || null,
  course_id: auto.courseId || null,
  phone_number: auto.phoneNumber,
  message: auto.message,
  scheduled_at: auto.scheduledAt || null,
  sent_at: auto.sentAt || null,
  status: auto.status || 'scheduled',
  provider_message_id: auto.providerMessageId || null,
  error_message: auto.errorMessage || null,
  updated_at: new Date().toISOString()
});

export const mapChatHistoryFromDb = (row) => ({
  id: row.id,
  lecturerId: row.lecturer_id,
  lecturerName: row.lecturer_name,
  courseName: row.course_name,
  phone: row.phone,
  type: row.type || 'manual_chat',
  message: row.message,
  sentAt: row.sent_at,
  status: row.status || 'delivered',
  providerId: row.provider_id
});

export const mapChatHistoryToDb = (hist) => ({
  id: hist.id,
  lecturer_id: hist.lecturerId || null,
  lecturer_name: hist.lecturerName || 'Dosen',
  course_name: hist.courseName || 'Mata Kuliah',
  phone: hist.phone || '',
  type: hist.type || 'manual_chat',
  message: hist.message,
  sent_at: hist.sentAt || new Date().toISOString(),
  status: hist.status || 'delivered',
  provider_id: hist.providerId || null
});

// ====================================================================
// SUPABASE DATABASE OPERATIONS
// ====================================================================

export const fetchAllFromSupabase = async () => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const [lecRes, crsRes, schRes, autoRes, tplRes, histRes] = await Promise.all([
      client.from('lecturers').select('*').order('created_at', { ascending: false }),
      client.from('courses').select('*').order('created_at', { ascending: false }),
      client.from('schedules').select('*').order('date', { ascending: true }),
      client.from('scheduled_messages').select('*').order('created_at', { ascending: false }),
      client.from('message_templates').select('*').order('created_at', { ascending: false }),
      client.from('chat_history').select('*').order('created_at', { ascending: false })
    ]);

    return {
      lecturers: (lecRes.data || []).map(mapLecturerFromDb),
      courses: (crsRes.data || []).map(mapCourseFromDb),
      schedules: (schRes.data || []).map(mapScheduleFromDb),
      automations: (autoRes.data || []).map(mapAutomationFromDb),
      templates: (tplRes.data || []).map(mapTemplateFromDb),
      chatHistory: (histRes.data || []).map(mapChatHistoryFromDb)
    };
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return null;
  }
};

export const clearSupabaseDatabase = async () => {
  const client = getSupabase();
  if (!client) return { success: true, count: 0 };

  try {
    // Delete in order to respect foreign key constraints
    await client.from('chat_history').delete().neq('id', '');
    await client.from('scheduled_messages').delete().neq('id', '');
    await client.from('schedules').delete().neq('id', '');
    await client.from('courses').delete().neq('id', '');
    await client.from('lecturers').delete().neq('id', '');
    await client.from('message_templates').delete().neq('id', '');

    return { success: true };
  } catch (err) {
    console.error('Error emptying Supabase database:', err);
    return { success: false, error: err.message };
  }
};
