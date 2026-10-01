/**
 * Data Storage Initializers
 * Data dummy awal telah dikosongkan.
 * Seluruh data kini dikelola secara dinamis dan dapat disimpan ke Supabase PostgreSQL.
 */

// Data Dosen (Kosong - Siap diinput atau disinkronkan dari Supabase)
export const INITIAL_LECTURERS = [];

// Data Mata Kuliah (Kosong)
export const INITIAL_COURSES = [];

// Template Pesan Bawaan (Kosong - Dosen Chat Bot)
export const INITIAL_TEMPLATES = [];

// Jadwal Kuliah (Kosong)
export const INITIAL_SCHEDULES = [];

// Pesan Otomatis Terjadwal (Kosong)
export const INITIAL_AUTOMATIONS = [];

// Riwayat Pengiriman Chat (Kosong)
export const INITIAL_CHAT_HISTORY = [];

// Pengaturan Profil Mahasiswa & Sistem
export const INITIAL_SETTINGS = {
  timezone: 'Asia/Jakarta',
  timezoneName: 'WIB (GMT+7)',
  defaultTimeOffset: 'H-1 08:00 WIB',
  defaultHour: '08:00',
  whatsappProvider: 'WhatsApp Business Cloud API (Official)',
  whatsappStatus: 'Terhubung (Connected)',
  webhookUrl: 'https://api.dosen-chatbot.univ.ac.id/webhook/v1/wa',
  autoRetryOnFailure: true,
  maxRetry: 3,
  studentName: 'Ahmad Dinur',
  studentNim: '220101089',
  studentEmail: 'ahmad.dinur@student.univ.ac.id',
  studentMajor: 'Teknik Informatika - Semester 5'
};
