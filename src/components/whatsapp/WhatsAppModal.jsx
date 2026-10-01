import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Send,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import Button from '../ui/Button';

export default function WhatsAppModal({ isOpen, onClose }) {
  const {
    whatsAppStatus,
    refreshWhatsAppStatus,
    connectWhatsApp,
    disconnectWhatsApp,
    sendTestWhatsApp,
    addToast
  } = useData();

  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Halo! Ini pesan uji coba dari sistem Dosen Chat Bot.');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async (fresh = false) => {
    setIsRefreshing(true);
    try {
      await connectWhatsApp(fresh);
      await refreshWhatsAppStatus();
    } catch (err) {
      addToast(err.message || 'Gagal memuat ulang barcode.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectWhatsApp();
      addToast('Koneksi WhatsApp berhasil diputuskan.', 'info');
    } catch (err) {
      addToast(err.message || 'Gagal memutuskan WhatsApp.', 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      addToast('Masukkan nomor HP tujuan uji coba.', 'warning');
      return;
    }
    setIsSendingTest(true);
    try {
      await sendTestWhatsApp(testPhone, testMessage);
      addToast(`Pesan uji coba berhasil terkirim ke ${testPhone}!`, 'success');
      setTestPhone('');
    } catch (err) {
      addToast(err.message || 'Gagal mengirim pesan uji coba.', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  const isConnected = whatsAppStatus.isConnected;
  const isQrReady = whatsAppStatus.status === 'qr_ready' && Boolean(whatsAppStatus.qrCode);
  const isConnecting = whatsAppStatus.status === 'connecting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Koneksi WhatsApp Web
                </h3>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Terhubung
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Belum Terhubung
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pindai barcode QR untuk menghubungkan WhatsApp Anda secara langsung
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isConnected ? (
            /* Connected View */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    WhatsApp Berhasil Terhubung!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                    Sistem siap mengirim pesan WhatsApp otomatis H-1 dan AI Chat Assistant langsung melalui akun Anda.
                  </p>

                  <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    <div>
                      <span className="opacity-70">Nama Akun: </span>
                      <span className="font-bold">{whatsAppStatus.user?.name || 'WhatsApp User'}</span>
                    </div>
                    <div>
                      <span className="opacity-70">Nomor: </span>
                      <span className="font-bold font-mono">+{whatsAppStatus.user?.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Message Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Send className="w-4 h-4 text-indigo-500" />
                  Kirim Pesan Uji Coba WhatsApp
                </div>
                <form onSubmit={handleSendTest} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Nomor WhatsApp Tujuan (contoh: 08123456789 atau 628123456789)
                    </label>
                    <input
                      type="text"
                      placeholder="08123456789"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 font-mono transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Isi Pesan Uji Coba
                    </label>
                    <textarea
                      rows={2}
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs px-3.5 py-2 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-400">
                      Pesan akan terkirim langsung ke nomor WhatsApp di atas.
                    </p>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={Send}
                      loading={isSendingTest}
                    >
                      Kirim Pesan Uji Coba
                    </Button>
                  </div>
                </form>
              </div>

              {/* Disconnect Action */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => handleRefresh(false)}
                  loading={isRefreshing}
                >
                  Cek Status Koneksi
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={LogOut}
                  onClick={handleDisconnect}
                  loading={isDisconnecting}
                >
                  Putuskan Koneksi / Logout
                </Button>
              </div>
            </div>
          ) : (
            /* QR Scanning View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60">
                  {isQrReady ? (
                    <div className="relative group">
                      <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200/60">
                        <img
                          src={whatsAppStatus.qrCode}
                          alt="Barcode WhatsApp"
                          className="w-56 h-56 object-contain rounded-xl"
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Barcode Aktif - Siap Di-Scan
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Menyiapkan Barcode...
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Menghubungkan ke server WhatsApp Web
                          </p>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-10 h-10 text-slate-400 mb-2" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Barcode belum dimuat
                          </p>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="mt-3"
                            icon={RefreshCw}
                            onClick={() => handleRefresh(true)}
                            loading={isRefreshing}
                          >
                            Muat Barcode
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={RefreshCw}
                      onClick={() => handleRefresh(true)}
                      loading={isRefreshing}
                    >
                      Barcode Baru (Refresh)
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Langkah Scan Barcode:
                  </h4>

                  <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Buka aplikasi <strong>WhatsApp</strong> di smartphone Anda.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Ketuk <strong>Menu (titik tiga ⋮)</strong> di Android atau menu <strong>Pengaturan (Settings)</strong> di iPhone.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Pilih menu <strong>Perangkat Tertaut (Linked Devices)</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        4
                      </span>
                      <span>
                        Ketuk tombol <strong>Tautkan Perangkat (Link a Device)</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        5
                      </span>
                      <span>
                        Arahkan kamera smartphone Anda ke <strong>kode barcode di sebelah kiri</strong>.
                      </span>
                    </li>
                  </ol>

                  <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2 text-[11px] text-indigo-800 dark:text-indigo-300">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <span>
                      Koneksi terenkripsi end-to-end langsung ke WhatsApp Multi-Device resmi Anda. Data sesi tersimpan aman secara lokal.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>WhatsApp Multi-Device Official Protocol</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
