import React, { useMemo, useState } from 'react';
import { Award, TrendingUp, BarChart2, Star, Scale, Share2, Lightbulb } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { percentageToLetterGrade, percentageToGPA, cn } from '../../utils/helpers';
import { GRADE_CATEGORIES, GradeCategory, DEFAULT_GRADE_WEIGHTS, TYPE_TO_GRADE_CATEGORY } from '../../types';
import { ReportCard } from './ReportCard';
import { GradeImprovements } from './GradeImprovements';

export function GradesView() {
  const { assignments, loading } = useAssignments();
  const { subjects } = useSubjects();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<GradeCategory | 'all'>('all');

  const graded = useMemo(() =>
    assignments.filter(a =>
      a.status === 'graded' &&
      a.scoreEarned !== undefined &&
      a.totalScore !== undefined &&
      a.totalScore > 0 &&
      (subjectFilter === 'all' || a.subjectId === subjectFilter) &&
      (categoryFilter === 'all' || (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === categoryFilter)
    ).sort((a, b) => b.updatedAt - a.updatedAt),
  [assignments, subjectFilter, categoryFilter]);

  const stats = useMemo(() => {
    if (graded.length === 0) return null;

    // Overall simple average (for display)
    const totalEarned = graded.reduce((s, a) => s + a.scoreEarned!, 0);
    const totalPossible = graded.reduce((s, a) => s + a.totalScore!, 0);
    const avg = (totalEarned / totalPossible) * 100;
    const highest = Math.max(...graded.map(a => (a.scoreEarned! / a.totalScore!) * 100));
    const lowest = Math.min(...graded.map(a => (a.scoreEarned! / a.totalScore!) * 100));

    // Per-subject stats using the 3-component weighted grade formula
    const bySubject = subjects.map(sub => {
      const subGraded = assignments.filter(a =>
        a.subjectId === sub.subjectId &&
        a.status === 'graded' &&
        a.scoreEarned !== undefined &&
        a.totalScore !== undefined &&
        a.totalScore > 0
      );
      if (subGraded.length === 0) return null;

      const weights = sub.gradeWeights || DEFAULT_GRADE_WEIGHTS;

      // Average per category
      const categoryAvgs: Partial<Record<GradeCategory, { avg: number; count: number }>> = {};
      for (const cat of GRADE_CATEGORIES) {
        const catItems = subGraded.filter(a =>
          (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === cat.value
        );
        if (catItems.length > 0) {
          const earned = catItems.reduce((s, a) => s + a.scoreEarned!, 0);
          const possible = catItems.reduce((s, a) => s + a.totalScore!, 0);
          categoryAvgs[cat.value] = { avg: (earned / possible) * 100, count: catItems.length };
        }
      }

      // Weighted grade: only apply weights for categories that have data
      // Missing categories are treated as 0 in DepEd system, but we'll
      // show the raw weighted total so the student knows what's missing.
      let weightedNumerator = 0;
      let weightedDenominator = 0;
      for (const cat of GRADE_CATEGORIES) {
        const catData = categoryAvgs[cat.value];
        const catWeight = weights[cat.value];
        if (catData && catWeight > 0) {
          weightedNumerator += catData.avg * catWeight;
          weightedDenominator += catWeight;
        }
      }
      const weightedAvg = weightedDenominator > 0
        ? weightedNumerator / weightedDenominator
        : (subGraded.reduce((s, a) => s + (a.scoreEarned! / a.totalScore!) * 100, 0) / subGraded.length);

      return {
        subject: sub,
        avg: weightedAvg,
        rawAvg: (subGraded.reduce((s, a) => s + a.scoreEarned!, 0) / subGraded.reduce((s, a) => s + a.totalScore!, 0)) * 100,
        count: subGraded.length,
        weight: sub.weight ?? 3,
        weights,
        categoryAvgs,
      };
    }).filter(Boolean).sort((a, b) => b!.avg - a!.avg);

    // Weighted GWA across subjects
    const totalWeightedScore = bySubject.reduce((s, item) => s + item!.avg * item!.weight, 0);
    const totalWeights = bySubject.reduce((s, item) => s + item!.weight, 0);
    const weightedGWA = totalWeights > 0 ? totalWeightedScore / totalWeights : avg;

    // Per-category performance (for filters view)
    const byCategory = GRADE_CATEGORIES.map(cat => {
      const catGraded = graded.filter(a =>
        (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]) === cat.value
      );
      if (catGraded.length === 0) return null;
      const earned = catGraded.reduce((s, a) => s + a.scoreEarned!, 0);
      const possible = catGraded.reduce((s, a) => s + a.totalScore!, 0);
      return {
        cat,
        avg: (earned / possible) * 100,
        count: catGraded.length,
      };
    }).filter(Boolean);

    return { avg, highest, lowest, gpa: percentageToGPA(avg), bySubject, byCategory, weightedGWA, totalWeights };
  }, [graded, subjects, assignments]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grades</h1>
        <p className="text-sm text-gray-500">{graded.length} graded assignment{graded.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="input flex-1 py-2 text-xs">
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.subjectId} value={s.subjectId}>{s.icon} {s.subjectName}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as any)} className="input flex-1 py-2 text-xs">
          <option value="all">All Components</option>
          {GRADE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      {/* No data state */}
      {graded.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Award size={36} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No grades yet</h3>
          <p className="text-gray-500 text-sm">Mark assignments as "Graded" and add scores to see your grade analytics.</p>
        </div>
      )}

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* GPA Card */}
            <div className="card p-5 bg-gradient-to-br from-indigo-600 to-violet-600 border-0 col-span-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-indigo-100 text-xs mb-1">GPA</p>
                  <p className="text-4xl font-bold text-white">{stats.gpa.toFixed(2)}</p>
                  <p className="text-indigo-200 text-xs mt-1">{percentageToLetterGrade(stats.avg)}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-xs mb-1">Average</p>
                  <p className="text-3xl font-bold text-white">{stats.avg.toFixed(1)}%</p>
                  <p className="text-indigo-200 text-xs mt-1">{graded.length} graded</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-xs mb-1">Range</p>
                  <p className="text-lg font-bold text-white">{stats.highest.toFixed(0)}%</p>
                  <p className="text-indigo-200 text-xs">↓ {stats.lowest.toFixed(0)}%</p>
                </div>
              </div>
            </div>

            {/* Weighted GWA Card */}
            {stats.bySubject.length > 1 && stats.totalWeights > 0 && (
              <div className="card p-4 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Scale size={16} className="text-indigo-500" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weighted GWA</p>
                  <span className="text-xs text-gray-400 ml-auto">{stats.totalWeights} total units</span>
                </div>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.weightedGWA.toFixed(2)}%</p>
                  <p className="text-base font-semibold mb-0.5" style={{
                    color: stats.weightedGWA >= 90 ? '#10b981' : stats.weightedGWA >= 75 ? '#6366f1' : stats.weightedGWA >= 60 ? '#f59e0b' : '#f43f5e'
                  }}>
                    {percentageToLetterGrade(stats.weightedGWA)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Computed using each subject's 3-component grade weights × unit credits.</p>
                {/* Mini unit bars */}
                <div className="flex gap-1 mt-3">
                  {stats.bySubject.map(item => item && (
                    <div key={item.subject.subjectId}
                      title={`${item.subject.subjectName}: ${item.avg.toFixed(1)}% × ${item.weight}u`}
                      style={{ flex: item.weight }}>
                      <div className="h-2 rounded-full" style={{ backgroundColor: item.subject.color }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grade Component Overview */}
          {stats.byCategory.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-violet-500" />
                By Grade Component
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {GRADE_CATEGORIES.map(cat => {
                  const item = stats.byCategory.find(b => b?.cat.value === cat.value);
                  return (
                    <div
                      key={cat.value}
                      className={cn(
                        'p-3 rounded-xl text-center',
                        !item ? 'bg-gray-50 dark:bg-white/5 opacity-50' :
                        item.avg >= 90 ? 'bg-green-50 dark:bg-green-500/10' :
                        item.avg >= 75 ? 'bg-indigo-50 dark:bg-indigo-500/10' :
                        item.avg >= 60 ? 'bg-amber-50 dark:bg-amber-500/10' :
                        'bg-red-50 dark:bg-red-500/10'
                      )}
                    >
                      <p className="text-2xl mb-1">{cat.icon}</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{cat.label}</p>
                      {item ? (
                        <>
                          <p className={cn(
                            'text-lg font-bold mt-1',
                            item.avg >= 90 ? 'text-green-600 dark:text-green-400' :
                            item.avg >= 75 ? 'text-indigo-600 dark:text-indigo-400' :
                            item.avg >= 60 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          )}>
                            {item.avg.toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-400">{item.count} graded</p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2">No data</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By Subject — with 3-component breakdown */}
          {stats.bySubject.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart2 size={18} className="text-indigo-500" />
                Performance by Subject
              </h2>
              <div className="space-y-5">
                {stats.bySubject.map((item) => {
                  if (!item) return null;
                  const letter = percentageToLetterGrade(item.avg);
                  const barColor = item.avg >= 90 ? '#10b981' : item.avg >= 75 ? '#6366f1' : item.avg >= 60 ? '#f59e0b' : '#f43f5e';
                  return (
                    <div key={item.subject.subjectId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.subject.icon}</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.subject.subjectName}</span>
                          <span className="text-xs text-gray-400">({item.count})</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 font-medium">
                            {item.weight}u
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full',
                            item.avg >= 90 ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' :
                            item.avg >= 75 ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' :
                            item.avg >= 60 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                            'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                          )}>
                            {letter}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white w-14 text-right">{item.avg.toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* Main progress bar */}
                      <div className="relative h-2.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(item.avg, 100)}%`, backgroundColor: barColor }}
                        />
                        <div
                          className="absolute top-0 h-full w-0.5 bg-gray-400 dark:bg-white/40"
                          style={{ left: `${item.subject.targetGrade}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-400 mt-0.5 mb-2">
                        <span>Target: {item.subject.targetGrade}%</span>
                        <span className={item.avg >= item.subject.targetGrade ? 'text-green-500' : 'text-red-400'}>
                          {item.avg >= item.subject.targetGrade ? '✓ On track' : `${(item.subject.targetGrade - item.avg).toFixed(1)}% to go`}
                        </span>
                      </div>

                      {/* 3-component breakdown mini-pills */}
                      <div className="flex gap-2 flex-wrap">
                        {GRADE_CATEGORIES.map(cat => {
                          const catData = item.categoryAvgs[cat.value];
                          const catWeight = item.weights[cat.value];
                          return (
                            <div key={cat.value} className={cn(
                              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                              catData
                                ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-400'
                            )}>
                              <span>{cat.icon}</span>
                              <span>{cat.label.split(' ')[0]}</span>
                              {catData ? (
                                <span className="font-bold">{catData.avg.toFixed(0)}%</span>
                              ) : (
                                <span className="italic">no data</span>
                              )}
                              <span className="text-gray-400">×{catWeight}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Grade Improvement Suggestions */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              Grade Improvement Suggestions
            </h2>
            <GradeImprovements />
          </div>

          {/* Shareable Report Card */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Share2 size={18} className="text-indigo-500" />
              Report Card
            </h2>
            <ReportCard />
          </div>
        </>
      )}

      {/* Grade List */}
      {graded.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            All Grades
          </h2>
          <div className="space-y-2">
            {graded.map(a => {
              const sub = subjects.find(s => s.subjectId === a.subjectId);
              const pct = (a.scoreEarned! / a.totalScore!) * 100;
              const letter = percentageToLetterGrade(pct);
              const cat = GRADE_CATEGORIES.find(c => c.value === (a.gradeCategory ?? TYPE_TO_GRADE_CATEGORY[a.type]));
              return (
                <div key={a.assignmentId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: sub?.color || '#6366f1' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-xs text-gray-500">{sub?.icon} {sub?.subjectName} · {cat?.icon} {cat?.label}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      'text-sm font-bold',
                      pct >= 90 ? 'text-green-600 dark:text-green-400' :
                      pct >= 75 ? 'text-indigo-600 dark:text-indigo-400' :
                      pct >= 60 ? 'text-amber-600 dark:text-amber-400' :
                      'text-red-600 dark:text-red-400'
                    )}>
                      {letter} · {pct.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400">{a.scoreEarned}/{a.totalScore}</p>
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