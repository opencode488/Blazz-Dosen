import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';

// Pages
import Dashboard from '../pages/Dashboard';
import Schedule from '../pages/Schedule';
import ScheduleDetail from '../pages/ScheduleDetail';
import Lecturer from '../pages/Lecturer';
import Course from '../pages/Course';
import ChatAssistant from '../pages/ChatAssistant';
import AutoChat from '../pages/AutoChat';
import ChatHistory from '../pages/ChatHistory';
import Templates from '../pages/Templates';
import Settings from '../pages/Settings';
import Login from '../pages/Login';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/:id" element={<ScheduleDetail />} />
        <Route path="/lecturers" element={<Lecturer />} />
        <Route path="/courses" element={<Course />} />
        <Route path="/chat" element={<ChatAssistant />} />
        <Route path="/auto-chat" element={<AutoChat />} />
        <Route path="/chat-history" element={<ChatHistory />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Root Redirection */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
