import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClockAlert,
  Send,
  AlertTriangle,
  Plus,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import UpcomingScheduleCard from '../components/dashboard/UpcomingScheduleCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { isToday, formatScheduledTimestamp } from '../utils/dateUtils';
import { maskPhoneNumber } from '../utils/phoneUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lecturers, courses, schedules, automations, whatsAppStatus, openWaModal } = useData();

  // Calculate statistics
  const totalLecturers = lecturers.length;
  const totalCourses = courses.length;
  const todaySchedulesCount = schedules.filter((s) => isToday(s.date)).length;
  const scheduledMessagesCount = automations.filter((a) => a.status === 'scheduled').length;
  const sentMessagesCount = automations.filter((a) => a.status === 'sent').length;
  const failedMessagesCount = automations.filter((a) => a.status === 'failed').length;

  // Closest upcoming schedule (Basis Data / sch-1 by default or first sorted by date)
  const sortedSchedules = [...schedules].sort((a, b) => new Date(a.date) - new Date(b.date));
  const primaryUpcoming = sortedSchedules[0] || null;
  const primaryCourse = primaryUpcoming ? courses.find((c) => c.id === primaryUpcoming.courseId) : null;
  const primaryLecturer = primaryUpcoming ? lecturers.find((l) => l.id === primaryUpcoming.lecturerId) : null;

  // Scheduled automations queue
  const scheduledQueue = automations
    .filter((a) => a.status === 'scheduled')
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 text-white p-6 sm:p-7 shadow-lg shadow-indigo-600/10 border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-50 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Student Assistant • WhatsApp Automation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat datang, {user?.name || 'idk dan direxx'} 👋
          </h2>
          <p className="mt-1.5 text-indigo-100/90 text-xs sm:text-sm leading-relaxed max-w-xl">
            Kelola jadwal perkuliahan dan otomatisasi pesan pengingat dosen dengan mudah. Pesan terkirim otomatis H-1 pukul 08.00 WIB langsung via WhatsApp.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/schedule?action=new')}
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-sm"
            >
              Tambah Jadwal Baru
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Bot}
              onClick={() => navigate('/chat')}
              className="text-white hover:bg-white/15 border border-white/20 font-medium"
            >
              AI Chat Assistant
            </Button>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* WhatsApp Web Callout Banner (only if not connected) */}
      {!whatsAppStatus.isConnected && (
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Tautkan WhatsApp Web Anda
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Perlu Scan Barcode
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Scan barcode langsung dari website agar pesan pengingat jadwal kuliah dapat terkirim otomatis ke WhatsApp dosen.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={QrCode}
            onClick={openWaModal}
            className="shrink-0 text-xs py-2 px-3.5 shadow-sm font-semibold whitespace-nowrap"
          >
            Scan Barcode Sekarang
          </Button>
        </div>
      )}

      {/* 6 Statistic Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Ringkasan Aktivitas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          <StatCard
            title="Total Dosen"
            value={totalLecturers}
            subtitle="Dosen pengampu"
            icon={GraduationCap}
            color="indigo"
          />
          <StatCard
            title="Total Matkul"
            value={totalCourses}
            subtitle="Mata kuliah aktif"
            icon={BookOpen}
            color="purple"
          />
          <StatCard
            title="Jadwal Hari Ini"
            value={todaySchedulesCount}
            subtitle="Perkuliahan aktif"
            icon={CalendarCheck}
            color="sky"
          />
          <StatCard
            title="Pesan Terjadwal"
            value={scheduledMessagesCount}
            subtitle="Antrean H-1 WA"
            icon={ClockAlert}
            color="amber"
          />
          <StatCard
            title="Pesan Terkirim"
            value={sentMessagesCount}
            subtitle="Berhasil diterima"
            icon={Send}
            color="emerald"
          />
          <StatCard
            title="Pesan Gagal"
            value={failedMessagesCount}
            subtitle="Perlu ditinjau"
            icon={AlertTriangle}
            color="rose"
          />
        </div>
      </div>

      {/* Main Grid: Jadwal Terdekat & Antrean Auto Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Terdekat */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Jadwal Terdekat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perkuliahan berikutnya yang memerlukan koordinasi dosen
              </p>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua Jadwal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {primaryUpcoming ? (
            <UpcomingScheduleCard
              schedule={primaryUpcoming}
              course={primaryCourse}
              lecturer={primaryLecturer}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">Belum ada jadwal perkuliahan tersimpan.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/schedule?action=new')}
              >
                Buat Jadwal Pertama
              </Button>
            </div>
          )}

          {/* Quick Schedule mini-cards if more than 1 */}
          {sortedSchedules.length > 1 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Jadwal Mendatang Lainnya
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedSchedules.slice(1, 3).map((sch) => {
                  const crs = courses.find((c) => c.id === sch.courseId);
                  const lec = lecturers.find((l) => l.id === sch.lecturerId);
                  return (
                    <div
                      key={sch.id}
                      onClick={() => navigate(`/schedule/${sch.id}`)}
                      className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {crs?.code}
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {crs?.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {sch.startTime} - {sch.endTime} • {sch.room}
                        </div>
                      </div>
                      <Badge variant={sch.autoChat ? 'success' : 'default'} size="sm">
                        {sch.autoChat ? 'Auto' : 'Off'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Antrean Pesan Auto Chat */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Antrean Auto Chat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pesan H-1 yang siap dikirim sistem
              </p>
            </div>
            <button
              onClick={() => navigate('/auto-chat')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {scheduledQueue.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                Tidak ada pesan dalam antrean saat ini.
              </div>
            ) : (
              scheduledQueue.map((item) => {
                const lec = lecturers.find((l) => l.id === item.lecturerId);
                const crs = courses.find((c) => c.id === item.courseId);

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {crs?.name}
                        </span>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {lec ? `${lec.name}${lec.title ? ', ' + lec.title : ''}` : 'Dosen'}
                        </div>
                      </div>
                      <Badge variant="warning" dot size="sm">
                        Scheduled
                      </Badge>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg line-clamp-2 italic">
                      "{item.message}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                      <span>Waktu Kirim:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatScheduledTimestamp(item.scheduledAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Assistant Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/60 border border-violet-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 font-bold text-violet-900 dark:text-violet-300 mb-1">
              <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              Butuh Hubungi Dosen Sekarang?
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Gunakan AI Chat Assistant untuk membuat draf pesan sopan dan profesional dalam 1 klik.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={() => navigate('/chat')}
            >
              Buka AI Chat Assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
