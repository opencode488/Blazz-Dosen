import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Clock,
  MessageSquare,
  User,
  Moon,
  Sun,
  Save,
  RotateCcw,
  CheckCircle2,
  Server,
  KeyRound,
  Database,
  Trash2,
  RefreshCw,
  Code,
  Copy,
  ExternalLink,
  AlertCircle,
  QrCode,
  Smartphone,
  LogOut
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getSupabaseConfig } from '../services/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- DOSEN CHAT BOT - SUPABASE DATABASE SCHEMA
-- Jalankan script ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. Lecturers Table (Data Dosen)
CREATE TABLE IF NOT EXISTS lecturers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'Aktif',
    notes TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table (Data Mata Kuliah)
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    credits INTEGER DEFAULT 3,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Schedules Table (Jadwal Perkuliahan)
CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    lecturer_id TEXT REFERENCES lecturers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT NOT NULL,
    notes TEXT,
    auto_chat BOOLEAN DEFAULT true,
    scheduled_at TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Message Templates Table (Template Pesan WhatsApp)
CREATE TABLE IF NOT EXISTS message_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Umum',
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scheduled Messages / Automations (Antrean Pengiriman Pesan WhatsApp)
CREATE TABLE IF NOT EXISTS scheduled_messages (
    id TEXT PRIMARY KEY,
    schedule_id TEXT REFERENCES schedules(id) ON DELETE CASCADE,
    lecturer_id TEXT REFERENCES lecturers(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    provider_message_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Chat History Table (Riwayat Chat Terkirim)
CREATE TABLE IF NOT EXISTS chat_history (
    id TEXT PRIMARY KEY,
    lecturer_id TEXT,
    lecturer_name TEXT,
    course_name TEXT,
    phone TEXT,
    type TEXT DEFAULT 'manual_chat',
    message TEXT NOT NULL,
    sent_at TEXT,
    status TEXT DEFAULT 'delivered',
    provider_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to lecturers" ON lecturers;
CREATE POLICY "Allow public access to lecturers" ON lecturers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to courses" ON courses;
CREATE POLICY "Allow public access to courses" ON courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to schedules" ON schedules;
CREATE POLICY "Allow public access to schedules" ON schedules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to message_templates" ON message_templates;
CREATE POLICY "Allow public access to message_templates" ON message_templates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to scheduled_messages" ON scheduled_messages;
CREATE POLICY "Allow public access to scheduled_messages" ON scheduled_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to chat_history" ON chat_history;
CREATE POLICY "Allow public access to chat_history" ON chat_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`;

export default function Settings() {
  const {
    settings,
    setSettings,
    addToast,
    supabaseStatus,
    syncWithSupabase,
    configureSupabase,
    clearAllData,
    isLoadingDb,
    whatsAppStatus,
    openWaModal,
    connectWhatsApp,
    disconnectWhatsApp,
    refreshWhatsAppStatus
  } = useData();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ ...settings });

  // Supabase state
  const initialSupabase = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState(initialSupabase.anonKey);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formData);
    addToast('Pengaturan sistem berhasil disimpan.');
  };

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    await configureSupabase(supabaseUrl, supabaseKey);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    addToast('Script SQL Schema berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleConfirmClear = async () => {
    await clearAllData();
    setIsClearModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Pengaturan Sistem
        </h2>
        <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Konfigurasi profil mahasiswa, integrasi Supabase PostgreSQL Database, dan WhatsApp API
        </p>
      </div>

      {/* Supabase Database Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Database Supabase PostgreSQL
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                Penyimpanan cloud untuk data dosen, mata kuliah, jadwal, dan pesan WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {supabaseStatus.isConnected ? (
              <Badge variant="success" dot>
                Supabase Terhubung
              </Badge>
            ) : supabaseStatus.isConfigured ? (
              <Badge variant="warning" dot>
                Koneksi Terputus
              </Badge>
            ) : (
              <Badge variant="default">
                Belum Terkonfigurasi
              </Badge>
            )}
          </div>
        </div>

        {supabaseStatus.errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Status Supabase: </span>
              {supabaseStatus.errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://your-project-ref.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Dapat diperoleh di dashboard Supabase: Project Settings &rarr; Data API &rarr; Project URL
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm px-3.5 py-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Kunci publik aman untuk client-side (Project Settings &rarr; Data API &rarr; Project API keys &rarr; anon public)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Save}
                loading={supabaseStatus.checking || isLoadingDb}
              >
                Simpan & Sambungkan
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => syncWithSupabase(false)}
                loading={isLoadingDb}
              >
                Sinkronkan Data
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={Code}
                onClick={() => setIsSqlModalOpen(true)}
              >
                SQL Schema
              </Button>

              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setIsClearModalOpen(true)}
              >
                Kosongkan Database
              </Button>
            </div>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Profil Mahasiswa
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="studentName"
              label="Nama Mahasiswa"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              required
            />
            <Input
              id="studentNim"
              label="NIM (Nomor Induk Mahasiswa)"
              value={formData.studentNim}
              onChange={(e) => setFormData({ ...formData, studentNim: e.target.value })}
              required
            />
            <Input
              id="studentEmail"
              type="email"
              label="Email Mahasiswa"
              value={formData.studentEmail}
              onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
              required
            />
            <Input
              id="studentMajor"
              label="Program Studi & Semester"
              value={formData.studentMajor}
              onChange={(e) => setFormData({ ...formData, studentMajor: e.target.value })}
              required
            />
          </div>
        </div>

        {/* WhatsApp Web Multi-Device & Barcode Scan Integration */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Koneksi WhatsApp Web (Scan Barcode)
                </h3>
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                  Tautkan WhatsApp Anda via barcode untuk pengiriman pesan otomatis langsung
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {whatsAppStatus.isConnected ? (
                <Badge variant="success" dot>
                  Terhubung: +{whatsAppStatus.user?.phone || 'WA Aktif'}
                </Badge>
              ) : whatsAppStatus.status === 'qr_ready' ? (
                <Badge variant="warning" dot>
                  Siap Di-Scan
                </Badge>
              ) : (
                <Badge variant="default">
                  Belum Terhubung
                </Badge>
              )}
            </div>
          </div>

          {/* Connected state info or QR code preview */}
          {whatsAppStatus.isConnected ? (
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Sesi WhatsApp Aktif & Siap Digunakan
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Terhubung ke: <strong className="font-mono">+{whatsAppStatus.user?.phone}</strong> ({whatsAppStatus.user?.name || 'WhatsApp Web'})
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={QrCode}
                  onClick={openWaModal}
                >
                  Uji Coba Kirim
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={LogOut}
                  onClick={disconnectWhatsApp}
                >
                  Putuskan
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col md:flex-row items-center gap-6">
              {whatsAppStatus.qrCode ? (
                <div className="shrink-0 p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
                  <img
                    src={whatsAppStatus.qrCode}
                    alt="Barcode WhatsApp"
                    className="w-40 h-40 object-contain mx-auto"
                  />
                  <span className="block mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-500">
                    Arahkan kamera WA ke sini
                  </span>
                </div>
              ) : (
                <div className="w-40 h-40 shrink-0 flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center">
                  <QrCode className="w-8 h-8 text-slate-400 mb-1" />
                  <p className="text-[11px] text-slate-400">Barcode belum dimuat</p>
                </div>
              )}

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tautkan Nomor WhatsApp dengan Mudah
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Buka WhatsApp di HP &rarr; Menu titik tiga (⋮) / Pengaturan &rarr; <strong>Perangkat Tertaut</strong> &rarr; <strong>Tautkan Perangkat</strong> &rarr; scan barcode di samping.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={QrCode}
                    onClick={openWaModal}
                  >
                    Buka Tampilan Barcode Penuh
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => connectWhatsApp(true)}
                  >
                    Barcode Baru
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Metode Pengiriman WhatsApp
              </label>
              <input
                type="text"
                disabled
                value="WhatsApp Web Multi-Device (Scan QR)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-sm px-3.5 py-2.5 cursor-not-allowed font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Koneksi WebSocket langsung via Baileys multi-device.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Default Waktu Pengiriman Auto Chat
              </label>
              <input
                type="text"
                disabled
                value={formData.defaultTimeOffset}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-sm px-3.5 py-2.5 cursor-not-allowed font-semibold text-indigo-600 dark:text-indigo-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Pesan otomatis selalu dijadwalkan H-1 pukul 08.00 WIB.
              </p>
            </div>
          </div>
        </div>

        {/* Display & Dark Mode */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Mode Tampilan Gelap (Dark Mode)
              </h4>
              <p className="hidden sm:block text-xs text-slate-400">
                Pilih antara mode terang (Light) atau gelap (Dark) untuk kenyamanan mata.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full sm:w-auto"
          >
            {isDark ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
          </Button>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto">
            Simpan Pengaturan Profil
          </Button>
        </div>
      </form>

      {/* SQL Schema Modal */}
      <Modal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        title="SQL Schema Supabase"
        description="Salin dan jalankan script ini di SQL Editor pada Dashboard Supabase Anda"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Mencakup tabel: lecturers, courses, schedules, message_templates, scheduled_messages, chat_history & RLS Policies.
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={copiedSql ? CheckCircle2 : Copy}
              onClick={handleCopySql}
            >
              {copiedSql ? 'Tersalin!' : 'Salin SQL'}
            </Button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed select-all">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </Modal>

      {/* Confirmation Modal to Clear Database */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Kosongkan Semua Data Database?"
        description="Tindakan ini akan menghapus seluruh data dosen, mata kuliah, jadwal, dan antrean pesan WhatsApp baik di penyimpanan lokal maupun di database Supabase."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              Apakah Anda yakin? Seluruh data dummy atau data yang ada akan dihapus secara permanen sehingga database menjadi kosong.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="ghost" onClick={() => setIsClearModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleConfirmClear}>
              Ya, Kosongkan Database
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
