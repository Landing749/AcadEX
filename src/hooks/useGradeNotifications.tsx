import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAssignments, useSubjects } from './useFirebase';
import { DEFAULT_GRADE_WEIGHTS, GRADE_CATEGORIES, TYPE_TO_GRADE_CATEGORY } from '../types';

/**
 * useGradeNotifications
 *
 * Watches for changes in the assignments list. When a newly-graded item shifts
 * a subject's weighted average across its target grade threshold, it fires:
 *   • A toast in-app (always)
 *   • A browser Notification (if permission is granted)
 *
 * Drop this hook once inside App or wherever useAssignments is already mounted.
 * It does NOT make any extra Firebase reads — it reuses the same live feed.
 */
export function useGradeNotifications() {
  const { assignments } = useAssignments();
  const { subjects } = useSubjects();

  // Track the last-known weighted average per subject so we can detect a crossing
  const prevAvgsRef = useRef<Map<string, number>>(new Map());
  // Track which assignments we've already seen as graded (to detect new gradings)
  const seenGradedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (assignments.length === 0 || subjects.length === 0) return;

    // Find assignments that are newly graded this render
    const newlyGraded = assignments.filter(
      a =>
        a.status === 'graded' &&
        a.scoreEarned !== undefined &&
        a.totalScore &&
        a.totalScore > 0 &&
        !seenGradedRef.current.has(a.assignmentId)
    );

    // Mark all current graded assignments as seen for future renders
    assignments.forEach(a => {
      if (a.status === 'graded') seenGradedRef.current.add(a.assignmentId);
    });

    if (newlyGraded.length === 0) return;

    // For each subject that has a newly-graded item, recompute the average
    const affectedSubjectIds = [...new Set(newlyGraded.map(a => a.subjectId))];

    for (const subjectId of affectedSubjectIds) {
      const sub = subjects.find(s => s.subjectId === subjectId);
      if (!sub) continue;

      const graded = assignments.filter(
        a =>
          a.subjectId === subjectId &&
          a.status === 'graded' &&
          a.scoreEarned !== undefined &&
          a.totalScore &&
          a.totalScore > 0
      );
      if (graded.length === 0) continue;

      // Weighted average using the 3-component formula
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
      const newAvg = den > 0 ? num / den
        : graded.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) / graded.length;

      const prevAvg = prevAvgsRef.current.get(subjectId);
      const target = sub.targetGrade;

      if (prevAvg !== undefined) {
        const wasBelow = prevAvg < target;
        const isAbove = newAvg >= target;
        const wasAbove = prevAvg >= target;
        const isBelow = newAvg < target;

        if (wasBelow && isAbove) {
          // 🎉 Crossed above target
          fire(
            `${sub.icon} ${sub.subjectName}: Target reached!`,
            `Your average is now ${newAvg.toFixed(1)}% — above your ${target}% goal.`,
            'success'
          );
        } else if (wasAbove && isBelow) {
          // ⚠️ Dropped below target
          fire(
            `${sub.icon} ${sub.subjectName}: Below target`,
            `Your average dropped to ${newAvg.toFixed(1)}%. Target is ${target}%.`,
            'warning'
          );
        } else {
          // No threshold crossing — just a plain grade update toast
          const item = newlyGraded.find(a => a.subjectId === subjectId);
          if (item) {
            const pct = ((item.scoreEarned! / item.totalScore!) * 100).toFixed(0);
            fire(
              `${sub.icon} ${sub.subjectName}: Grade added`,
              `"${item.title}" — ${pct}%. Running average: ${newAvg.toFixed(1)}%.`,
              'info'
            );
          }
        }
      }

      prevAvgsRef.current.set(subjectId, newAvg);
    }
  }, [assignments, subjects]);
}

// ─── Notification dispatch ────────────────────────────────────────────────────

type Kind = 'success' | 'warning' | 'info';

const ICON: Record<Kind, string> = {
  success: '🎉',
  warning: '⚠️',
  info: '📊',
};

function fire(title: string, body: string, kind: Kind) {
  // In-app toast (always shown)
  toast(
    <div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{body}</p>
    </div>,
    {
      icon: ICON[kind],
      duration: 6000,
      style: kind === 'success'
        ? { borderLeft: '3px solid #10b981' }
        : kind === 'warning'
        ? { borderLeft: '3px solid #f59e0b' }
        : { borderLeft: '3px solid #6366f1' },
    }
  );

  // Browser / OS notification (only if permission already granted — don't prompt here)
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: `grade-${Date.now()}`,
      });
    } catch {
      // Silently ignore — notifications are non-critical
    }
  }
}
