import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

export default function LecturerModal({ isOpen, onClose, onSubmit, lecturer = null }) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    status: 'Aktif',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lecturer) {
      setFormData({
        name: lecturer.name || '',
        title: lecturer.title || '',
        phone: lecturer.phone || '',
        email: lecturer.email || '',
        status: lecturer.status || 'Aktif',
        notes: lecturer.notes || '',
      });
    } else {
      setFormData({
        name: '',
        title: '',
        phone: '',
        email: '',
        status: 'Aktif',
        notes: '',
      });
    }
    setErrors({});
  }, [lecturer, isOpen]);

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Nama dosen wajib diisi';
    if (!formData.phone.trim()) {
      err.phone = 'Nomor WhatsApp wajib diisi';
    } else {
      const clean = normalizePhoneNumber(formData.phone);
      if (clean.length < 10 || clean.length > 15) {
        err.phone = 'Nomor WhatsApp tidak valid (format: 08... atau 62...)';
      }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      phone: normalizePhoneNumber(formData.phone)
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lecturer ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}
      description="Lengkapi informasi kontak dan akademik dosen pengampu"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              id="name"
              label="Nama Lengkap Dosen"
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
          </div>
          <div>
            <Input
              id="title"
              label="Gelar Akademik"
              placeholder="M.Kom."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              id="phone"
              label="Nomor WhatsApp"
              placeholder="081234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              helperText="Otomatis dinormalisasi ke 628..."
              error={errors.phone}
              required
            />
          </div>
          <div>
            <Input
              id="email"
              type="email"
              label="Email Kampus"
              placeholder="dosen@univ.ac.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Status Keaktifan
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Aktif">Aktif Mengajar</option>
            <option value="Cuti">Cuti / Tugas Belajar</option>
            <option value="Non-Aktif">Non-Aktif</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Catatan Tambahan
          </label>
          <textarea
            rows={3}
            placeholder="Keahlian, preferensi jam dihubungi, atau ruangan dosen..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary">
            {lecturer ? 'Simpan Perubahan' : 'Tambah Dosen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
