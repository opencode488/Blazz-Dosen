import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { normalizePhoneNumber } from '../../utils/phoneUtils';
import {
  MALE_AVATAR_PRESETS,
  FEMALE_AVATAR_PRESETS,
  isLikelyFemale
} from '../../utils/avatarUtils';
import { Upload, Sparkles, RefreshCw, Check } from 'lucide-react';

export default function LecturerModal({ isOpen, onClose, onSubmit, lecturer = null }) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    status: 'Aktif',
    notes: '',
    avatar: '',
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (lecturer) {
      setFormData({
        name: lecturer.name || '',
        title: lecturer.title || '',
        phone: lecturer.phone || '',
        email: lecturer.email || '',
        status: lecturer.status || 'Aktif',
        notes: lecturer.notes || '',
        avatar: lecturer.avatar || '',
      });
    } else {
      setFormData({
        name: '',
        title: '',
        phone: '',
        email: '',
        status: 'Aktif',
        notes: '',
        avatar: '',
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Ukuran foto maksimal 3MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({
        ...prev,
        avatar: uploadEvent.target.result
      }));
    };
    reader.readAsDataURL(file);
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

  const femaleGuess = isLikelyFemale(formData.name);
  const relevantPresets = femaleGuess
    ? [...FEMALE_AVATAR_PRESETS.slice(0, 4), ...MALE_AVATAR_PRESETS.slice(0, 4)]
    : [...MALE_AVATAR_PRESETS.slice(0, 4), ...FEMALE_AVATAR_PRESETS.slice(0, 4)];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lecturer ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}
      description="Lengkapi informasi kontak dan akademik dosen pengampu"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Selection & Preview Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <Avatar
                src={formData.avatar}
                name={formData.name || 'Dosen'}
                size="xl"
                rounded="rounded-2xl"
              />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Preview Foto
              </span>
            </div>

            <div className="flex-1 w-full space-y-2.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold cursor-pointer border border-indigo-200/60 dark:border-indigo-800 transition shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Unggah Foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: '' })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition shadow-2xs ${
                    formData.avatar === ''
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Foto otomatis yang bervariasi sesuai nama dosen"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Foto Otomatis (Unik)
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: 'initials' })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition shadow-2xs ${
                    formData.avatar === 'initials'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Gunakan inisial dengan latar belakang gradient modern"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Inisial Gradient
                </button>
              </div>

              {/* Quick Preset Selector */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-400 mb-1.5">
                  Atau pilih foto preset:
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 overflow-x-auto pb-1">
                  {relevantPresets.map((presetUrl, idx) => {
                    const isSelected = formData.avatar === presetUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: presetUrl })}
                        className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/40 scale-105'
                            : 'border-transparent hover:opacity-85 opacity-75'
                        }`}
                      >
                        <img
                          src={presetUrl}
                          alt={`Preset ${idx + 1}`}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        {isSelected && (
                          <span className="absolute inset-0 bg-indigo-600/50 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {errors.avatar && (
            <p className="text-xs text-rose-500 mt-2">{errors.avatar}</p>
          )}
        </div>

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
