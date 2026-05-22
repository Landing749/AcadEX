import React, { useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, Flame } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { cn } from '../../utils/helpers';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { isToday, parseISO, format, isBefore } from 'date-fns';

export function TodayWidget() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();

  const todayItems = useMemo(() =>
    assignments
      .filter(a => {
        try { return isToday(parseISO(a.dueDate)); } catch { return false; }
      })
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime)),
    [assignments]
  );

  const completedCount = todayItems.filter(
    a => a.status === 'submitted' || a.status === 'graded'
  ).length;

  const progress = todayItems.length > 0
    ? Math.round((completedCount / todayItems.length) * 100)
    : 100;

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  function isUrgent(dueTime: string) {
    const [h, m] = dueTime.split(':').map(Number);
    const due = new Date();
    due.setHours(h, m, 0, 0);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    return diffMs >= 0 && diffMs < 3600000; // within next hour
  }

  if (todayItems.length === 0) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📅</span> Today's Focus
          </h2>
          <span className="text-xs text-gray-400">
            {format(new Date(), 'MMM d')}
          </span>
        </div>
        <div className="text-center py-6 text-gray-400">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
          <p className="text-sm font-medium">Nothing due today — nice!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📅</span> Today's Focus
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{completedCount}/{todayItems.length} done</span>
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            progress === 100
              ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
              : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
          )}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timeline list */}
      <div className="relative space-y-0 pl-2">
        {/* Vertical connector line */}
        <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gray-200 dark:bg-white/10" />

        {todayItems.map((item) => {
          const sub = subjects.find(s => s.subjectId === item.subjectId);
          const done = item.status === 'submitted' || item.status === 'graded';
          const urgent = isUrgent(item.dueTime) && !done;
          const statusCfg = STATUS_CONFIG[item.status];

          return (
            <div key={item.assignmentId} className="flex gap-3 pb-3">
              {/* Dot */}
              <div className={cn(
                'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 z-10 flex items-center justify-center',
                done
                  ? 'bg-green-500 border-green-500'
                  : urgent
                    ? 'bg-red-500 border-red-500'
                    : 'bg-white dark:bg-gray-800'
              )} style={{ borderColor: done ? undefined : urgent ? undefined : sub?.color || '#6366f1' }}>
                {done && <CheckCircle2 size={11} className="text-white" />}
              </div>

              {/* Card */}
              <div className={cn(
                'flex-1 p-3 rounded-xl border transition-colors',
                done
                  ? 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 opacity-60'
                  : urgent
                    ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-sm font-semibold truncate',
                      done
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-white'
                    )}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {sub && (
                        <span className="text-xs text-gray-500">
                          {sub.icon} {sub.subjectName}
                        </span>
                      )}
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        statusCfg?.bg, statusCfg?.color
                      )}>
                        {statusCfg?.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      'text-xs font-bold',
                      urgent ? 'text-red-500' : done ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {formatTime(item.dueTime)}
                    </p>
                    {urgent && (
                      <p className="text-xs text-red-500 font-bold mt-0.5 flex items-center justify-end gap-0.5">
                        <Flame size={10} /> Soon
                      </p>
                    )}
                    {item.priority === 'high' && !done && !urgent && (
                      <p className={cn(
                        'text-xs mt-0.5 font-semibold',
                        PRIORITY_CONFIG.high.color
                      )}>
                        High
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
