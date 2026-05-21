import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday,
  isSameDay, parseISO
} from 'date-fns';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { Assignment, STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { colorWithOpacity, cn } from '../../utils/helpers';

export function CalendarView() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const assignmentsByDay = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    assignments.forEach(a => {
      const key = a.dueDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return map;
  }, [assignments]);

  const selectedDayAssignments = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, 'yyyy-MM-dd');
    return assignmentsByDay.get(key) || [];
  }, [selectedDay, assignmentsByDay]);

  const getDayAssignments = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    return assignmentsByDay.get(key) || [];
  };

  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-gray-500">{format(currentMonth, 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden mb-5">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
          {DOW.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayAssignments = getDayAssignments(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isTodayDay = isToday(day);
            const hasOverdue = dayAssignments.some(a => a.status === 'overdue');

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'relative min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border-b border-r border-gray-100 dark:border-white/5 cursor-pointer transition-colors',
                  !isCurrentMonth && 'opacity-30',
                  isSelected && 'bg-indigo-50 dark:bg-indigo-500/10',
                  !isSelected && 'hover:bg-gray-50 dark:hover:bg-white/5'
                )}
              >
                {/* Day number */}
                <div className={cn(
                  'w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1',
                  isTodayDay && 'bg-indigo-600 text-white',
                  !isTodayDay && isSelected && 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
                  !isTodayDay && !isSelected && 'text-gray-700 dark:text-gray-300'
                )}>
                  {format(day, 'd')}
                </div>

                {/* Assignment dots */}
                <div className="space-y-0.5">
                  {dayAssignments.slice(0, 3).map((a, i) => {
                    const sub = subjects.find(s => s.subjectId === a.subjectId);
                    return (
                      <div
                        key={i}
                        className="hidden sm:block text-xs truncate px-1 py-0.5 rounded font-medium leading-tight"
                        style={{
                          backgroundColor: colorWithOpacity(sub?.color || '#6366f1', 0.15),
                          color: sub?.color || '#6366f1',
                        }}
                      >
                        {a.title}
                      </div>
                    );
                  })}

                  {/* Mobile: just dots */}
                  {dayAssignments.length > 0 && (
                    <div className="flex sm:hidden gap-0.5 flex-wrap">
                      {dayAssignments.slice(0, 4).map((a, i) => {
                        const sub = subjects.find(s => s.subjectId === a.subjectId);
                        return (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {dayAssignments.length > 3 && (
                    <div className="hidden sm:block text-xs text-gray-400 font-medium px-1">
                      +{dayAssignments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Panel */}
      {selectedDay && (
        <div className="card p-5 animate-slide-up">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalIcon size={18} className="text-indigo-500" />
            {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            {isToday(selectedDay) && (
              <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full font-semibold">Today</span>
            )}
          </h2>

          {selectedDayAssignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No assignments due this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedDayAssignments.map(a => {
                const sub = subjects.find(s => s.subjectId === a.subjectId);
                const statusConf = STATUS_CONFIG[a.status];
                return (
                  <div key={a.assignmentId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: sub?.color || '#6366f1' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {sub && <span className="text-xs text-gray-500">{sub.icon} {sub.subjectName}</span>}
                        {a.dueTime && <span className="text-xs text-gray-400">at {a.dueTime}</span>}
                      </div>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', statusConf.bg, statusConf.color)}>
                      {statusConf.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
