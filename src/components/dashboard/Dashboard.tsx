import React, { useMemo } from 'react';
import {
  BookOpen, CheckCircle, AlertTriangle, TrendingUp, Clock, Plus,
  Star, Calendar, Target, Award, ChevronRight, Zap, Flame, ArrowUpRight
} from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { useAuth } from '../../contexts/AuthContext';
import { Assignment, STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import {
  formatDueDate, calculateGPA, percentageToLetterGrade,
  getDaysUntilDue, cn
} from '../../utils/helpers';
import { TodayWidget } from './TodayWidget';
import { DashboardHeroIllustration } from '../illustrations';

interface DashboardProps { onNavigate: (page: string) => void; }

// ── Animated number ──────────────────────────────────────────────────────────
function AnimatedStat({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  return (
    <span className="tabular-nums" style={{ animation: 'countUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
      {value}{suffix}
    </span>
  );
}

// ── Mini sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h - ((data[data.length-1]-min)/range)*h} r="3" fill={color}/>
    </svg>
  );
}

// ── Grade badge ───────────────────────────────────────────────────────────────
function GradeBadge({ pct }: { pct: number }) {
  const { label, bg, text } =
    pct >= 97 ? { label: 'A+', bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' } :
    pct >= 93 ? { label: 'A',  bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' } :
    pct >= 90 ? { label: 'A-', bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' } :
    pct >= 87 ? { label: 'B+', bg: 'bg-blue-100 dark:bg-blue-500/15',    text: 'text-blue-700 dark:text-blue-400'    } :
    pct >= 83 ? { label: 'B',  bg: 'bg-blue-100 dark:bg-blue-500/15',    text: 'text-blue-700 dark:text-blue-400'    } :
    pct >= 80 ? { label: 'B-', bg: 'bg-blue-100 dark:bg-blue-500/15',    text: 'text-blue-700 dark:text-blue-400'    } :
    pct >= 75 ? { label: 'C+', bg: 'bg-amber-100 dark:bg-amber-500/15',  text: 'text-amber-700 dark:text-amber-400'  } :
    pct >= 70 ? { label: 'C',  bg: 'bg-amber-100 dark:bg-amber-500/15',  text: 'text-amber-700 dark:text-amber-400'  } :
              { label: 'D',  bg: 'bg-red-100 dark:bg-red-500/15',       text: 'text-red-700 dark:text-red-400'       };
  return (
    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-lg', bg, text)}>{label}</span>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { currentUser } = useAuth();
  const { assignments, loading: aLoading } = useAssignments();
  const { subjects, loading: sLoading }   = useSubjects();

  const stats = useMemo(() => {
    const upcoming = assignments.filter(a =>
      (a.status === 'pending' || a.status === 'in-progress') &&
      getDaysUntilDue(a.dueDate) >= 0 && getDaysUntilDue(a.dueDate) <= 7
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const overdue = assignments.filter(a => a.status === 'overdue');
    const graded  = assignments.filter(a =>
      a.status === 'graded' && a.scoreEarned !== undefined && a.totalScore
    );
    const completionRate = assignments.length > 0
      ? Math.round((assignments.filter(a => a.status === 'graded' || a.status === 'submitted').length / assignments.length) * 100)
      : 0;
    const gpa  = calculateGPA(graded.map(a => ({ earned: a.scoreEarned!, total: a.totalScore! })));
    const totalEarned   = graded.reduce((s, a) => s + a.scoreEarned!, 0);
    const totalPossible = graded.reduce((s, a) => s + a.totalScore!, 0);
    const averagePercent = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    const recentGrades  = [...graded].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

    // Build per-week completion for sparkline (last 6 items)
    const sparkData = graded.slice(-6).map(a => (a.scoreEarned! / a.totalScore!) * 100);

    return { upcoming, overdue, graded, completionRate, gpa, averagePercent, recentGrades, sparkData };
  }, [assignments]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getName = () => currentUser?.displayName?.split(' ')[0] || 'Student';
  const urgencyEmoji = stats.overdue.length > 0 ? '⚡' : stats.upcoming.length > 0 ? '📚' : '🎉';

  // Loading skeleton
  if (aLoading || sLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="skeleton h-44 rounded-3xl"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl"/>)}
        </div>
        <div className="skeleton h-48 rounded-2xl"/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton h-64 rounded-2xl"/>
          <div className="skeleton h-64 rounded-2xl"/>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    {
      label: 'Subjects', value: subjects.length, icon: BookOpen,
      gradient: 'from-indigo-500 to-violet-600',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/12',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      accent: '#6366f1',
      onClick: () => onNavigate('subjects'),
      sub: `${subjects.length > 0 ? 'Enrolled' : 'No subjects yet'}`,
    },
    {
      label: 'Pending', value: assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50 dark:bg-amber-500/12',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accent: '#f59e0b',
      onClick: () => onNavigate('assignments'),
      sub: `${stats.upcoming.length} due this week`,
    },
    {
      label: 'Overdue', value: stats.overdue.length, icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-50 dark:bg-red-500/12',
      iconColor: 'text-red-600 dark:text-red-400',
      accent: '#ef4444',
      onClick: () => onNavigate('assignments'),
      sub: stats.overdue.length > 0 ? 'Needs attention!' : 'All clear ✓',
      urgent: stats.overdue.length > 0,
    },
    {
      label: 'Completion', value: stats.completionRate, icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/12',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accent: '#10b981',
      onClick: () => onNavigate('analytics'),
      sub: `${stats.graded.length} graded total`,
      suffix: '%',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes countUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .hero-banner {
          background: linear-gradient(135deg, #3730a3 0%, #4f46e5 35%, #6d28d9 70%, #4338ca 100%);
          background-size: 300% 300%;
          animation: gradShift 10s ease infinite;
        }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .stat-card-shine::after {
          content:''; position:absolute; top:-50%; left:-75%; width:50%; height:200%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent);
          transform: skewX(-20deg); transition: left 0.6s ease;
        }
        .stat-card-shine:hover::after { left: 130%; }
        .progress-animated {
          position: relative; overflow: hidden; border-radius: 999px;
        }
        .progress-animated::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2.2s ease-in-out infinite;
          background-size: 200% 100%;
        }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        .card-hover-lift { transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
        .card-hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .dark .card-hover-lift:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
        .overdue-pulse { animation: overdueGlow 2s ease-in-out infinite; }
        @keyframes overdueGlow { 0%,100%{box-shadow:0 0 0 rgba(239,68,68,0)} 50%{box-shadow:0 0 0 4px rgba(239,68,68,0.12)} }
        .grade-row { transition: all 0.2s ease; }
        .grade-row:hover { background: rgba(99,102,241,0.04); }
        .dark .grade-row:hover { background: rgba(255,255,255,0.04); }
      `}</style>

      <div className="p-4 sm:p-5 lg:p-6 space-y-5 pb-20 lg:pb-6">

        {/* ── Hero Banner ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl hero-banner shadow-2xl shadow-indigo-500/25 animate-slide-up">
          {/* Decorative background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5 blur-xl"/>
            <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full bg-violet-400/10 blur-xl"/>
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)'
            }}/>
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}/>
          </div>

          {/* Illustration */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2 pointer-events-none opacity-30 sm:opacity-50">
            <DashboardHeroIllustration className="h-full w-auto max-h-44"/>
          </div>

          <div className="relative p-5 sm:p-7">
            {/* Greeting */}
            <div className="flex items-start justify-between">
              <div className="max-w-xs sm:max-w-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-indigo-300 text-sm font-medium">{getGreeting()},</span>
                  <span className="text-lg">{urgencyEmoji}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {getName()}
                </h1>
                <p className="text-indigo-200/80 text-sm mt-2 leading-relaxed">
                  {stats.overdue.length > 0
                    ? <><span className="text-red-300 font-semibold">{stats.overdue.length} overdue</span> — let's tackle them now!</>
                    : stats.upcoming.length > 0
                    ? <><span className="text-white font-semibold">{stats.upcoming.length} assignments</span> due this week. You've got this!</>
                    : <>All caught up! <span className="text-emerald-300 font-semibold">Excellent work 🎉</span></>}
                </p>
              </div>
            </div>

            {/* Quick stats + CTA */}
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <button onClick={() => onNavigate('assignments')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 font-bold rounded-2xl text-sm hover:bg-indigo-50 active:scale-95 transition-all shadow-lg shadow-indigo-900/20">
                <Plus size={15}/> New Assignment
              </button>

              {[
                { label: 'GPA', value: stats.gpa.toFixed(2), color: 'text-white' },
                { label: 'Avg', value: `${stats.averagePercent.toFixed(0)}%`, color: 'text-white' },
              ].map(s => (
                <div key={s.label} className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest">{s.label}</p>
                  <p className={cn('font-bold text-lg leading-tight', s.color)}>{s.value}</p>
                </div>
              ))}

              {stats.graded.length > 0 && (
                <div className="hidden sm:block px-3 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <p className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest mb-1">Trend</p>
                  <Sparkline data={stats.sparkData} color="#a5b4fc"/>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={i} onClick={s.onClick}
                className={cn(
                  'card stat-card-shine card-hover-lift relative overflow-hidden p-4 text-left active:scale-[0.97] transition-all',
                  s.urgent && 'overdue-pulse border-red-200/80 dark:border-red-500/20'
                )}
                style={{ animationDelay: `${i * 60}ms`, animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

                {/* Icon */}
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-3.5', s.iconBg)}>
                  <Icon size={19} className={s.iconColor}/>
                </div>

                {/* Value */}
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                  <AnimatedStat value={s.value} suffix={s.suffix}/>
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
                <p className={cn('text-[11px] mt-1', s.urgent ? 'text-red-500 font-semibold' : 'text-gray-400 dark:text-gray-500')}>
                  {s.sub}
                </p>

                {/* Arrow */}
                <ArrowUpRight size={13} className="absolute top-3.5 right-3.5 text-gray-300 dark:text-gray-600"/>

                {/* Subtle gradient corner */}
                <div className={cn('absolute bottom-0 right-0 w-16 h-16 rounded-tl-full opacity-5 bg-gradient-to-tl', s.gradient)}/>
              </button>
            );
          })}
        </div>

        {/* ── Today Widget ───────────────────────────────────────────────── */}
        <div className="animate-slide-up stagger-3">
          <TodayWidget/>
        </div>

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Upcoming assignments */}
          <div className="card p-5 card-hover-lift animate-slide-up stagger-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/12 flex items-center justify-center">
                  <Calendar size={15} className="text-indigo-600 dark:text-indigo-400"/>
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Upcoming</h2>
                {stats.upcoming.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold">
                    {stats.upcoming.length}
                  </span>
                )}
              </div>
              <button onClick={() => onNavigate('assignments')}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold transition-colors">
                View all <ChevronRight size={12}/>
              </button>
            </div>

            {stats.upcoming.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-emerald-500"/>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">You're all caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No upcoming assignments this week</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.upcoming.slice(0, 5).map((a, idx) => {
                  const sub  = subjects.find(s => s.subjectId === a.subjectId);
                  const days = getDaysUntilDue(a.dueDate);
                  const isUrgent = days <= 1;
                  return (
                    <div key={a.assignmentId}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors cursor-pointer"
                      style={{ animationDelay: `${idx * 50}ms` }}>
                      {/* Color stripe */}
                      <div className="w-1 h-10 rounded-full shrink-0" style={{ background: sub?.color || '#6366f1' }}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{sub?.subjectName || '—'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-lg',
                          days === 0 ? 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' :
                          days === 1 ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                          'bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400'
                        )}>
                          {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days}d left`}
                        </span>
                        <div className="mt-1">
                          <span className={cn('text-[10px] font-semibold capitalize',
                            a.priority === 'high' ? 'text-red-500' :
                            a.priority === 'medium' ? 'text-amber-500' : 'text-gray-400')}>
                            {a.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent grades */}
          <div className="card p-5 card-hover-lift animate-slide-up stagger-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-500/12 flex items-center justify-center">
                  <Award size={15} className="text-amber-600 dark:text-amber-400"/>
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Recent Grades</h2>
              </div>
              <button onClick={() => onNavigate('grades')}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold transition-colors">
                View all <ChevronRight size={12}/>
              </button>
            </div>

            {stats.recentGrades.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <Star size={24} className="text-amber-400"/>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No grades yet</p>
                <p className="text-xs text-gray-400 mt-1">Submit assignments to see your grades</p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentGrades.map((a, idx) => {
                  const sub = subjects.find(s => s.subjectId === a.subjectId);
                  const pct = (a.scoreEarned! / a.totalScore!) * 100;
                  return (
                    <div key={a.assignmentId}
                      className="grade-row flex items-center gap-3 p-2.5 rounded-2xl"
                      style={{ animationDelay: `${idx * 50}ms` }}>
                      {/* Subject color dot */}
                      <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: sub?.color || '#6366f1' }}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</p>
                        <p className="text-xs text-gray-400 truncate">{sub?.subjectName || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <GradeBadge pct={pct}/>
                        <div className="text-right">
                          <p className={cn('text-sm font-bold',
                            pct >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                            pct >= 75 ? 'text-blue-600 dark:text-blue-400' :
                            pct >= 60 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          )}>
                            {pct.toFixed(0)}%
                          </p>
                          <p className="text-[10px] text-gray-400">{a.scoreEarned}/{a.totalScore}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Overdue Alert ──────────────────────────────────────────────── */}
        {stats.overdue.length > 0 && (
          <div className="card overflow-hidden border-red-200/80 dark:border-red-500/20 animate-slide-up stagger-6 overdue-pulse">
            <div className="bg-red-50 dark:bg-red-500/[0.07] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <Flame size={16} className="text-red-500"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Overdue Assignments</h3>
                    <p className="text-xs text-red-500/70 dark:text-red-500/60">{stats.overdue.length} need your immediate attention</p>
                  </div>
                </div>
                <button onClick={() => onNavigate('assignments')}
                  className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-bold hover:underline">
                  Fix now <ChevronRight size={12}/>
                </button>
              </div>
              <div className="space-y-2">
                {stats.overdue.slice(0, 3).map(a => {
                  const sub = subjects.find(s => s.subjectId === a.subjectId);
                  return (
                    <div key={a.assignmentId}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-red-100 dark:border-red-500/10">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping-slow"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300 truncate">{a.title}</p>
                        <p className="text-xs text-red-500/70 truncate">{sub?.subjectName || '—'}</p>
                      </div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Overdue</span>
                    </div>
                  );
                })}
                {stats.overdue.length > 3 && (
                  <button onClick={() => onNavigate('assignments')}
                    className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline pl-0.5">
                    + {stats.overdue.length - 3} more overdue assignments
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Subject Progress ───────────────────────────────────────────── */}
        {subjects.length > 0 && (
          <div className="card p-5 card-hover-lift animate-slide-up stagger-7">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-500/12 flex items-center justify-center">
                  <Target size={15} className="text-violet-600 dark:text-violet-400"/>
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Subject Progress</h2>
              </div>
              <button onClick={() => onNavigate('grades')}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold transition-colors">
                Details <ChevronRight size={12}/>
              </button>
            </div>

            <div className="space-y-4">
              {subjects.slice(0, 5).map((sub, idx) => {
                const subA = assignments.filter(a =>
                  a.subjectId === sub.subjectId && a.status === 'graded' && a.scoreEarned !== undefined && a.totalScore
                );
                const avg = subA.length > 0
                  ? (subA.reduce((s, a) => s + a.scoreEarned!, 0) / subA.reduce((s, a) => s + a.totalScore!, 0)) * 100
                  : null;
                const pct = avg !== null ? Math.min(avg, 100) : 0;
                const atTarget = avg !== null && avg >= sub.targetGrade;
                return (
                  <div key={sub.subjectId}
                    style={{ animationDelay: `${idx * 60}ms`, animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{sub.icon}</span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                          {sub.subjectName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {avg !== null && <GradeBadge pct={avg}/>}
                        <span className="text-sm font-bold" style={{ color: sub.color }}>
                          {avg !== null ? `${avg.toFixed(0)}%` : '—'}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full progress-animated transition-all duration-700"
                        style={{ width: `${pct}%`, background: sub.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-gray-400">{subA.length} graded</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-400">Target: {sub.targetGrade}%</span>
                        {atTarget && <span className="text-[10px] text-emerald-500 font-bold">✓ Met</span>}
                        {avg !== null && !atTarget && (
                          <span className="text-[10px] text-red-400 font-bold">
                            {(sub.targetGrade - avg).toFixed(0)}% to go
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 animate-slide-up stagger-8">
          {[
            { label: 'Analytics', icon: TrendingUp, color: '#6366f1', page: 'analytics', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Calendar',  icon: Calendar,   color: '#0ea5e9', page: 'calendar',  bg: 'bg-sky-50 dark:bg-sky-500/10' },
            { label: 'Community', icon: Zap,         color: '#ec4899', page: 'community', bg: 'bg-pink-50 dark:bg-pink-500/10' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.page} onClick={() => onNavigate(action.page)}
                className="card flex flex-col items-center gap-2 py-5 hover:shadow-md active:scale-95 transition-all duration-200">
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', action.bg)}>
                  <Icon size={19} style={{ color: action.color }}/>
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
