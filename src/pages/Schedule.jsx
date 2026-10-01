import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  List,
  LayoutGrid,
  CalendarDays,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClockAlert
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ScheduleModal from '../components/schedule/ScheduleModal';
import { formatIndonesianDate, formatShortDate } from '../utils/dateUtils';

export default function Schedule() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { schedules, courses, lecturers, deleteSchedule, openConfirm } = useData();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card' | 'calendar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Filters state
  const [filterLecturer, setFilterLecturer] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterAutoChat, setFilterAutoChat] = useState('all'); // 'all' | 'true' | 'false'
  const [filterDate, setFilterDate] = useState('');

  // Calendar state (year and month: default Oct 2026 for dummy dates)
  const [calDate, setCalDate] = useState(new Date(2026, 9, 1)); // October 2026

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch) => {
    setEditingSchedule(sch);
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    openConfirm({
      title: 'Hapus Jadwal Kuliah',
      message: 'Apakah Anda yakin ingin menghapus jadwal perkuliahan ini dari kalender dan database?',
      itemName: title,
      note: 'Pesan otomatis pengingat WhatsApp terkait juga akan dibatalkan.',
      confirmText: 'Hapus Jadwal',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => deleteSchedule(id)
    });
  };

  // Filter application
  const filteredSchedules = schedules.filter((sch) => {
    if (filterLecturer && sch.lecturerId !== filterLecturer) return false;
    if (filterCourse && sch.courseId !== filterCourse) return false;
    if (filterDate && sch.date !== filterDate) return false;
    if (filterAutoChat === 'true' && !sch.autoChat) return false;
    if (filterAutoChat === 'false' && sch.autoChat) return false;
    return true;
  });

  // Calendar calculation
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 is Sunday

  const currentYear = calDate.getFullYear();
  const currentMonth = calDate.getMonth();
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => setCalDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCalDate(new Date(currentYear, currentMonth + 1, 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Jadwal Perkuliahan
          </h2>
          <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar sesi perkuliahan aktif terintegrasi dengan Auto Chat H-1 WhatsApp
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd} className="w-full sm:w-auto">
          Tambah Jadwal
        </Button>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 flex-1 w-full">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Semua Matkul</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>

            <select
              value={filterLecturer}
              onChange={(e) => setFilterLecturer(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Semua Dosen</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            <select
              value={filterAutoChat}
              onChange={(e) => setFilterAutoChat(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Auto Chat</option>
              <option value="true">Auto Chat Aktif</option>
              <option value="false">Nonaktif</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            {(filterCourse || filterLecturer || filterDate || filterAutoChat !== 'all') && (
              <button
                onClick={() => {
                  setFilterCourse('');
                  setFilterLecturer('');
                  setFilterDate('');
                  setFilterAutoChat('all');
                }}
                className="col-span-2 sm:col-span-1 text-xs text-rose-500 hover:text-rose-600 font-semibold underline px-1 py-1 cursor-pointer text-center sm:text-left"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-end gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Display */}
      {filteredSchedules.length === 0 && viewMode !== 'calendar' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800">
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200">
            Tidak ada jadwal perkuliahan
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ada data jadwal yang sesuai dengan filter yang dipilih.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd} className="mt-4">
            Tambah Jadwal
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 sm:px-6">Mata Kuliah</th>
                  <th className="py-3 px-2 sm:px-4">Dosen</th>
                  <th className="hidden sm:table-cell py-3.5 px-4">Tanggal & Jam</th>
                  <th className="hidden md:table-cell py-3.5 px-4">Ruang</th>
                  <th className="py-3 px-2 sm:px-4">Auto Chat</th>
                  <th className="hidden lg:table-cell py-3.5 px-4">Status</th>
                  <th className="py-3 px-2 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSchedules.map((sch) => {
                  const crs = courses.find((c) => c.id === sch.courseId);
                  const lec = lecturers.find((l) => l.id === sch.lecturerId);

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight text-xs sm:text-base">
                          {crs?.name || 'Mata Kuliah'}
                        </div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                          {crs?.code}
                        </div>
                        <div className="flex sm:hidden items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>{formatShortDate(sch.date)}</span>
                          <span>•</span>
                          <span>{sch.startTime}</span>
                          <span>•</span>
                          <span>{sch.room}</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {lec?.name || 'Dosen'}
                        </div>
                        <div className="hidden sm:block text-xs text-slate-400">
                          {lec?.title || ''}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell py-4 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <div>{formatIndonesianDate(sch.date)}</div>
                        <div className="text-slate-500 font-semibold">{sch.startTime} - {sch.endTime}</div>
                      </td>
                      <td className="hidden md:table-cell py-4 px-4 text-xs text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          {sch.room}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <Badge
                          variant={sch.autoChat ? 'success' : 'default'}
                          dot={sch.autoChat}
                          size="sm"
                        >
                          {sch.autoChat ? 'H-1 08:00' : 'Off'}
                        </Badge>
                      </td>
                      <td className="hidden lg:table-cell py-4 px-4">
                        <Badge
                          variant={
                            sch.status === 'scheduled'
                              ? 'primary'
                              : sch.status === 'completed'
                              ? 'success'
                              : 'default'
                          }
                          size="sm"
                        >
                          {sch.status === 'scheduled' ? 'Terjadwal' : sch.status === 'completed' ? 'Selesai' : 'Non-aktif'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/schedule/${sch.id}`)}
                            title="Detail"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(sch)}
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id, crs?.name || 'jadwal')}
                            title="Hapus"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchedules.map((sch) => {
            const crs = courses.find((c) => c.id === sch.courseId);
            const lec = lecturers.find((l) => l.id === sch.lecturerId);

            return (
              <div
                key={sch.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded">
                      {crs?.code}
                    </span>
                    <Badge variant={sch.autoChat ? 'success' : 'default'} dot={sch.autoChat} size="sm">
                      {sch.autoChat ? 'Auto Chat Aktif' : 'Off'}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {crs?.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {lec ? `${lec.name}${lec.title ? ', ' + lec.title : ''}` : 'Dosen'}
                  </p>

                  <div className="space-y-2 py-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{formatIndonesianDate(sch.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{sch.startTime} - {sch.endTime} WIB</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{sch.room}</span>
                    </div>
                  </div>

                  {sch.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg line-clamp-2">
                      {sch.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sch)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sch.id, crs?.name || 'jadwal')}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/schedule/${sch.id}`)}
                    >
                      Detail
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={MessageSquare}
                      onClick={() => navigate(`/chat?lecturerId=${lec?.id}&courseId=${crs?.id}`)}
                    >
                      Chat
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalDate(new Date(2026, 9, 1))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Oktober 2026 (Demo)
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-2">
            <div>Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 opacity-50" />
            ))}

            {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const daySchedules = schedules.filter((s) => s.date === dateStr);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-24 sm:h-28 rounded-xl p-1.5 sm:p-2 border transition flex flex-col justify-between ${
                    daySchedules.length > 0
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-800/40'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {dayNum}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-16">
                    {daySchedules.map((sch) => {
                      const crs = courses.find((c) => c.id === sch.courseId);
                      return (
                        <div
                          key={sch.id}
                          onClick={() => navigate(`/schedule/${sch.id}`)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-600 text-white truncate cursor-pointer hover:bg-indigo-700 transition"
                          title={`${crs?.name} (${sch.startTime})`}
                        >
                          {sch.startTime} {crs?.code || crs?.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Schedule Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={editingSchedule}
      />
    </div>
  );
}
