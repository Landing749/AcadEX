import React, { useMemo } from 'react';
import { Brain } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { DEFAULT_GRADE_WEIGHTS, GRADE_CATEGORIES, TYPE_TO_GRADE_CATEGORY } from '../../types';
import { cn } from '../../utils/helpers';

interface DifficultyRow {
  subjectId: string;
  name: string;
  icon: string;
  color: string;
  avgGrade: number;
  totalEstimatedHours: number;
  hoursPerPoint: number;     // effort/outcome ratio — higher = harder
  difficultyScore: number;   // 0–100 normalised for display
  label: 'Very Hard' | 'Hard' | 'Moderate' | 'Easy';
}

function labelFromScore(score: number): DifficultyRow['label'] {
  if (score >= 75) return 'Very Hard';
  if (score >= 50) return 'Hard';
  if (score >= 25) return 'Moderate';
  return 'Easy';
}

const LABEL_STYLES: Record<DifficultyRow['label'], string> = {
  'Very Hard': 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  'Hard':      'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
  'Moderate':  'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'Easy':      'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
};

export function SubjectDifficultyRanking() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();

  const rows = useMemo((): DifficultyRow[] => {
    const candidates = subjects.map(sub => {
      const graded = assignments.filter(
        a => a.subjectId === sub.subjectId &&
          a.status === 'graded' &&
          a.scoreEarned !== undefined &&
          a.totalScore && a.totalScore > 0
      );
      if (graded.length === 0) return null;

      // Weighted average grade
      const weights = sub.gradeWeights || DEFAULT_GRADE_WEIGHTS;
      let num = 0, den = 0;
      for (const cat of GRADE_CATEGORIES) {
        const items = graded.filter(
          a => (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === cat.value
        );
        if (items.length > 0 && weights[cat.value] > 0) {
          const earned = items.reduce((s, a) => s + a.scoreEarned!, 0);
          const possible = items.reduce((s, a) => s + a.totalScore!, 0);
          num += (earned / possible) * 100 * weights[cat.value];
          den += weights[cat.value];
        }
      }
      const avgGrade = den > 0 ? num / den
        : graded.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) / graded.length;

      // Total estimated hours for all assignments in this subject
      const allItems = assignments.filter(a => a.subjectId === sub.subjectId);
      const totalEstimatedHours = allItems.reduce(
        (s, a) => s + (a.estimatedTime ?? 0), 0
      ) / 60; // estimatedTime is in minutes

      if (totalEstimatedHours === 0) return null;

      // Hours per grade point: higher = you work a lot but don't score well = hard
      const hoursPerPoint = totalEstimatedHours / avgGrade;

      return {
        subjectId: sub.subjectId,
        name: sub.subjectName,
        icon: sub.icon,
        color: sub.color,
        avgGrade,
        totalEstimatedHours,
        hoursPerPoint,
        difficultyScore: 0, // normalised below
        label: 'Moderate' as DifficultyRow['label'],
      };
    }).filter(Boolean) as Omit<DifficultyRow, 'difficultyScore' | 'label'>[];

    if (candidates.length === 0) return [];

    // Normalise hoursPerPoint to 0–100
    const min = Math.min(...candidates.map(c => c.hoursPerPoint));
    const max = Math.max(...candidates.map(c => c.hoursPerPoint));
    const spread = max - min || 1;

    return candidates
      .map(c => {
        const difficultyScore = ((c.hoursPerPoint - min) / spread) * 100;
        return {
          ...c,
          difficultyScore,
          label: labelFromScore(difficultyScore),
        };
      })
      .sort((a, b) => b.difficultyScore - a.difficultyScore);
  }, [subjects, assignments]);

  if (rows.length < 2) return null; // not meaningful with one subject

  const hardest = rows[0];
  const easiest = rows[rows.length - 1];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={18} className="text-rose-500" />
        <h2 className="font-bold text-gray-900 dark:text-white">Subject Difficulty Ranking</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Based on estimated study time vs. grade earned — higher effort for lower scores = harder.
      </p>

      {/* Insight callout */}
      <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 mb-4">
        <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 leading-relaxed">
          ⚡ <strong>{hardest.icon} {hardest.name}</strong> is costing you the most effort per grade point.
          Consider whether your study approach is working, or if you need extra help.
        </p>
        {easiest.subjectId !== hardest.subjectId && (
          <p className="text-xs text-rose-600 dark:text-rose-500 mt-1">
            ✅ <strong>{easiest.icon} {easiest.name}</strong> is your most efficient subject — good ROI on study time.
          </p>
        )}
      </div>

      {/* Ranking list */}
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={row.subjectId}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                <span className="text-base">{row.icon}</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {row.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {row.totalEstimatedHours.toFixed(1)}h · {row.avgGrade.toFixed(0)}%
                </span>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  LABEL_STYLES[row.label]
                )}>
                  {row.label}
                </span>
              </div>
            </div>
            {/* Bar */}
            <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${row.difficultyScore}%`,
                  backgroundColor: row.difficultyScore >= 75 ? '#f43f5e'
                    : row.difficultyScore >= 50 ? '#f97316'
                    : row.difficultyScore >= 25 ? '#f59e0b'
                    : '#10b981',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Tip: difficulty ranking updates automatically as you log study time and grades.
      </p>
    </div>
  );
}
