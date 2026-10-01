import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatIndonesianDate } from '../../utils/dateUtils';

export default function UpcomingScheduleCard({ schedule, course, lecturer }) {
  const navigate = useNavigate();

  if (!schedule) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {course?.code || 'KULIAH'}
            </span>
            <Badge variant={schedule.autoChat ? 'success' : 'default'} dot={schedule.autoChat}>
              {schedule.autoChat ? 'Auto Chat Active' : 'Auto Chat Nonaktif'}
            </Badge>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {course?.name || 'Mata Kuliah'}
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {lecturer ? `${lecturer.name}${lecturer.title ? ', ' + lecturer.title : ''}` : 'Dosen Pengampu'}
          </p>
        </div>

        {lecturer?.avatar && (
          <img
            src={lecturer.avatar}
            alt={lecturer.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 self-start"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 py-1">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{formatIndonesianDate(schedule.date)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{schedule.startTime} - {schedule.endTime}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
          <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{schedule.room}</span>
        </div>
      </div>

      {schedule.notes && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-amber-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl mb-4 border border-amber-100/50 dark:border-slate-800">
          Catatan: {schedule.notes}
        </p>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/schedule/${schedule.id}`)}
        >
          Detail
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={MessageSquare}
          onClick={() => navigate(`/chat?lecturerId=${lecturer?.id}&courseId=${course?.id}`)}
        >
          Chat Dosen
        </Button>
      </div>
    </div>
  );
}
