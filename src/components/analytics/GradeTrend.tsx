import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { DEFAULT_GRADE_WEIGHTS, GRADE_CATEGORIES, TYPE_TO_GRADE_CATEGORY } from '../../types';
import { cn, percentageToLetterGrade } from '../../utils/helpers';
import {
  format, subWeeks, eachWeekOfInterval,
  startOfWeek, endOfWeek, isWithinInterval,
} from 'date-fns';

type Range = '8w' | '16w' | 'all';

interface WeekPoint {
  label: string;       // "May 6"
  avg: number | null;  // weighted GWA for that week's graded items
  count: number;
}

function computeWeeklyGWA(
  weekStart: Date,
  weekEnd: Date,
  subjects: ReturnType<typeof useSubjects>['subjects'],
  assignments: ReturnType<typeof useAssignments>['assignments'],
): { avg: number; count: number } | null {
  // All assignments graded in this week (by updatedAt)
  const weekGraded = assignments.filter(a =>
    a.status === 'graded' &&
    a.scoreEarned !== undefined &&
    a.totalScore &&
    a.totalScore > 0 &&
    isWithinInterval(new Date(a.updatedAt), { start: weekStart, end: weekEnd })
  );
  if (weekGraded.length === 0) return null;

  // Weighted average per subject, then weighted by units
  const bySubject = subjects.map(sub => {
    const items = weekGraded.filter(a => a.subjectId === sub.subjectId);
    if (items.length === 0) return null;

    const weights = sub.gradeWeights || DEFAULT_GRADE_WEIGHTS;
    let num = 0, den = 0;
    for (const cat of GRADE_CATEGORIES) {
      const catItems = items.filter(
        a => (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === cat.value
      );
      if (catItems.length > 0 && weights[cat.value] > 0) {
        const earned = catItems.reduce((s, a) => s + a.scoreEarned!, 0);
        const possible = catItems.reduce((s, a) => s + a.totalScore!, 0);
        num += (earned / possible) * 100 * weights[cat.value];
        den += weights[cat.value];
      }
    }
    const subAvg = den > 0
      ? num / den
      : (items.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) / items.length);

    return { avg: subAvg, weight: sub.weight ?? 3 };
  }).filter(Boolean) as { avg: number; weight: number }[];

  if (bySubject.length === 0) return null;

  const totalScore = bySubject.reduce((s, r) => s + r.avg * r.weight, 0);
  const totalUnits = bySubject.reduce((s, r) => s + r.weight, 0);
  return { avg: totalScore / totalUnits, count: weekGraded.length };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length || payload[0].value == null) return null;
  const val: number = payload[0].value;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-100 dark:border-white/10 text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
        {val.toFixed(1)}% · {percentageToLetterGrade(val)}
      </p>
      {payload[0].payload.count > 0 && (
        <p className="text-gray-400 mt-0.5">{payload[0].payload.count} item{payload[0].payload.count > 1 ? 's' : ''} graded</p>
      )}
    </div>
  );
};

export function GradeTrend() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();
  const [range, setRange] = useState<Range>('8w');

  const { points, trend, firstAvg, lastAvg } = useMemo(() => {
    const graded = assignments.filter(
      a => a.status === 'graded' && a.scoreEarned !== undefined && a.totalScore && a.totalScore > 0
    );
    if (graded.length === 0) return { points: [], trend: 0, firstAvg: null, lastAvg: null };

    const earliest = new Date(Math.min(...graded.map(a => a.updatedAt)));
    const now = new Date();

    const rangeStart =
      range === '8w' ? subWeeks(now, 8)
      : range === '16w' ? subWeeks(now, 16)
      : earliest;

    const weeks = eachWeekOfInterval(
      { start: rangeStart < earliest ? earliest : rangeStart, end: now },
      { weekStartsOn: 1 }
    );

    const pts: WeekPoint[] = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const result = computeWeeklyGWA(weekStart, weekEnd, subjects, assignments);
      return {
        label: format(weekStart, 'MMM d'),
        avg: result?.avg ?? null,
        count: result?.count ?? 0,
      };
    });

    const withData = pts.filter(p => p.avg !== null);
    const firstAvg = withData[0]?.avg ?? null;
    const lastAvg = withData[withData.length - 1]?.avg ?? null;
    const trend = firstAvg !== null && lastAvg !== null ? lastAvg - firstAvg : 0;

    return { points: pts, trend, firstAvg, lastAvg };
  }, [assignments, subjects, range]);

  const hasData = points.some(p => p.avg !== null);

  const TrendIcon = trend > 1 ? TrendingUp : trend < -1 ? TrendingDown : Minus;
  const trendColor =
    trend > 1 ? 'text-green-600 dark:text-green-400'
    : trend < -1 ? 'text-red-500 dark:text-red-400'
    : 'text-gray-500';

  if (!hasData) return null;

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-500" />
            Grade Trend Over Time
          </h2>
          {lastAvg !== null && (
            <p className="text-xs text-gray-500 mt-0.5">
              Weekly weighted GWA · currently{' '}
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {lastAvg.toFixed(1)}%
              </span>
            </p>
          )}
        </div>

        {/* Trend badge */}
        {firstAvg !== null && lastAvg !== null && firstAvg !== lastAvg && (
          <div className={cn('flex items-center gap-1 text-sm font-bold shrink-0', trendColor)}>
            <TrendIcon size={16} />
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Range pills */}
      <div className="flex gap-1.5 mb-4">
        {([['8w', '8 weeks'], ['16w', '16 weeks'], ['all', 'All time']] as [Range, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setRange(val)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all',
              range === val
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={points} margin={{ top: 5, right: 10, left: -22, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-white/10" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Target grade reference line — median of all subject targets */}
          <ReferenceLine
            y={subjects.reduce((s, sub) => s + sub.targetGrade, 0) / (subjects.length || 1)}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: 'Target', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#6366f1' }}
            connectNulls={false}
            name="GWA"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-400 mt-2">
        Dashed line = average of your target grades across all subjects.
      </p>
    </div>
  );
}
