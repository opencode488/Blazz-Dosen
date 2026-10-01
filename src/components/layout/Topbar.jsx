import React from 'react';
import { Menu, Sun, Moon, Trash2, Clock, ShieldCheck, Database, QrCode } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function Topbar({ onMenuClick, title }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { clearAllData, supabaseStatus, openConfirm, whatsAppStatus, openWaModal } = useData();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Buka navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {title || 'Dashboard'}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> WhatsApp Web Multi-Device
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> WIB (Asia/Jakarta)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* WhatsApp Web Status & Scan Barcode Button */}
        <button
          onClick={openWaModal}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer shadow-xs ${
            whatsAppStatus.isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : whatsAppStatus.status === 'qr_ready'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse hover:bg-amber-100'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Klik untuk membuka Barcode WhatsApp Web"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">WA Web:</span>
          {whatsAppStatus.isConnected ? (
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              +{whatsAppStatus.user?.phone || 'Terhubung'}
            </span>
          ) : whatsAppStatus.status === 'qr_ready' ? (
            <span className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Scan Barcode
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-400">Scan Barcode</span>
          )}
        </button>

        {/* Supabase status indicator badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
          <Database className="w-3 h-3 text-emerald-500" />
          <span className="text-slate-600 dark:text-slate-300">Supabase:</span>
          {supabaseStatus.isConnected ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Terhubung
            </span>
          ) : supabaseStatus.isConfigured ? (
            <span className="text-amber-500 font-semibold">Terkonfigurasi</span>
          ) : (
            <span className="text-slate-400">Siap Dihubungkan</span>
          )}
        </div>

        {/* Clear database action button */}
        <button
          onClick={() => {
            openConfirm({
              title: 'Kosongkan Semua Data?',
              message: 'Tindakan ini akan mengosongkan seluruh data dosen, mata kuliah, jadwal kuliah, dan antrean pesan WhatsApp.',
              note: 'Data di database Supabase dan penyimpanan lokal akan dihapus secara permanen.',
              confirmText: 'Ya, Kosongkan Semua',
              cancelText: 'Batal',
              variant: 'danger',
              onConfirm: () => clearAllData()
            });
          }}
          title="Kosongkan Semua Data Database"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Kosongkan Data</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User profile capsule */}
        <div className="flex items-center gap-2.5 pl-1">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name || 'Mahasiswa'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'Ahmad Dinur'}
            </div>
            <div className="text-[10px] text-slate-400">
              NIM: {user?.nim || '220101089'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
