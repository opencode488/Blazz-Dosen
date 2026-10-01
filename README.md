# Blazz-Dosen (Dosen Chat Bot)

Student Communication Assistant & WhatsApp Automation for Lecturers. Built with **React + Vite**, **Tailwind CSS**, and **Supabase PostgreSQL**.

## Fitur Utama
- **Dashboard**: Statistik jadwal, pengingat dosen terdekat, dan antrean pesan.
- **Data Dosen & Mata Kuliah**: Manajemen kontak dosen (termasuk nomor WhatsApp) dan detail mata kuliah.
- **Jadwal Perkuliahan**: Jadwal kuliah dengan integrasi otomatis pesan pengingat.
- **Auto Chat H-1**: Pengingat WhatsApp terjadwal otomatis H-1 pukul 08:00 WIB.
- **AI Chat Assistant**: Pembuatan draf pesan sopan berbasis AI (konfirmasi jadwal, izin, bimbingan, tugas).
- **Template Pesan**: Manajemen template pesan WhatsApp dengan placeholder dinamis.
- **Supabase PostgreSQL**: Integrasi cloud database dengan Row Level Security (RLS).

## Teknologi
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, React Router DOM
- **Database**: Supabase PostgreSQL
- **WhatsApp**: WhatsApp Business Cloud API (Official)

## Cara Menjalankan
1. Clone repositori:
   ```bash
   git clone https://github.com/opencode488/Blazz-Dosen.git
   cd Blazz-Dosen
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` (lihat contoh di `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Eksekusi script `supabase_schema.sql` di Supabase SQL Editor.
5. Jalankan development server:
   ```bash
   npm run dev
   ```
