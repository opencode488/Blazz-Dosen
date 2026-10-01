import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Toast from '../components/ui/Toast';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.startsWith('/schedule/')) return 'Detail Jadwal Perkuliahan';
    switch (path) {
      case '/dashboard':
        return 'Dashboard Mahasiswa';
      case '/schedule':
        return 'Jadwal Perkuliahan';
      case '/lecturers':
        return 'Daftar Dosen Pengampu';
      case '/courses':
        return 'Mata Kuliah';
      case '/chat':
        return 'AI Chat Assistant';
      case '/auto-chat':
        return 'Auto Chat & Pengingat WA';
      case '/templates':
        return 'Template Pesan WhatsApp';
      case '/chat-history':
        return 'Riwayat Pengiriman Pesan';
      case '/settings':
        return 'Pengaturan & Integrasi';
      default:
        return 'Dosen Chat Bot';
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
}
