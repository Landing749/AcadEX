import React, { useMemo } from 'react';
import { CheckCircle2, Flame, Clock, Sparkles } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { cn } from '../../utils/helpers';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { isToday, parseISO, format } from 'date-fns';

export function TodayWidget() {
  const { assignments } = useAssignments();
  const { subjects }    = useSubjects();

  const todayItems = useMemo(() =>
    assignments.filter(a => {
      try { return isToday(parseISO(a.dueDate)); } catch { return false; }
    }).sort((a, b) => a.dueTime.localeCompare(b.dueTime)),
    [assignments]
  );

  const completedCount = todayItems.filter(a => a.status === 'submitted' || a.status === 'graded').length;
  const progress = todayItems.length > 0 ? Math.round((completedCount / todayItems.length) * 100) : 100;

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  function isUrgent(dueTime: string) {
    const [h, m] = dueTime.split(':').map(Number);
    const due = new Date(); due.setHours(h, m, 0, 0);
    const diff = due.getTime() - Date.now();
    return diff >= 0 && diff < 3_600_000;
  }

  const allDone = todayItems.length > 0 && completedCount === todayItems.length;

  // Empty state
  if (todayItems.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Today's Focus</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">{format(new Date(), 'EEE, MMM d')}</span>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
              <CheckCircle2 size={26} className="text-emerald-500"/>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">Free Day! 🎉</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Nothing is due today. Enjoy the break or get ahead!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <style>{`
        .today-item { transition: all 0.2s ease; }
        .today-item:hover { background: rgba(99,102,241,0.04); }
        .dark .today-item:hover { background: rgba(255,255,255,0.04); }
        .timeline-dot-pulse { animation: timelinePulse 2s ease-in-out infinite; }
        @keyframes timelinePulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 6px rgba(239,68,68,0)} }
      `}</style>

      {/* Header */}
      <div className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Today's Focus</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
              {completedCount}/{todayItems.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">{format(new Date(), 'EEE, MMM d')}</span>
            {allDone && <Sparkles size={13} className="text-amber-400"/>}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden mb-5">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 relative overflow-hidden',
              allDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
            )}
            style={{ width: `${progress}%` }}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}/>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 pb-5 relative">
        {/* Vertical line */}
        <div className="absolute left-[30px] top-0 bottom-5 w-px bg-gray-100 dark:bg-white/8 pointer-events-none"/>

        <div className="space-y-2.5">
          {todayItems.map((item, idx) => {
            const sub      = subjects.find(s => s.subjectId === item.subjectId);
            const done     = item.status === 'submitted' || item.status === 'graded';
            const urgent   = isUrgent(item.dueTime) && !done;
            const statusCfg= STATUS_CONFIG[item.status];
            const dotColor = done ? '#10b981' : urgent ? '#ef4444' : sub?.color || '#6366f1';

            return (
              <div key={item.assignmentId}
                className="today-item flex items-start gap-3 rounded-2xl p-2 -mx-2 cursor-pointer"
                style={{ animationDelay: `${idx * 60}ms` }}>

                {/* Timeline dot */}
                <div className="relative flex items-center justify-center shrink-0 w-8 h-8 z-10">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      done ? 'bg-emerald-500 border-emerald-500' : '',
                      urgent && !done ? 'timeline-dot-pulse' : ''
                    )}
                    style={{ background: done ? undefined : 'white', borderColor: dotColor }}>
                    {done && <CheckCircle2 size={11} className="text-white"/>}
                    {urgent && !done && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>}
                  </div>
                </div>

                {/* Card */}
                <div className={cn(
                  'flex-1 rounded-2xl border px-3.5 py-3 transition-all',
                  done    ? 'bg-gray-50/60 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.05] opacity-65' :
                  urgent  ? 'bg-red-50 dark:bg-red-500/[0.07] border-red-200/80 dark:border-red-500/20' :
                            'bg-gray-50/80 dark:bg-white/[0.04] border-gray-100 dark:border-white/[0.06]'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-semibold truncate leading-tight',
                        done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                      )}>
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {sub && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            <span>{sub.icon}</span>
                            <span className="truncate max-w-[100px]">{sub.subjectName}</span>
                          </span>
                        )}
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-lg font-semibold',
                          statusCfg?.bg, statusCfg?.color
                        )}>
                          {statusCfg?.label}
                        </span>
                        {item.priority === 'high' && !done && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 font-semibold">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'text-xs font-bold tabular-nums',
                        urgent ? 'text-red-500' : done ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {formatTime(item.dueTime)}
                      </p>
                      {urgent && (
                        <div className="flex items-center justify-end gap-0.5 mt-0.5">
                          <Flame size={10} className="text-red-500"/>
                          <span className="text-[10px] text-red-500 font-bold">Due soon!</span>
                        </div>
                      )}
                      {done && (
                        <div className="flex items-center justify-end gap-0.5 mt-0.5">
                          <CheckCircle2 size={10} className="text-emerald-500"/>
                          <span className="text-[10px] text-emerald-500 font-semibold">Done</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All done banner */}
        {allDone && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2.5">
            <Sparkles size={16} className="text-amber-400 shrink-0"/>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Everything done for today! Excellent work! 🌟
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
