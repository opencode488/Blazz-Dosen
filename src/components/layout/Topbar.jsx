import { Menu, Sun, Moon, Clock, Database, QrCode, LogOut, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function Topbar({ onMenuClick, title }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { supabaseStatus, whatsAppStatus, openWaModal } = useData();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Buka navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
            {title || 'Dashboard'}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>WIB (Asia/Jakarta)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Status Pills */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* WhatsApp Web Status Pill */}
        <button
          onClick={openWaModal}
          type="button"
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-full border transition cursor-pointer ${
            whatsAppStatus.isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
              : whatsAppStatus.status === 'qr_ready'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Klik untuk membuka Barcode WhatsApp Web"
        >
          <QrCode className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
          {whatsAppStatus.isConnected ? (
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">WA:</span> <span className="hidden xs:inline">+{whatsAppStatus.user?.phone || 'Terhubung'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span><span className="hidden sm:inline">Scan Barcode </span>WA</span>
            </span>
          )}
        </button>

        {/* Supabase Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
          <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Supabase:</span>
          {supabaseStatus.isConnected ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Terhubung
            </span>
          ) : supabaseStatus.isConfigured ? (
            <span className="text-amber-500 font-semibold">Terkonfigurasi</span>
          ) : (
            <span className="text-slate-400">Belum Konek</span>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Capsule & Logout */}
        <div className="flex items-center gap-2 pl-1 bg-slate-50 dark:bg-slate-800/50 py-1 px-1.5 sm:px-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
              {user?.name || 'idk dan direxx'}
            </div>
            <div className="text-[10px] text-slate-400 leading-none mt-1">
              NIM: {user?.nim || '220101089'}
            </div>
          </div>

          <button
            onClick={logout}
            title="Kunci Akses / Logout"
            className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
