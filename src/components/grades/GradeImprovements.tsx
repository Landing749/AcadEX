import React, { useMemo, useState } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { cn } from '../../utils/helpers';
import {
  GRADE_CATEGORIES,
  DEFAULT_GRADE_WEIGHTS,
  TYPE_TO_GRADE_CATEGORY,
  type GradeCategory,
  type Subject,
  type Assignment,
} from '../../types';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatSuggestion {
  cat: GradeCategory;
  label: string;
  icon: string;
  currentAvg: number;
  neededAvg: number;
  upcomingItems: Assignment[];
}

interface Suggestion {
  subject: Subject;
  currentGrade: number;
  targetGrade: number;
  gap: number;
  catSuggestions: CatSuggestion[];
  priority: 'urgent' | 'moderate' | 'minor';
}

// ─── Grade engine (mirrors GradesView logic) ──────────────────────────────────

function computeWeightedAvg(sub: Subject, graded: Assignment[]): number | null {
  if (graded.length === 0) return null;
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
  return den > 0 ? num / den
    : graded.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) / graded.length;
}

function buildSuggestions(subjects: Subject[], assignments: Assignment[]): Suggestion[] {
  const today = startOfToday();
  const result: Suggestion[] = [];

  for (const sub of subjects) {
    const graded = assignments.filter(
      a => a.subjectId === sub.subjectId && a.status === 'graded' &&
        a.scoreEarned !== undefined && a.totalScore && a.totalScore > 0
    );
    const upcoming = assignments.filter(
      a => a.subjectId === sub.subjectId &&
        (a.status === 'pending' || a.status === 'in-progress') &&
        isAfter(parseISO(a.dueDate), today)
    );

    if (graded.length === 0 || upcoming.length === 0) continue;

    const currentGrade = computeWeightedAvg(sub, graded);
    if (currentGrade === null) continue;

    const gap = sub.targetGrade - currentGrade;
    if (gap <= 0) continue;

    const weights = sub.gradeWeights || DEFAULT_GRADE_WEIGHTS;
    const catSuggestions: CatSuggestion[] = [];

    for (const cat of GRADE_CATEGORIES) {
      const catUpcoming = upcoming.filter(
        a => (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === cat.value
      );
      if (catUpcoming.length === 0) continue;

      const catGraded = graded.filter(
        a => (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === cat.value
      );
      const currentCatAvg = catGraded.length > 0
        ? (catGraded.reduce((s, a) => s + a.scoreEarned!, 0) /
           catGraded.reduce((s, a) => s + a.totalScore!, 0)) * 100
        : 0;

      const catWeight = weights[cat.value];
      if (!catWeight) continue;

      // Solve for neededCatAvg given: target = current + gap
      // gap ≈ (neededCatAvg - currentCatAvg) * (catWeight / 100)
      const neededCatAvg = Math.min(100, currentCatAvg + (gap * 100) / catWeight);

      if (neededCatAvg > currentCatAvg) {
        catSuggestions.push({
          cat: cat.value,
          label: cat.label,
          icon: cat.icon,
          currentAvg: currentCatAvg,
          neededAvg: neededCatAvg,
          upcomingItems: catUpcoming.sort(
            (a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
          ),
        });
      }
    }

    if (catSuggestions.length === 0) continue;

    result.push({
      subject: sub,
      currentGrade,
      targetGrade: sub.targetGrade,
      gap,
      catSuggestions,
      priority: gap > 10 ? 'urgent' : gap > 5 ? 'moderate' : 'minor',
    });
  }

  return result.sort((a, b) => b.gap - a.gap);
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  urgent:   { color: 'text-red-600 dark:text-red-400',   bg: 'bg-red-50 dark:bg-red-500/10',   border: 'border-red-200 dark:border-red-500/20',   badge: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',   icon: '🚨', label: 'Needs Attention' },
  moderate: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', badge: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400', icon: '⚠️', label: 'Worth Effort' },
  minor:    { color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-500/10',  border: 'border-green-200 dark:border-green-500/20',  badge: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',  icon: '✨', label: 'Small Push' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GradeImprovements() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();
  const [expanded, setExpanded] = useState<string | null>(null);

  const suggestions = useMemo(
    () => buildSuggestions(subjects, assignments),
    [subjects, assignments]
  );

  if (suggestions.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-4xl mb-3">🏆</p>
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">You're on track!</h3>
        <p className="text-sm text-gray-500">
          All subjects are at or above their target grade. Keep it up!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview banner */}
      <div className="card p-4 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20">
        <p className="font-bold text-amber-800 dark:text-amber-300 text-sm flex items-center gap-2">
          <TrendingUp size={16} />
          {suggestions.length} subject{suggestions.length > 1 ? 's' : ''} need{suggestions.length === 1 ? 's' : ''} a boost
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
          Based on current scores and upcoming assignments.
        </p>
      </div>

      {/* Suggestion cards */}
      {suggestions.map((sug) => {
        const p = PRIORITY_CONFIG[sug.priority];
        const isOpen = expanded === sug.subject.subjectId;

        return (
          <div
            key={sug.subject.subjectId}
            className={cn('card overflow-hidden border', p.border)}
          >
            {/* Accordion header */}
            <button
              onClick={() => setExpanded(isOpen ? null : sug.subject.subjectId)}
              className={cn('w-full p-4 flex items-center gap-3 text-left', p.bg)}
            >
              <span className="text-xl">{sug.subject.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {sug.subject.subjectName}
                  </span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', p.badge)}>
                    {p.icon} {p.label}
                  </span>
                </div>
                {/* Mini progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(sug.currentGrade, 100)}%`, backgroundColor: sug.subject.color }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {sug.currentGrade.toFixed(1)}%
                    <span className={cn('ml-1 font-bold', p.color)}>
                      → {sug.targetGrade}%
                    </span>
                  </span>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={cn('text-gray-400 transition-transform duration-200 shrink-0', isOpen && 'rotate-180')}
              />
            </button>

            {/* Accordion body */}
            {isOpen && (
              <div className="p-4 space-y-3 border-t border-gray-100 dark:border-white/5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  You need <span className={cn('font-bold', p.color)}>+{sug.gap.toFixed(1)}%</span> overall. Here's how:
                </p>

                {sug.catSuggestions.map((cs) => (
                  <div key={cs.cat} className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {cs.icon} {cs.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {cs.upcomingItems.length} upcoming
                      </span>
                    </div>

                    {/* Current → needed */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="text-center bg-white dark:bg-gray-800 rounded-lg py-2 px-1 border border-gray-100 dark:border-white/10">
                        <p className="text-xs text-gray-400 mb-0.5">Current</p>
                        <p className="text-base font-bold text-gray-700 dark:text-gray-300">{cs.currentAvg.toFixed(0)}%</p>
                      </div>
                      <div className="text-center text-gray-400 text-lg">→</div>
                      <div className={cn('text-center rounded-lg py-2 px-1 border', p.bg, p.border)}>
                        <p className={cn('text-xs mb-0.5', p.color)}>Needed</p>
                        <p className={cn('text-base font-bold', p.color)}>{cs.neededAvg.toFixed(0)}%</p>
                      </div>
                    </div>

                    {/* Plain-language tip */}
                    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-2.5">
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 leading-relaxed">
                        💬 Score at least <strong>{cs.neededAvg.toFixed(0)}%</strong> on your next{' '}
                        {cs.upcomingItems.length > 1
                          ? `${cs.upcomingItems.length} ${cs.label.toLowerCase()}`
                          : cs.label.toLowerCase()}.
                        {cs.neededAvg >= 95 && (
                          <span className="text-red-600 dark:text-red-400"> This is tough — prioritise this category!</span>
                        )}
                      </p>
                    </div>

                    {/* Upcoming items list */}
                    <div className="space-y-1">
                      {cs.upcomingItems.map(item => (
                        <div
                          key={item.assignmentId}
                          className="flex justify-between items-center text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10"
                        >
                          <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{item.title}</span>
                          <span className="text-gray-400 ml-2 shrink-0">
                            {format(parseISO(item.dueDate), 'MMM d')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
