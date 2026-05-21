import React, { useMemo } from 'react';
import {
  BookOpen, CheckCircle, AlertTriangle, TrendingUp, Clock, Plus,
  Star, Zap, Calendar, Target, BarChart2, Award
} from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { useAuth } from '../../contexts/AuthContext';
import { Assignment, STATUS_CONFIG, PRIORITY_CONFIG, ASSIGNMENT_TYPES } from '../../types';
import {
  formatDueDate, calculateGPA, percentageToLetterGrade,
  colorWithOpacity, getDaysUntilDue, cn
} from '../../utils/helpers';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { currentUser } = useAuth();
  const { assignments, loading: aLoading } = useAssignments();
  const { subjects, loading: sLoading } = useSubjects();

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = assignments.filter(a =>
      (a.status === 'pending' || a.status === 'in-progress') &&
      getDaysUntilDue(a.dueDate) >= 0 &&
      getDaysUntilDue(a.dueDate) <= 7
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const overdue = assignments.filter(a => a.status === 'overdue');
    const graded = assignments.filter(a =>
      a.status === 'graded' && a.scoreEarned !== undefined && a.totalScore
    );

    const completionRate = assignments.length > 0
      ? Math.round(((assignments.filter(a => a.status === 'graded' || a.status === 'submitted').length) / assignments.length) * 100)
      : 0;

    const gpaScores = graded.map(a => ({ earned: a.scoreEarned!, total: a.totalScore! }));
    const gpa = calculateGPA(gpaScores);

    const totalEarned = graded.reduce((s, a) => s + a.scoreEarned!, 0);
    const totalPossible = graded.reduce((s, a) => s + a.totalScore!, 0);
    const averagePercent = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

    const recentGrades = graded
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    return { upcoming, overdue, graded, completionRate, gpa, averagePercent, recentGrades };
  }, [assignments]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getName = () => currentUser?.displayName?.split(' ')[0] || 'Student';

  if (aLoading || sLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Greeting Header */}
      <div className="relative overflow-hidden card p-6 bg-gradient-to-br from-indigo-600 to-violet-600 border-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-16" />
        <div className="absolute bottom-0 left-16 w-32 h-32 bg-white/5 rounded-full translate-y-16" />
        <div className="relative">
          <p className="text-indigo-100 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">{getName()} 👋</h1>
          <p className="text-indigo-100 text-sm mt-2">
            {stats.overdue.length > 0
              ? `You have ${stats.overdue.length} overdue assignment${stats.overdue.length > 1 ? 's' : ''} — let's get on it!`
              : stats.upcoming.length > 0
              ? `${stats.upcoming.length} upcoming assignment${stats.upcoming.length > 1 ? 's' : ''} this week. You've got this!`
              : "You're all caught up! Great work 🎉"}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => onNavigate('assignments')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-50 transition-colors active:scale-95"
            >
              <Plus size={16} />
              Add Assignment
            </button>
            <div className="text-indigo-100 text-sm font-medium">
              GPA: <span className="text-white font-bold text-lg">{stats.gpa.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Subjects', value: subjects.length, icon: BookOpen,
            color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10',
            onClick: () => onNavigate('subjects')
          },
          {
            label: 'Pending', value: assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length,
            icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10',
            onClick: () => onNavigate('assignments')
          },
          {
            label: 'Overdue', value: stats.overdue.length, icon: AlertTriangle,
            color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10',
            onClick: () => onNavigate('assignments')
          },
          {
            label: 'Completion', value: `${stats.completionRate}%`, icon: CheckCircle,
            color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10',
            onClick: () => onNavigate('analytics')
          },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={stat.onClick}
            className="card p-4 text-left hover:shadow-md transition-all active:scale-95"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" />
              Upcoming
            </h2>
            <button onClick={() => onNavigate('assignments')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              View all
            </button>
          </div>

          {stats.upcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
              <p className="text-sm">No upcoming assignments! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcoming.slice(0, 5).map(a => {
                const sub = subjects.find(s => s.subjectId === a.subjectId);
                const days = getDaysUntilDue(a.dueDate);
                return (
                  <div key={a.assignmentId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <div
                      className="w-2 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: sub?.color || '#6366f1' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 truncate">{sub?.subjectName || 'Unknown'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'text-xs font-bold',
                        days === 0 ? 'text-red-500' : days === 1 ? 'text-amber-500' : 'text-gray-500'
                      )}>
                        {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </p>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        PRIORITY_CONFIG[a.priority].bg,
                        PRIORITY_CONFIG[a.priority].color
                      )}>
                        {a.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Recent Grades
            </h2>
            <button onClick={() => onNavigate('grades')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              View all
            </button>
          </div>

          {stats.recentGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star size={32} className="mx-auto mb-2 text-amber-300" />
              <p className="text-sm">No grades yet. Keep studying!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentGrades.map(a => {
                const sub = subjects.find(s => s.subjectId === a.subjectId);
                const pct = (a.scoreEarned! / a.totalScore!) * 100;
                return (
                  <div key={a.assignmentId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 truncate">{sub?.subjectName || 'Unknown'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'text-sm font-bold',
                        pct >= 90 ? 'text-green-600 dark:text-green-400' :
                        pct >= 75 ? 'text-blue-600 dark:text-blue-400' :
                        pct >= 60 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      )}>
                        {pct.toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-400">{a.scoreEarned}/{a.totalScore}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdue.length > 0 && (
        <div className="card p-4 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-bold text-red-700 dark:text-red-400">Overdue Assignments</h3>
          </div>
          <div className="space-y-2">
            {stats.overdue.slice(0, 3).map(a => {
              const sub = subjects.find(s => s.subjectId === a.subjectId);
              return (
                <div key={a.assignmentId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-red-700 dark:text-red-300 font-medium">{a.title}</span>
                  </div>
                  <span className="text-red-500 text-xs">{sub?.subjectName}</span>
                </div>
              );
            })}
            {stats.overdue.length > 3 && (
              <button onClick={() => onNavigate('assignments')} className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium">
                +{stats.overdue.length - 3} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Subject Progress */}
      {subjects.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target size={18} className="text-violet-500" />
              Subject Progress
            </h2>
            <button onClick={() => onNavigate('grades')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Details
            </button>
          </div>
          <div className="space-y-3">
            {subjects.slice(0, 5).map(sub => {
              const subAssignments = assignments.filter(a => a.subjectId === sub.subjectId && a.status === 'graded' && a.scoreEarned !== undefined && a.totalScore);
              const avg = subAssignments.length > 0
                ? (subAssignments.reduce((s, a) => s + a.scoreEarned!, 0) /
                   subAssignments.reduce((s, a) => s + a.totalScore!, 0)) * 100
                : null;
              return (
                <div key={sub.subjectId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {sub.icon} {sub.subjectName}
                    </span>
                    <span className="text-xs font-bold" style={{ color: sub.color }}>
                      {avg !== null ? `${avg.toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${avg !== null ? Math.min(avg, 100) : 0}%`,
                        backgroundColor: sub.color
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>{subAssignments.length} graded</span>
                    <span>Target: {sub.targetGrade}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
