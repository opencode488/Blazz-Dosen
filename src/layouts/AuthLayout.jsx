import React from 'react';
import { Outlet } from 'react-router-dom';
import Toast from '../components/ui/Toast';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Outlet />
      <Toast />
    </div>
  );
}
