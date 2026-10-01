import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Bot,
  Menu
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Toast from '../components/ui/Toast';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.startsWith('/schedule/')) return 'Detail Jadwal';
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/schedule':
        return 'Jadwal Kuliah';
      case '/lecturers':
        return 'Data Dosen';
      case '/courses':
        return 'Mata Kuliah';
      case '/chat':
        return 'AI Assistant';
      case '/auto-chat':
        return 'Auto Chat WA';
      case '/templates':
        return 'Template Pesan';
      case '/chat-history':
        return 'Riwayat Pesan';
      case '/settings':
        return 'Pengaturan';
      default:
        return 'Dosen Bot';
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around py-1.5 px-1 shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/schedule"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span>Jadwal</span>
        </NavLink>

        <NavLink
          to="/lecturers"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <GraduationCap className="w-5 h-5" />
          <span>Dosen</span>
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${
              isActive
                ? 'text-violet-600 dark:text-violet-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <Bot className="w-5 h-5" />
          <span>AI Chat</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </nav>

      <Toast />
    </div>
  );
}
