-- ====================================================================
-- DOSEN CHAT BOT - SUPABASE DATABASE SCHEMA
-- PostgreSQL Schema for Supabase
-- ====================================================================

-- 1. Enable UUID Extension (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Lecturers Table (Data Dosen)
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

-- 3. Courses Table (Data Mata Kuliah)
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    credits INTEGER DEFAULT 3,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Schedules Table (Jadwal Perkuliahan)
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

-- 5. Message Templates Table (Template Pesan WhatsApp)
CREATE TABLE IF NOT EXISTS message_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Umum',
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Scheduled Messages / Automations (Antrean Pengiriman Pesan WhatsApp)
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

-- 7. Chat History Table (Riwayat Chat Terkirim)
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
-- Aktifkan RLS dan berikan akses untuk role anon & authenticated
-- ====================================================================

ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Lecturers Policies
DROP POLICY IF EXISTS "Allow public access to lecturers" ON lecturers;
CREATE POLICY "Allow public access to lecturers" ON lecturers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Courses Policies
DROP POLICY IF EXISTS "Allow public access to courses" ON courses;
CREATE POLICY "Allow public access to courses" ON courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Schedules Policies
DROP POLICY IF EXISTS "Allow public access to schedules" ON schedules;
CREATE POLICY "Allow public access to schedules" ON schedules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Message Templates Policies
DROP POLICY IF EXISTS "Allow public access to message_templates" ON message_templates;
CREATE POLICY "Allow public access to message_templates" ON message_templates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Scheduled Messages Policies
DROP POLICY IF EXISTS "Allow public access to scheduled_messages" ON scheduled_messages;
CREATE POLICY "Allow public access to scheduled_messages" ON scheduled_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Chat History Policies
DROP POLICY IF EXISTS "Allow public access to chat_history" ON chat_history;
CREATE POLICY "Allow public access to chat_history" ON chat_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
