import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Bot,
  ClockAlert,
  FileText,
  History,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Sidebar({ isOpen, onClose }) {
  const { automations = [] } = useData();

  const scheduledCount = automations?.filter((a) => a.status === 'scheduled')?.length || 0;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Jadwal Kuliah', path: '/schedule', icon: CalendarDays },
    { label: 'Dosen', path: '/lecturers', icon: GraduationCap },
    { label: 'Mata Kuliah', path: '/courses', icon: BookOpen },
    { label: 'Chat Assistant', path: '/chat', icon: Bot, isSpecial: true },
    { label: 'Auto Chat', path: '/auto-chat', icon: ClockAlert, badge: scheduledCount > 0 ? scheduledCount : null },
    { label: 'Template Pesan', path: '/templates', icon: FileText },
    { label: 'Riwayat Chat', path: '/chat-history', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5 text-base">
              DosenBot
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Assistant Mahasiswa</p>
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.isSpecial ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              ) : item.badge ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>

      {/* Auto Chat Indicator Box */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-slate-50 dark:from-slate-800/60 dark:to-slate-900 border border-indigo-100/80 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Auto Chat H-1 Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Pengingat otomatis H-1 pukul 08.00 WIB via WhatsApp Web.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30 w-64">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
