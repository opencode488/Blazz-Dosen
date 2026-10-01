import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Eye,
  Sparkles,
  Info,
  HelpCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { renderTemplate, AVAILABLE_VARIABLES } from '../utils/templateEngine';

export default function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, addToast, lecturers, courses } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(templates[0] || null);
  const [copiedId, setCopiedId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Jadwal',
    content: '',
  });

  const sampleVariables = {
    lecturerName: 'Dr. Budi Santoso, M.Kom.',
    courseName: 'Basis Data',
    formattedDate: 'Senin, 5 Oktober 2026',
    startTime: '08.00',
    endTime: '09.40',
    room: 'Lab Komputer 2',
    studentName: 'Ahmad Dinur',
    studentNim: '220101089'
  };

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormData({
      title: '',
      category: 'Jadwal',
      content: 'Selamat pagi, {{nama_dosen}}. Mohon izin konfirmasi perkuliahan {{nama_matkul}} besok pukul {{jam_mulai}} di {{ruang}}.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tpl) => {
    setEditingTemplate(tpl);
    setFormData({
      title: tpl.title,
      category: tpl.category || 'Jadwal',
      content: tpl.content
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Hapus template "${title}"?`)) {
      deleteTemplate(id);
      if (selectedPreview?.id === id) {
        setSelectedPreview(templates[0] || null);
      }
    }
  };

  const handleCopy = (tpl) => {
    const text = renderTemplate(tpl.content, sampleVariables);
    navigator.clipboard.writeText(text);
    setCopiedId(tpl.id);
    addToast('Teks template berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
    } else {
      const created = addTemplate(formData);
      setSelectedPreview(created);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Template Pesan WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Format pesan baku dan otomatis menggunakan tag variabel dinamis
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Tambah Template
        </Button>
      </div>

      {/* Variable Tags Cheat Sheet */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Daftar Variabel Dinamis (Dynamic Tags)
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sistem akan otomatis mengganti tag di dalam tanda kurung kurawal <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{`{{...}}`}</code> dengan informasi jadwal dan dosen yang bersangkutan.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {AVAILABLE_VARIABLES.map((v) => (
            <div
              key={v.tag}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300"
              title={v.desc}
            >
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{v.tag}</span>
              <span className="text-[11px] text-slate-400 font-sans">({v.desc})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Templates List & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Templates List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((tpl) => {
              const isSelected = selectedPreview?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedPreview(tpl)}
                  className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                        {tpl.category || 'Umum'}
                      </span>
                      {tpl.isDefault && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {tpl.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-mono bg-slate-50/60 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {tpl.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(tpl);
                      }}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === tpl.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Salin Teks
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(tpl);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        title="Edit Template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!tpl.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(tpl.id, tpl.title);
                          }}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-600 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Variable Simulation Canvas */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Simulation Preview
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hasil pesan saat digabungkan dengan data kuliah nyata (Dr. Budi Santoso - Basis Data):
            </p>

            {selectedPreview ? (
              <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-none p-4 shadow-sm text-xs text-slate-800 dark:text-slate-100 leading-relaxed space-y-2">
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {selectedPreview.title}
                  </div>
                  <p className="whitespace-pre-line">
                    {renderTemplate(selectedPreview.content, sampleVariables)}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>Preview Live</span>
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Pilih salah satu template di samping untuk melihat preview.
              </div>
            )}

            {selectedPreview && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                icon={Copy}
                onClick={() => handleCopy(selectedPreview)}
              >
                Salin Hasil Pesan yang Telah Di-render
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template Pesan' : 'Tambah Template Baru'}
        description="Gunakan variabel seperti {{nama_dosen}} dan {{nama_matkul}}"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            label="Nama Template"
            placeholder="Contoh: Konfirmasi Jadwal Ujian"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Jadwal">Jadwal Perkuliahan</option>
              <option value="Akademik">Izin & Akademik</option>
              <option value="Tugas">Tugas & Praktikum</option>
              <option value="Bimbingan">Bimbingan Skripsi/Tugas Akhir</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Isi Template Pesan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                Gunakan tag variabel
              </span>
            </div>
            <textarea
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Selamat pagi, {{nama_dosen}}..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingTemplate ? 'Simpan Perubahan' : 'Tambah Template'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
