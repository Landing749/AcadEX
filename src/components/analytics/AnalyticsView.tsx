import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieIcon, CheckCircle } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { ASSIGNMENT_TYPES } from '../../types';
import { percentageToLetterGrade, cn } from '../../utils/helpers';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { GradeTrend } from './GradeTrend';
import { SubjectDifficultyRanking } from './SubjectDifficultyRanking';

export function AnalyticsView() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();

  const graded = useMemo(() =>
    assignments.filter(a => a.status === 'graded' && a.scoreEarned !== undefined && a.totalScore),
  [assignments]);

  // Grade by subject chart data
  const subjectData = useMemo(() =>
    subjects.map(sub => {
      const subGraded = graded.filter(a => a.subjectId === sub.subjectId);
      if (subGraded.length === 0) return null;
      const earned = subGraded.reduce((s, a) => s + a.scoreEarned!, 0);
      const possible = subGraded.reduce((s, a) => s + a.totalScore!, 0);
      return {
        name: sub.subjectName.length > 10 ? sub.subjectName.slice(0, 10) + '…' : sub.subjectName,
        fullName: sub.subjectName,
        avg: parseFloat(((earned / possible) * 100).toFixed(1)),
        color: sub.color,
        count: subGraded.length,
      };
    }).filter(Boolean).sort((a, b) => b!.avg - a!.avg),
  [graded, subjects]);

  // Grade trend (last 30 days)
  const trendData = useMemo(() => {
    const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return last30.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayGraded = graded.filter(a => a.dueDate === dayStr && a.scoreEarned !== undefined && a.totalScore);
      const avg = dayGraded.length > 0
        ? (dayGraded.reduce((s, a) => s + a.scoreEarned!, 0) /
           dayGraded.reduce((s, a) => s + a.totalScore!, 0)) * 100
        : null;
      return {
        date: format(day, 'MMM d'),
        avg: avg ? parseFloat(avg.toFixed(1)) : null,
      };
    }).filter(d => d.avg !== null);
  }, [graded]);

  // Assignment type breakdown
  const typeData = useMemo(() =>
    ASSIGNMENT_TYPES.map(t => {
      const count = assignments.filter(a => a.type === t.value).length;
      return count > 0 ? { name: t.label, value: count, icon: t.icon } : null;
    }).filter(Boolean),
  [assignments]);

  // Status breakdown
  const statusData = useMemo(() => {
    const counts = {
      pending: assignments.filter(a => a.status === 'pending').length,
      'in-progress': assignments.filter(a => a.status === 'in-progress').length,
      submitted: assignments.filter(a => a.status === 'submitted').length,
      graded: assignments.filter(a => a.status === 'graded').length,
      overdue: assignments.filter(a => a.status === 'overdue').length,
    };
    return [
      { name: 'Pending', value: counts.pending, color: '#94a3b8' },
      { name: 'In Progress', value: counts['in-progress'], color: '#3b82f6' },
      { name: 'Submitted', value: counts.submitted, color: '#8b5cf6' },
      { name: 'Graded', value: counts.graded, color: '#10b981' },
      { name: 'Overdue', value: counts.overdue, color: '#f43f5e' },
    ].filter(d => d.value > 0);
  }, [assignments]);

  const completionRate = assignments.length > 0
    ? Math.round(((graded.length + assignments.filter(a => a.status === 'submitted').length) / assignments.length) * 100)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-100 dark:border-white/10 text-xs">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || p.fill }}>
              {p.name}: {typeof p.value === 'number' ? (p.value % 1 ? `${p.value}%` : p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500">Track your academic performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Assignments', value: assignments.length, sub: 'all time', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'Graded', value: graded.length, sub: `${completionRate}% completion`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'Overdue', value: assignments.filter(a => a.status === 'overdue').length, sub: 'need attention', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
          {
            label: 'Avg Grade',
            value: graded.length > 0
              ? `${(graded.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) / graded.length).toFixed(0)}%`
              : 'N/A',
            sub: graded.length > 0 ? percentageToLetterGrade((graded.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) / graded.length)) : '–',
            color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10'
          },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', stat.bg)}>
              <CheckCircle size={16} className={stat.color} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Grade by Subject Bar Chart */}
      {subjectData.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 size={18} className="text-indigo-500" />
            Average Grade by Subject
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-white/10" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" name="Average %" radius={[6, 6, 0, 0]}>
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry!.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Grade Trend Over Time */}
      <GradeTrend />

      {/* Subject Difficulty Ranking */}
      <SubjectDifficultyRanking />

      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Status Breakdown */}
        {statusData.length > 0 && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-emerald-500" />
              Assignment Status
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Type Breakdown */}
        {typeData.length > 0 && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-amber-500" />
              By Assignment Type
            </h2>
            <div className="space-y-2 mt-2">
              {typeData.map((item) => {
                if (!item) return null;
                const pct = Math.round((item.value / assignments.length) * 100);
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-sm w-5">{item.icon}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-24">{item.name}</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-20">
          <BarChart2 size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">No data yet</h3>
          <p className="text-sm text-gray-500">Add assignments and grades to see your analytics.</p>
        </div>
      )}
    </div>
  );
}