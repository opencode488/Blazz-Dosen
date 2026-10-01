import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  Phone,
  LayoutGrid,
  List
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LecturerModal from '../components/lecturer/LecturerModal';
import Modal from '../components/ui/Modal';
import { maskPhoneNumber, formatPhoneNumber } from '../utils/phoneUtils';

export default function Lecturer() {
  const navigate = useNavigate();
  const { lecturers, addLecturer, updateLecturer, deleteLecturer, openConfirm } = useData();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [unmaskedIds, setUnmaskedIds] = useState({});

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [viewingLecturer, setViewingLecturer] = useState(null);

  const toggleMask = (id) => {
    setUnmaskedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredLecturers = lecturers.filter((lec) => {
    const q = search.toLowerCase();
    return (
      lec.name.toLowerCase().includes(q) ||
      (lec.title && lec.title.toLowerCase().includes(q)) ||
      (lec.email && lec.email.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingLecturer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lec) => {
    setEditingLecturer(lec);
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    openConfirm({
      title: 'Hapus Data Dosen',
      message: 'Apakah Anda yakin ingin menghapus data dosen ini dari sistem?',
      itemName: name,
      note: 'Jadwal perkuliahan yang telah terkait akan tetap tersimpan.',
      confirmText: 'Hapus Dosen',
      variant: 'danger',
      onConfirm: () => deleteLecturer(id)
    });
  };

  const handleFormSubmit = (data) => {
    if (editingLecturer) {
      updateLecturer(editingLecturer.id, data);
    } else {
      addLecturer(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Data Dosen Pengampu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola kontak WhatsApp dan informasi akademik dosen untuk pengingat jadwal
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Tambah Dosen
        </Button>
      </div>

      {/* Control Bar: Search & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama dosen, gelar, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Tampilan Tabel"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Tampilan Kartu"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {filteredLecturers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            Tidak ada data dosen ditemukan
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Coba ubah kata kunci pencarian Anda.' : 'Mulai dengan menambahkan data dosen pertama.'}
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd} className="mt-4">
            Tambah Dosen
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Nama Dosen</th>
                  <th className="py-3.5 px-4">Gelar</th>
                  <th className="py-3.5 px-4">Nomor WhatsApp</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLecturers.map((lec) => {
                  const isUnmasked = Boolean(unmaskedIds[lec.id]);
                  return (
                    <tr key={lec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {lec.name}
                          </div>
                          {lec.notes && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {lec.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {lec.title || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">
                            {isUnmasked ? formatPhoneNumber(lec.phone) : maskPhoneNumber(lec.phone)}
                          </span>
                          <button
                            onClick={() => toggleMask(lec.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                            title={isUnmasked ? 'Sembunyikan nomor' : 'Tampilkan nomor'}
                          >
                            {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400">Terenkripsi</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {lec.email ? (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {lec.email}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={lec.status === 'Aktif' ? 'success' : 'default'}
                          dot={lec.status === 'Aktif'}
                        >
                          {lec.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/chat?lecturerId=${lec.id}`)}
                            title="Chat Dosen"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 transition cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewingLecturer(lec)}
                            title="Lihat Detail"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(lec)}
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lec.id, lec.name)}
                            title="Hapus"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLecturers.map((lec) => {
            const isUnmasked = Boolean(unmaskedIds[lec.id]);
            return (
              <div
                key={lec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white leading-snug">
                        {lec.name}
                      </h4>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {lec.title || 'Dosen'}
                      </span>
                    </div>
                    <Badge variant={lec.status === 'Aktif' ? 'success' : 'default'} dot={lec.status === 'Aktif'} size="sm">
                      {lec.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp:
                      </span>
                      <div className="flex items-center gap-1 font-mono font-semibold text-slate-700 dark:text-slate-200">
                        <span>{isUnmasked ? formatPhoneNumber(lec.phone) : maskPhoneNumber(lec.phone)}</span>
                        <button
                          onClick={() => toggleMask(lec.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          {isUnmasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email:
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                        {lec.email || '-'}
                      </span>
                    </div>

                    {lec.notes && (
                      <p className="text-slate-400 italic pt-1 text-[11px] line-clamp-2">
                        "{lec.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(lec)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lec.id, lec.name)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={MessageSquare}
                    onClick={() => navigate(`/chat?lecturerId=${lec.id}`)}
                  >
                    Chat
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Lecturer Modal */}
      <LecturerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        lecturer={editingLecturer}
      />

      {/* View Lecturer Detail Modal */}
      {viewingLecturer && (
        <Modal
          isOpen={Boolean(viewingLecturer)}
          onClose={() => setViewingLecturer(null)}
          title="Profil Lengkap Dosen"
        >
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {viewingLecturer.name}
                </h3>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {viewingLecturer.title || 'Dosen'}
                </p>
              </div>
              <Badge variant={viewingLecturer.status === 'Aktif' ? 'success' : 'default'} size="sm">
                {viewingLecturer.status}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400">WhatsApp (Normalized):</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                  {formatPhoneNumber(viewingLecturer.phone)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400">Email Kampus:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {viewingLecturer.email || '-'}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-1">Catatan Khusus:</span>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  {viewingLecturer.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setViewingLecturer(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                icon={MessageSquare}
                onClick={() => {
                  navigate(`/chat?lecturerId=${viewingLecturer.id}`);
                  setViewingLecturer(null);
                }}
              >
                Mulai Chat AI
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
