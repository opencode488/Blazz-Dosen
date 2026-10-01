import React, { useState } from 'react';
import { Plus, Search, BookOpen, Edit2, Trash2, Layers } from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

export default function Course() {
  const { courses, addCourse, updateCourse, deleteCourse, schedules, openConfirm } = useData();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({ code: '', name: '', credits: 3, notes: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crs) => {
    setEditingCourse(crs);
    setFormData({
      code: crs.code,
      name: crs.name,
      credits: crs.credits,
      notes: crs.notes || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    openConfirm({
      title: 'Hapus Mata Kuliah',
      message: 'Apakah Anda yakin ingin menghapus mata kuliah ini dari sistem?',
      itemName: name,
      note: 'Jadwal perkuliahan yang menggunakan mata kuliah ini dapat terpengaruh.',
      confirmText: 'Hapus Matkul',
      variant: 'danger',
      onConfirm: () => deleteCourse(id)
    });
  };

  const validate = () => {
    const err = {};
    if (!formData.code.trim()) err.code = 'Kode mata kuliah wajib diisi';
    if (!formData.name.trim()) err.name = 'Nama mata kuliah wajib diisi';
    if (!formData.credits || Number(formData.credits) <= 0) {
      err.credits = 'SKS minimal 1';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
    } else {
      addCourse(formData);
    }
    setIsModalOpen(false);
  };

  const filteredCourses = courses.filter((crs) => {
    const q = search.toLowerCase();
    return (
      crs.code.toLowerCase().includes(q) ||
      crs.name.toLowerCase().includes(q) ||
      (crs.notes && crs.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Data Mata Kuliah
          </h2>
          <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar mata kuliah perkuliahan semester aktif
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd} className="w-full sm:w-auto">
          Tambah Mata Kuliah
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama matkul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Courses */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            Mata kuliah tidak ditemukan
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Coba ubah kata kunci pencarian.' : 'Tambahkan mata kuliah baru terlebih dahulu.'}
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd} className="mt-4">
            Tambah Mata Kuliah
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((crs) => {
            const linkedSchedules = schedules.filter((s) => s.courseId === crs.id);
            return (
              <div
                key={crs.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                      {crs.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {crs.credits} SKS
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    {crs.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {crs.notes || 'Tidak ada catatan deskripsi mata kuliah.'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    {linkedSchedules.length} Sesi Jadwal
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(crs)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(crs.id, crs.name)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
        description="Kelola informasi kurikulum dan beban sks mata kuliah"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                id="code"
                label="Kode MK"
                placeholder="IF301"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                error={errors.code}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                id="credits"
                type="number"
                min="1"
                max="6"
                label="Beban SKS"
                placeholder="3"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                error={errors.credits}
                required
              />
            </div>
          </div>

          <Input
            id="name"
            label="Nama Mata Kuliah"
            placeholder="Contoh: Basis Data"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Catatan / Silabus Singkat
            </label>
            <textarea
              rows={3}
              placeholder="Deskripsi ruang lingkup materi, praktikum, dll..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingCourse ? 'Simpan Perubahan' : 'Tambah Mata Kuliah'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
