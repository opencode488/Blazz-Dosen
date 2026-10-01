import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  RotateCw,
  ClockAlert,
  Calendar,
  Check,
  Edit3,
  MessageSquare,
  ChevronDown,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatIndonesianDate, formatScheduledTimestamp } from '../utils/dateUtils';
import { formatPhoneNumber } from '../utils/phoneUtils';

export default function ChatAssistant() {
  const [searchParams] = useSearchParams();
  const { lecturers, courses, schedules, generateAiDraft, sendManualChat, addToast, addSchedule } = useData();

  // Selected context
  const [selectedLecturerId, setSelectedLecturerId] = useState(
    searchParams.get('lecturerId') || lecturers[0]?.id || ''
  );
  const [selectedCourseId, setSelectedCourseId] = useState(
    searchParams.get('courseId') || courses[0]?.id || ''
  );

  const [inputPrompt, setInputPrompt] = useState(
    'Saya ingin memastikan apakah besok kuliah tetap dilaksanakan.'
  );
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Synchronize initial draft
  useEffect(() => {
    handleGenerateDraft('Saya ingin memastikan apakah besok kuliah tetap dilaksanakan.');
  }, [selectedLecturerId, selectedCourseId]);

  const selectedLecturer = lecturers.find((l) => l.id === selectedLecturerId);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const matchedSchedule = schedules.find(
    (s) => s.lecturerId === selectedLecturerId && s.courseId === selectedCourseId
  ) || schedules.find((s) => s.lecturerId === selectedLecturerId) || schedules[0];

  const handleGenerateDraft = (promptText = inputPrompt) => {
    setIsGenerating(true);
    setTimeout(() => {
      const draft = generateAiDraft({
        prompt: promptText,
        lecturerId: selectedLecturerId,
        courseId: selectedCourseId,
      });
      setGeneratedDraft(draft);
      setIsGenerating(false);
    }, 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    addToast('Draf pesan berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendNow = () => {
    if (!generatedDraft.trim()) return;
    sendManualChat({
      lecturerId: selectedLecturerId,
      courseId: selectedCourseId,
      message: generatedDraft
    });
  };

  const quickPrompts = [
    'Saya ingin memastikan apakah besok kuliah tetap dilaksanakan.',
    'Izin tidak dapat hadir kuliah besok karena sakit.',
    'Menanyakan tenggat waktu dan format pengumpulan tugas.',
    'Konfirmasi ruangan kelas apakah di Lab atau di Ruang Teori.',
    'Permohonan waktu bimbingan proposal skripsi minggu ini.'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800/60 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>Generative AI WhatsApp Drafter</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          AI Chat Assistant Dosen
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tuliskan maksud Anda dalam bahasa santai, AI akan menyusun kalimat WhatsApp yang sopan, terstruktur, dan sesuai etika akademik.
        </p>
      </div>

      {/* Top Context Selector Bar (Nama Dosen, Mata Kuliah, Jadwal) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Konteks Komunikasi
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Dosen Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Nama Dosen:
            </label>
            <select
              value={selectedLecturerId}
              onChange={(e) => setSelectedLecturerId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              {lecturers.map((lec) => (
                <option key={lec.id} value={lec.id}>
                  {lec.name}{lec.title ? ', ' + lec.title : ''}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              WA: {selectedLecturer ? formatPhoneNumber(selectedLecturer.phone) : '-'}
            </span>
          </div>

          {/* Mata Kuliah Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Mata Kuliah:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              {courses.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.code} - {crs.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {selectedCourse?.credits || 3} SKS Kurikulum
            </span>
          </div>

          {/* Jadwal Terkait */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Jadwal Terkait:
            </label>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs">
              {matchedSchedule ? (
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatIndonesianDate(matchedSchedule.date)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {matchedSchedule.startTime} - {matchedSchedule.endTime} • {matchedSchedule.room}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400">Tidak ada jadwal aktif</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Chat Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Quick Suggestion Pills */}
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Contoh Kebutuhan Pesan Cepat:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputPrompt(q);
                  handleGenerateDraft(q);
                }}
                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full transition text-left cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Inti Pesan yang Ingin Disampaikan:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Contoh: Saya ingin memastikan apakah besok kuliah tetap dilaksanakan..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <div className="absolute right-3 bottom-3">
              <Button
                variant="primary"
                size="sm"
                icon={Bot}
                loading={isGenerating}
                onClick={() => handleGenerateDraft()}
              >
                Buat Draf AI
              </Button>
            </div>
          </div>
        </div>

        {/* AI Output Result Box */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Draf Rekomendasi AI (Siap Kirim WhatsApp)
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              Etika Akademik Terverifikasi
            </span>
          </div>

          <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="max-w-xl bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-none p-4 shadow-sm text-slate-900 dark:text-slate-100 text-sm leading-relaxed space-y-3">
              {isEditingDraft ? (
                <textarea
                  rows={4}
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                  className="w-full text-sm bg-transparent border border-indigo-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              ) : (
                <p className="whitespace-pre-line select-all">{generatedDraft}</p>
              )}

              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                <span>Format Baku Dosen</span>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Edit3}
                onClick={() => setIsEditingDraft(!isEditingDraft)}
              >
                {isEditingDraft ? 'Selesai Edit' : 'Edit Draf'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={handleCopy}
              >
                {copied ? 'Tersalin!' : 'Copy'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCw}
                onClick={() => handleGenerateDraft()}
              >
                Regenerate
              </Button>
            </div>

            <Button
              variant="success"
              size="sm"
              icon={Send}
              onClick={handleSendNow}
            >
              Kirim via WhatsApp API
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
