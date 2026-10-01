import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Edit2,
  Trash2,
  ArrowLeft,
  Phone,
  FileText,
  ClockAlert,
  Send,
  XCircle,
  Eye,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ScheduleModal from '../components/schedule/ScheduleModal';
import { formatIndonesianDate, formatScheduledTimestamp } from '../utils/dateUtils';
import { maskPhoneNumber, formatPhoneNumber } from '../utils/phoneUtils';

export default function ScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    schedules,
    courses,
    lecturers,
    automations,
    deleteSchedule,
    cancelAutomation,
    openConfirm
  } = useData();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const schedule = schedules.find((s) => s.id === id);

  if (!schedule) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Jadwal Tidak Ditemukan
        </h3>
        <p className="text-xs text-slate-400">
          Jadwal dengan ID tersebut mungkin sudah dihapus atau tidak tersedia.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/schedule')}>
          Kembali ke Daftar Jadwal
        </Button>
      </div>
    );
  }

  const course = courses.find((c) => c.id === schedule.courseId);
  const lecturer = lecturers.find((l) => l.id === schedule.lecturerId);
  const linkedAutomation = automations.find((a) => a.scheduleId === schedule.id);

  const handleDelete = () => {
    openConfirm({
      title: 'Hapus Jadwal Kuliah',
      message: 'Hapus jadwal perkuliahan ini dari kalender dan database?',
      itemName: course?.name,
      note: 'Pesan otomatis pengingat WhatsApp terkait juga akan dibatalkan.',
      confirmText: 'Ya, Hapus Jadwal',
      variant: 'danger',
      onConfirm: () => {
        deleteSchedule(schedule.id);
        navigate('/schedule');
      }
    });
  };

  const handleCancelAutoChat = () => {
    if (!linkedAutomation) return;
    openConfirm({
      title: 'Batalkan Pesan WhatsApp?',
      message: 'Apakah Anda yakin ingin membatalkan jadwal pengiriman pesan otomatis ini?',
      itemName: course?.name,
      note: 'Status antrean akan diubah menjadi Dibatalkan.',
      confirmText: 'Batalkan Pesan',
      variant: 'warning',
      onConfirm: () => cancelAutomation(linkedAutomation.id)
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/schedule')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Jadwal Perkuliahan
      </button>

      {/* Main Detail Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                {course?.code || 'KULIAH'}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {course?.credits || 3} SKS
              </span>
              <Badge variant={schedule.autoChat ? 'success' : 'default'} dot={schedule.autoChat}>
                {schedule.autoChat ? 'Auto Chat Aktif' : 'Auto Chat Nonaktif'}
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {course?.name || 'Mata Kuliah'}
            </h2>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              {lecturer ? `${lecturer.name}${lecturer.title ? ', ' + lecturer.title : ''}` : 'Dosen Pengampu'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" icon={Edit2} onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        {/* Schedule Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Tanggal Kuliah
            </span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {formatIndonesianDate(schedule.date)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Jam Perkuliahan
            </span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {schedule.startTime} - {schedule.endTime} WIB
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Ruang Kuliah
            </span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {schedule.room}
            </div>
          </div>
        </div>

        {/* Lecturer Details & WhatsApp info */}
        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Dosen Pengampu</div>
            <div className="font-bold text-slate-900 dark:text-white">
              {lecturer ? `${lecturer.name}${lecturer.title ? ', ' + lecturer.title : ''}` : '-'}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lecturer ? formatPhoneNumber(lecturer.phone) : '-'}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={MessageSquare}
            onClick={() => navigate(`/chat?lecturerId=${lecturer?.id}&courseId=${course?.id}`)}
          >
            Chat Dosen Sekarang
          </Button>
        </div>

        {/* Notes */}
        {schedule.notes && (
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/30 border border-amber-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
              Catatan Khusus:
            </span>
            <p className="italic leading-relaxed">{schedule.notes}</p>
          </div>
        )}

        {/* Auto Chat & Scheduled Message Section */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ClockAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Status Pesan Otomatis (Auto Chat)</h4>
                <p className="text-xs text-slate-400">Pengiriman terjadwal via WhatsApp Business Cloud API</p>
              </div>
            </div>

            <Badge
              variant={
                linkedAutomation?.status === 'sent'
                  ? 'success'
                  : linkedAutomation?.status === 'scheduled'
                  ? 'warning'
                  : linkedAutomation?.status === 'failed'
                  ? 'danger'
                  : 'default'
              }
              dot={linkedAutomation?.status === 'scheduled'}
            >
              {linkedAutomation?.status?.toUpperCase() || 'TIDAK TERJADWAL'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block">Jadwal Kirim (H-1):</span>
              <span className="font-bold text-slate-200 text-sm">
                {schedule.scheduledAt ? formatScheduledTimestamp(schedule.scheduledAt) : '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Waktu Terkirim Sebenarnya:</span>
              <span className="font-semibold text-slate-200">
                {linkedAutomation?.sentAt ? formatScheduledTimestamp(linkedAutomation.sentAt) : 'Menunggu antrean'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              className="text-white border-slate-700 hover:bg-slate-800"
              onClick={() => setIsPreviewOpen(true)}
            >
              Preview Auto Chat
            </Button>

            {linkedAutomation?.status === 'scheduled' && (
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={handleCancelAutoChat}
              >
                Cancel Scheduled Message
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Schedule Modal */}
      <ScheduleModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        schedule={schedule}
      />

      {/* Preview Auto Chat Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview Pesan Auto Chat WhatsApp"
        description="Pesan yang akan diterima dosen pada H-1 perkuliahan"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
            <div className="text-slate-500 dark:text-slate-400">Penerima:</div>
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {lecturer?.name}{lecturer?.title ? ', ' + lecturer.title : ''} ({lecturer ? formatPhoneNumber(lecturer.phone) : '-'})
            </div>
            <div className="text-slate-500 dark:text-slate-400 pt-1">Jadwal Kirim:</div>
            <div className="font-semibold text-emerald-700 dark:text-emerald-300">
              {schedule.scheduledAt ? formatScheduledTimestamp(schedule.scheduledAt) : '-'}
            </div>
          </div>

          <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 rounded-2xl">
            <div className="max-w-md bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs leading-relaxed space-y-2">
              <p>
                {linkedAutomation?.message ||
                  `Selamat pagi, ${lecturer?.name || 'Bapak/Ibu'}${lecturer?.title ? ', ' + lecturer.title : ''}. Mohon izin mengingatkan bahwa besok terdapat perkuliahan ${course?.name} pada pukul ${schedule.startTime} - ${schedule.endTime} di ${schedule.room}. Apakah perkuliahan tetap dilaksanakan sesuai jadwal? Terima kasih banyak.`}
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                <span>08.00 WIB</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Tutup
            </Button>
            <Button
              variant="primary"
              icon={MessageSquare}
              onClick={() => {
                setIsPreviewOpen(false);
                navigate(`/chat?lecturerId=${lecturer?.id}&courseId=${course?.id}`);
              }}
            >
              Buka di Chat Assistant
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
