import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 sm:p-4.5 shadow-xs hover:shadow-md hover:border-indigo-300/60 dark:hover:border-indigo-800/60 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate" title={title}>
          {title}
        </p>
        <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          {value}
        </h3>
        {subtitle && (
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 truncate" title={subtitle}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
