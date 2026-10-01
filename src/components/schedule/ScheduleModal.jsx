import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useData } from '../../context/DataContext';
import { calculateHMinusOne, formatScheduledTimestamp } from '../../utils/dateUtils';
import { Clock, Calendar, Bell, Sparkles } from 'lucide-react';

export default function ScheduleModal({ isOpen, onClose, schedule = null }) {
  const { lecturers, courses, addSchedule, updateSchedule } = useData();

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
      setFormData({
        courseId: courses[0]?.id || '',
        lecturerId: lecturers[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '09:40',
        room: 'Lab Komputer 2',
        notes: '',
        autoChat: true,
      });
    }
    setErrors({});
  }, [schedule, isOpen, courses, lecturers]);

  const validate = () => {
    const err = {};
    if (!formData.courseId) err.courseId = 'Pilih mata kuliah';
    if (!formData.lecturerId) err.lecturerId = 'Pilih dosen pengampu';
    if (!formData.date) err.date = 'Pilih tanggal kuliah';
    if (!formData.startTime) err.startTime = 'Tentukan jam mulai';
    if (!formData.endTime) err.endTime = 'Tentukan jam selesai';
    if (!formData.room.trim()) err.room = 'Ruang kelas wajib diisi';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (schedule) {
      updateSchedule(schedule.id, formData);
    } else {
      addSchedule(formData);
    }
    onClose();
  };

  const calculatedH1 = formData.date ? calculateHMinusOne(formData.date, '08:00') : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={schedule ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah Baru'}
      description="Jadwal akan disinkronisasikan dengan sistem pengingat otomatis WhatsApp"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Date & Time Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        </div>

        {/* Room & Notes */}
        <Input
          id="room"
          label="Ruang Kelas / Laboratorium"
          placeholder="Contoh: Lab Komputer 2 / Ruang 402"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          error={errors.room}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Catatan Perkuliahan
          </label>
          <textarea
            rows={2}
            placeholder="Materi pertemuan, kuis, atau instruksi praktikum..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
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
            {schedule ? 'Simpan Perubahan' : 'Jadwalkan Kuliah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
