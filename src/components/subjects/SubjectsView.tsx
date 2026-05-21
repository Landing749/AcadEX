import React, { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Target, BookOpen, GraduationCap } from 'lucide-react';
import { useSubjects } from '../../hooks/useFirebase';
import { useAssignments } from '../../hooks/useFirebase';
import { SubjectForm } from './SubjectForm';
import { Subject } from '../../types';
import { colorWithOpacity, percentageToLetterGrade } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function SubjectsView() {
  const { subjects, loading, addSubject, updateSubject, deleteSubject } = useSubjects();
  const { assignments } = useAssignments();
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const getSubjectStats = (subjectId: string) => {
    const subjectAssignments = assignments.filter(a => a.subjectId === subjectId);
    const graded = subjectAssignments.filter(a => a.status === 'graded' && a.scoreEarned !== undefined && a.totalScore);
    const total = subjectAssignments.length;
    const pending = subjectAssignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length;
    const overdue = subjectAssignments.filter(a => a.status === 'overdue').length;

    let average = 0;
    if (graded.length > 0) {
      const totalEarned = graded.reduce((s, a) => s + (a.scoreEarned || 0), 0);
      const totalPossible = graded.reduce((s, a) => s + (a.totalScore || 0), 0);
      average = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    }

    return { total, pending, overdue, graded: graded.length, average };
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Delete "${subject.subjectName}"? This won't delete your assignments.`)) return;
    await deleteSubject(subject.subjectId);
    toast.success('Subject deleted');
    setMenuOpen(null);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowForm(true);
    setMenuOpen(null);
  };

  const handleSubmit = async (data: any) => {
    if (editingSubject) {
      await updateSubject(editingSubject.subjectId, data);
    } else {
      await addSubject(data);
    }
    setEditingSubject(null);
  };

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-5 h-48 skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="text-sm text-gray-500">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} enrolled</p>
        </div>
        <button
          onClick={() => { setEditingSubject(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={36} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No subjects yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your classes to start tracking assignments and grades.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            <Plus size={16} />
            Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const stats = getSubjectStats(subject.subjectId);
            return (
              <div
                key={subject.subjectId}
                className="card p-5 hover:shadow-md transition-all duration-200 group relative"
              >
                {/* Color bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: subject.color }} />

                {/* Header */}
                <div className="flex items-start justify-between mt-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: colorWithOpacity(subject.color, 0.15) }}
                    >
                      {subject.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{subject.subjectName}</h3>
                      {subject.teacherName && (
                        <p className="text-xs text-gray-500 truncate">{subject.teacherName}</p>
                      )}
                      {subject.semester && (
                        <p className="text-xs text-gray-400 truncate">{subject.semester}</p>
                      )}
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === subject.subjectId ? null : subject.subjectId)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                    {menuOpen === subject.subjectId && (
                      <div className="absolute right-0 top-8 z-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 py-1 w-36 animate-slide-up">
                        <button onClick={() => handleEdit(subject)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                          <Edit2 size={14} />Edit
                        </button>
                        <button onClick={() => handleDelete(subject)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                          <Trash2 size={14} />Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-lg font-bold text-red-500">{stats.overdue}</p>
                    <p className="text-xs text-gray-500">Overdue</p>
                  </div>
                </div>

                {/* Grade */}
                {stats.graded > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Current avg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(stats.average, 100)}%`, backgroundColor: subject.color }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: subject.color }}>
                        {stats.average.toFixed(0)}% ({percentageToLetterGrade(stats.average)})
                      </span>
                    </div>
                  </div>
                )}

                {/* Target */}
                <div className="mt-2 flex items-center gap-1.5">
                  <Target size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Target: {subject.targetGrade}%</span>
                </div>
              </div>
            );
          })}

          {/* Add More Card */}
          <button
            onClick={() => { setEditingSubject(null); setShowForm(true); }}
            className="card p-5 border-dashed hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-sm font-semibold">Add Subject</span>
          </button>
        </div>
      )}

      <SubjectForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingSubject(null); }}
        onSubmit={handleSubmit}
        editingSubject={editingSubject}
      />

      {/* Close menu on outside click */}
      {menuOpen && <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
