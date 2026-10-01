import React, { useState } from 'react';
import {
  ClockAlert,
  Send,
  AlertCircle,
  XCircle,
  Eye,
  Calendar,
  Clock,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { formatIndonesianDate, formatScheduledTimestamp } from '../utils/dateUtils';
import { formatPhoneNumber } from '../utils/phoneUtils';

export default function AutoChat() {
  const {
    automations,
    lecturers,
    courses,
    schedules,
    cancelAutomation,
    rescheduleAutomation,
    sendAutomationNow,
    whatsAppStatus,
    openWaModal
  } = useData();

  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' | 'sent' | 'failed' | 'cancelled'
  const [previewingItem, setPreviewingItem] = useState(null);
  const [reschedulingItem, setReschedulingItem] = useState(null);
  const [newScheduleTime, setNewScheduleTime] = useState('');

  // Filter items by tab
  const tabCounts = {
    scheduled: automations.filter((a) => a.status === 'scheduled').length,
    sent: automations.filter((a) => a.status === 'sent').length,
    failed: automations.filter((a) => a.status === 'failed').length,
    cancelled: automations.filter((a) => a.status === 'cancelled').length,
  };

  const filteredAutomations = automations.filter((a) => a.status === activeTab);

  const handleOpenReschedule = (item) => {
    setReschedulingItem(item);
    setNewScheduleTime(item.scheduledAt || '');
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!newScheduleTime) return;
    rescheduleAutomation(reschedulingItem.id, newScheduleTime);
    setReschedulingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Auto Chat H-1 WhatsApp
          </h2>
          <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen antrean pesan pengingat terjadwal otomatis (Timezone: Asia/Jakarta WIB)
          </p>
        </div>

        <button
          onClick={openWaModal}
          type="button"
          className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer self-start sm:self-auto ${
            whatsAppStatus.isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 animate-pulse'
          }`}
          title="Klik untuk melihat status / scan barcode WhatsApp"
        >
          <QrCode className="w-3.5 h-3.5 shrink-0" />
          {whatsAppStatus.isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>WA: +{whatsAppStatus.user?.phone}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Scan Barcode WA</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 sm:pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'scheduled'
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClockAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          <span>Scheduled ({tabCounts.scheduled})</span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'sent'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          <span>Sent ({tabCounts.sent})</span>
        </button>

        <button
          onClick={() => setActiveTab('failed')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'failed'
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
          <span>Failed ({tabCounts.failed})</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'cancelled'
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          <span>Cancelled ({tabCounts.cancelled})</span>
        </button>
      </div>

      {/* Cards List as strictly requested in specification */}
      {filteredAutomations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <ClockAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            Tidak ada pesan pada kategori {activeTab.toUpperCase()}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Semua perubahan jadwal dengan Auto Chat aktif akan muncul di tab ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAutomations.map((item) => {
            const lec = lecturers.find((l) => l.id === item.lecturerId);
            const crs = courses.find((c) => c.id === item.courseId);
            const sch = schedules.find((s) => s.id === item.scheduleId);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Course & Lecturer */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {crs?.code || 'KULIAH'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {crs?.name || 'Mata Kuliah'}
                      </h4>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                        {lec ? `${lec.name}${lec.title ? ', ' + lec.title : ''}` : 'Dosen Pengampu'}
                      </p>
                    </div>

                    <Badge
                      variant={
                        item.status === 'scheduled'
                          ? 'warning'
                          : item.status === 'sent'
                          ? 'success'
                          : item.status === 'failed'
                          ? 'danger'
                          : 'default'
                      }
                      dot={item.status === 'scheduled'}
                      size="sm"
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Schedule dates info */}
                  <div className="space-y-2 py-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Kuliah:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sch ? formatIndonesianDate(sch.date) : '5 Oktober 2026'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Kirim:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatScheduledTimestamp(item.scheduledAt)}
                      </span>
                    </div>

                    {item.errorMessage && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-[11px] leading-relaxed">
                        ⚠️ {item.errorMessage}
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-3 italic">
                      "{item.message}"
                    </div>
                  </div>
                </div>

                {/* Actions Footer: [Preview] [Edit] [Cancel] */}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPreviewingItem(item)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>

                  <div className="flex items-center gap-1.5">
                    {item.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleOpenReschedule(item)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => cancelAutomation(item.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => sendAutomationNow(item.id)}
                          title="Kirim Sekarang via WhatsApp API"
                          className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {item.status === 'failed' && (
                      <button
                        onClick={() => sendAutomationNow(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" /> Coba Lagi
                      </button>
                    )}

                    {item.status === 'cancelled' && (
                      <button
                        onClick={() => handleOpenReschedule(item)}
                        className="text-xs font-medium text-slate-500 hover:underline cursor-pointer"
                      >
                        Aktifkan Lagi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Preview Modal */}
      {previewingItem && (
        <Modal
          isOpen={Boolean(previewingItem)}
          onClose={() => setPreviewingItem(null)}
          title="Preview Pesan WhatsApp Terjadwal"
          description="Tampilan pesan yang diformat otomatis dan dikirim melalui WhatsApp Business API"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="text-slate-400">Nomor Penerima:</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-100">
                {formatPhoneNumber(previewingItem.phoneNumber)}
              </div>
              <div className="text-slate-400 pt-1">Target Kirim:</div>
              <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                {formatScheduledTimestamp(previewingItem.scheduledAt)}
              </div>
            </div>

            <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="max-w-md bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-none p-4 shadow-sm text-xs leading-relaxed space-y-2 text-slate-800 dark:text-slate-100">
                <p className="whitespace-pre-line">{previewingItem.message}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                  <span>08.00 WIB</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPreviewingItem(null)}>
                Tutup
              </Button>
              {previewingItem.status === 'scheduled' && (
                <Button
                  variant="success"
                  icon={Send}
                  onClick={() => {
                    sendAutomationNow(previewingItem.id);
                    setPreviewingItem(null);
                  }}
                >
                  Kirim Sekarang
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <Modal
          isOpen={Boolean(reschedulingItem)}
          onClose={() => setReschedulingItem(null)}
          title="Ubah Waktu Pengiriman Pesan"
          description="Tentukan tanggal dan jam pengiriman WhatsApp baru"
        >
          <form onSubmit={handleSaveReschedule} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Waktu Pengiriman Baru (ISO format)
              </label>
              <input
                type="datetime-local"
                value={newScheduleTime.slice(0, 16)}
                onChange={(e) => setNewScheduleTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Waktu default adalah H-1 perkuliahan pukul 08:00 WIB.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setReschedulingItem(null)}>
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Simpan Waktu Baru
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
