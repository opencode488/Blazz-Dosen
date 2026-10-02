import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';
import {
  calculateHMinusOne,
  formatScheduledTimestamp,
  formatIndonesianDate,
  DAYS_ID,
  getDayNameFromDate,
  getNextDateForDay,
  generateWeeklyDates
} from '../../utils/dateUtils';
import { Clock, Calendar, Bell, Sparkles, Repeat, Check, AlertCircle } from 'lucide-react';

export default function ScheduleModal({ isOpen, onClose, schedule = null }) {
  const { lecturers, courses, addSchedule, updateSchedule } = useData();

  // Mode: 'weekly' (Rutin Mingguan) | 'single' (Sekali / Tanggal Khusus)
  const [scheduleType, setScheduleType] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('Senin');
  const [repeatSemester, setRepeatSemester] = useState(true);
  const [repeatWeeks, setRepeatWeeks] = useState(14);
  const [applyToAllRecurring, setApplyToAllRecurring] = useState(true);

  const [formData, setFormData] = useState({
    courseId: '',
    lecturerId: '',
    date: '',
    startTime: '08:00',
    endTime: '09:40',
    room: '',
    notes: '',
    autoChat: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (schedule) {
      const detectedDay = schedule.dayOfWeek || getDayNameFromDate(schedule.date) || 'Senin';
      setDayOfWeek(detectedDay);
      setScheduleType(schedule.recurringGroupId ? 'weekly' : 'single');
      setRepeatSemester(false);
      setFormData({
        courseId: schedule.courseId || '',
        lecturerId: schedule.lecturerId || '',
        date: schedule.date || '',
        startTime: schedule.startTime || '08:00',
        endTime: schedule.endTime || '09:40',
        room: schedule.room || '',
        notes: schedule.notes || '',
        autoChat: schedule.autoChat ?? true,
      });
    } else {
      const todayDay = getDayNameFromDate(new Date().toISOString().split('T')[0]) || 'Senin';
      const initialDay = todayDay === 'Minggu' ? 'Senin' : todayDay;
      const initialDate = getNextDateForDay(initialDay);
      setDayOfWeek(initialDay);
      setScheduleType('weekly');
      setRepeatSemester(true);
      setRepeatWeeks(14);
      setFormData({
        courseId: courses[0]?.id || '',
        lecturerId: lecturers[0]?.id || '',
        date: initialDate,
        startTime: '08:00',
        endTime: '09:40',
        room: 'Lab Komputer 2',
        notes: '',
        autoChat: true,
      });
    }
    setErrors({});
  }, [schedule, isOpen, courses, lecturers]);

  const handleDayChange = (selectedDay) => {
    setDayOfWeek(selectedDay);
    const calculatedDate = getNextDateForDay(selectedDay);
    setFormData((prev) => ({
      ...prev,
      date: calculatedDate
    }));
  };

  const validate = () => {
    const err = {};
    if (!formData.courseId) err.courseId = 'Pilih mata kuliah';
    if (!formData.lecturerId) err.lecturerId = 'Pilih dosen pengampu';
    if (!formData.date) err.date = 'Tentukan tanggal perkuliahan';
    if (!formData.startTime) err.startTime = 'Tentukan jam mulai';
    if (!formData.endTime) err.endTime = 'Tentukan jam selesai';
    if (!formData.room.trim()) err.room = 'Ruang kelas wajib diisi';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const weeklyDates = formData.date && repeatWeeks > 1 
    ? generateWeeklyDates(formData.date, repeatWeeks) 
    : [formData.date];
  const lastMeetingDate = weeklyDates[weeklyDates.length - 1];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (schedule) {
      updateSchedule(
        schedule.id,
        {
          ...formData,
          dayOfWeek
        },
        applyToAllRecurring
      );
    } else {
      if (scheduleType === 'weekly' && repeatSemester && repeatWeeks > 1) {
        addSchedule({
          ...formData,
          scheduleType: 'weekly',
          dayOfWeek,
          repeatWeeks: Number(repeatWeeks),
          weeklyDates
        });
      } else {
        addSchedule({
          ...formData,
          scheduleType,
          dayOfWeek
        });
      }
    }
    onClose();
  };

  const calculatedH1 = formData.date ? calculateHMinusOne(formData.date, '08:00') : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={schedule ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
      description="Atur jadwal kuliah rutin mingguan atau khusus dengan pengingat otomatis WhatsApp"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Schedule Type Segmented Tabs (Only when creating new schedule) */}
        {!schedule && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Tipe Penjadwalan:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setScheduleType('weekly')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  scheduleType === 'weekly'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Repeat className="w-4 h-4 text-indigo-500 dark:text-indigo-200" />
                <span>Rutin Mingguan (1 Semester)</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('single')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  scheduleType === 'single'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Tanggal Khusus / Sekali</span>
              </button>
            </div>
          </div>
        )}

        {/* Course & Lecturer Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.code} - {crs.name} ({crs.credits} SKS)
                </option>
              ))}
            </select>
            {errors.courseId && <p className="text-xs text-rose-500 mt-1">{errors.courseId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Dosen Pengampu <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.lecturerId}
              onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Dosen --</option>
              {lecturers.map((lec) => (
                <option key={lec.id} value={lec.id}>
                  {lec.name}{lec.title ? ', ' + lec.title : ''}
                </option>
              ))}
            </select>
            {errors.lecturerId && <p className="text-xs text-rose-500 mt-1">{errors.lecturerId}</p>}
          </div>
        </div>

        {/* Weekly Day Selector (when scheduleType is weekly) */}
        {scheduleType === 'weekly' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Hari Perkuliahan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Berulang setiap hari {dayOfWeek}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => {
                const isSelected = dayOfWeek === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayChange(day)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Semester Batch Generator Box (When creating new weekly schedule) */}
        {!schedule && scheduleType === 'weekly' && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-indigo-100/70 dark:border-indigo-900/50">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Otomatisasi 1 Semester Penuh
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Jumlah:
                </label>
                <select
                  value={repeatWeeks}
                  onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                  className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs px-2.5 py-1 font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none"
                >
                  <option value={14}>14 Pertemuan (1 Semester Standar)</option>
                  <option value={16}>16 Pertemuan (Termasuk UTS/UAS)</option>
                  <option value={8}>8 Pertemuan (Setengah Semester)</option>
                  <option value={1}>1 Pertemuan (Pekan Ini Saja)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Mulai Pertemuan 1 (Tanggal):
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormData({ ...formData, date: newDate });
                    const newDay = getDayNameFromDate(newDate);
                    if (newDay && newDay !== 'Minggu') setDayOfWeek(newDay);
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-indigo-100/70 dark:border-indigo-900/40">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-slate-400">Pertemuan Terakhir:</div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">
                    {lastMeetingDate ? formatIndonesianDate(lastMeetingDate) : '-'}
                  </div>
                </div>
              </div>
            </div>

            {repeatWeeks > 1 && (
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                💡 <strong>{repeatWeeks} sesi perkuliahan</strong> setiap hari <strong>{dayOfWeek}</strong> akan langsung otomatis terjadwal. Tidak perlu lagi input manual setiap minggu!
              </p>
            )}
          </div>
        )}

        {/* Date & Time Pickers for Single Schedule or Editing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(schedule || scheduleType === 'single') && (
            <div>
              <Input
                id="date"
                type="date"
                label="Tanggal Kuliah"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={errors.date}
                required
              />
            </div>
          )}
          <div>
            <Input
              id="startTime"
              type="time"
              label="Jam Mulai"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              error={errors.startTime}
              required
            />
          </div>
          <div>
            <Input
              id="endTime"
              type="time"
              label="Jam Selesai"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              error={errors.endTime}
              required
            />
          </div>
          {scheduleType === 'weekly' && !schedule && (
            <div>
              <Input
                id="room"
                label="Ruang Kelas"
                placeholder="Lab Komputer 2"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                error={errors.room}
                required
              />
            </div>
          )}
        </div>

        {/* Room input if single or edit */}
        {(schedule || scheduleType === 'single') && (
          <Input
            id="room"
            label="Ruang Kelas / Laboratorium"
            placeholder="Contoh: Lab Komputer 2 / Ruang 402"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            error={errors.room}
            required
          />
        )}

        {/* Edit mode: update all recurring meetings checkbox */}
        {schedule && schedule.recurringGroupId && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5" /> Jadwal Rutin Mingguan ({schedule.notes || 'Pertemuan'})
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={applyToAllRecurring}
                onChange={(e) => setApplyToAllRecurring(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Terapkan perubahan jam & ruang ke semua pertemuan terkait</span>
            </label>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Catatan Perkuliahan
          </label>
          <textarea
            rows={2}
            placeholder="Materi pertemuan, kuis, atau instruksi praktikum..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        {/* Auto Chat Toggle & Calculated Time */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Fitur Auto Chat WhatsApp
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Otomatis kirim pesan pengingat ke dosen via WhatsApp
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoChat}
                onChange={(e) => setFormData({ ...formData, autoChat: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {formData.autoChat ? (
            <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/40">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <span>Waktu Pengiriman Pesan: </span>
                <span className="font-bold underline">
                  {calculatedH1 ? formatScheduledTimestamp(calculatedH1) : 'H-1 pukul 08.00 WIB'}
                </span>
                {!schedule && scheduleType === 'weekly' && repeatWeeks > 1 && (
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    (Berlaku otomatis setiap minggu sebelum jadwal kuliah)
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Auto Chat dimatikan. Tidak ada pesan yang akan dijadwalkan secara otomatis.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary">
            {schedule 
              ? 'Simpan Perubahan' 
              : scheduleType === 'weekly' && repeatWeeks > 1 
              ? `Jadwalkan ${repeatWeeks} Pertemuan Semester` 
              : 'Jadwalkan Kuliah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
