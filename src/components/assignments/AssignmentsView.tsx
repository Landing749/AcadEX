import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Clock, Calendar, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';
import { useAssignments, useSubjects } from '../../hooks/useFirebase';
import { AssignmentForm } from './AssignmentForm';
import { Assignment, AssignmentStatus, Priority, ASSIGNMENT_TYPES, STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { formatDueDate, colorWithOpacity, cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: AssignmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Graded' },
  { value: 'overdue', label: 'Overdue' },
];

export function AssignmentsView() {
  const { assignments, loading, addAssignment, updateAssignment, deleteAssignment } = useAssignments();
  const { subjects } = useSubjects();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');

  const filtered = useMemo(() => {
    return assignments
      .filter(a => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (subjectFilter !== 'all' && a.subjectId !== subjectFilter) return false;
        if (typeFilter !== 'all' && a.type !== typeFilter) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (sortBy === 'priority') {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        }
        return 0;
      });
  }, [assignments, statusFilter, subjectFilter, typeFilter, search, sortBy]);

  const handleDelete = async (assignment: Assignment) => {
    if (!confirm(`Delete "${assignment.title}"?`)) return;
    await deleteAssignment(assignment.assignmentId);
    toast.success('Assignment deleted');
    setMenuOpen(null);
  };

  const handleStatusChange = async (assignment: Assignment, newStatus: AssignmentStatus) => {
    await updateAssignment(assignment.assignmentId, { status: newStatus });
    toast.success('Status updated');
  };

  const subject = (id: string) => subjects.find(s => s.subjectId === id);

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="card h-24 skeleton" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-gray-500">{filtered.length} of {assignments.length} assignments</p>
        </div>
        <button onClick={() => { setEditingAssignment(null); setShowForm(true); }} className="btn-primary">
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="input pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                statusFilter === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="input flex-1 py-2 text-xs"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s.subjectId} value={s.subjectId}>{s.icon} {s.subjectName}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="input flex-1 py-2 text-xs"
          >
            <option value="all">All Types</option>
            {ASSIGNMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="input flex-1 py-2 text-xs"
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
            {assignments.length === 0 ? 'No assignments yet' : 'No matches found'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {assignments.length === 0 ? 'Add your first assignment to get started.' : 'Try adjusting your filters.'}
          </p>
          {assignments.length === 0 && (
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
              <Plus size={16} />Add Assignment
            </button>
          )}
        </div>
      )}

      {/* Assignment Cards */}
      <div className="space-y-3">
        {filtered.map(assignment => {
          const sub = subject(assignment.subjectId);
          const statusConf = STATUS_CONFIG[assignment.status];
          const priorityConf = PRIORITY_CONFIG[assignment.priority];
          const typeInfo = ASSIGNMENT_TYPES.find(t => t.value === assignment.type);
          const hasScore = assignment.scoreEarned !== undefined && assignment.totalScore;
          const scorePercent = hasScore ? (assignment.scoreEarned! / assignment.totalScore!) * 100 : null;

          return (
            <div
              key={assignment.assignmentId}
              className="card p-4 hover:shadow-md transition-all duration-200 group border-l-4"
              style={{ borderLeftColor: sub?.color || '#6366f1' }}
            >
              <div className="flex items-start gap-3">
                {/* Status Toggle */}
                <button
                  onClick={() => handleStatusChange(assignment,
                    assignment.status === 'pending' ? 'in-progress' :
                    assignment.status === 'in-progress' ? 'submitted' :
                    assignment.status === 'submitted' ? 'graded' : 'pending'
                  )}
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-all flex items-center justify-center',
                    assignment.status === 'graded' || assignment.status === 'submitted'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
                  )}
                >
                  {(assignment.status === 'graded' || assignment.status === 'submitted') && (
                    <CheckCircle size={12} className="text-white" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn(
                      'font-semibold text-gray-900 dark:text-white text-sm leading-tight',
                      (assignment.status === 'graded' || assignment.status === 'submitted') && 'line-through opacity-60'
                    )}>
                      {assignment.title}
                    </h3>
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setMenuOpen(menuOpen === assignment.assignmentId ? null : assignment.assignmentId)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                      {menuOpen === assignment.assignmentId && (
                        <div className="absolute right-0 top-7 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 py-1 w-36 animate-slide-up">
                          <button
                            onClick={() => { setEditingAssignment(assignment); setShowForm(true); setMenuOpen(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <Edit2 size={14} />Edit
                          </button>
                          <button
                            onClick={() => handleDelete(assignment)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {/* Subject */}
                    {sub && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: colorWithOpacity(sub.color, 0.12), color: sub.color }}
                      >
                        {sub.icon} {sub.subjectName}
                      </span>
                    )}

                    {/* Type */}
                    <span className="text-xs text-gray-400">
                      {typeInfo?.icon} {typeInfo?.label}
                    </span>

                    {/* Status */}
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', statusConf.bg, statusConf.color)}>
                      {statusConf.label}
                    </span>

                    {/* Priority */}
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', priorityConf.bg, priorityConf.color)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', priorityConf.dot)} />
                      {priorityConf.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    {/* Due Date */}
                    <span className={cn(
                      'flex items-center gap-1 text-xs',
                      assignment.status === 'overdue' ? 'text-red-500 font-semibold' : 'text-gray-400'
                    )}>
                      <Calendar size={12} />
                      {formatDueDate(assignment.dueDate, assignment.dueTime)}
                    </span>

                    {/* Est. Time */}
                    {assignment.estimatedTime > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {assignment.estimatedTime >= 60
                          ? `${Math.floor(assignment.estimatedTime / 60)}h ${assignment.estimatedTime % 60}m`
                          : `${assignment.estimatedTime}m`}
                      </span>
                    )}

                    {/* Attachments */}
                    {assignment.attachments?.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Paperclip size={12} />
                        {assignment.attachments.length}
                      </span>
                    )}

                    {/* Score */}
                    {hasScore && scorePercent !== null && (
                      <span className={cn(
                        'ml-auto text-xs font-bold',
                        scorePercent >= 90 ? 'text-green-600 dark:text-green-400' :
                        scorePercent >= 75 ? 'text-blue-600 dark:text-blue-400' :
                        scorePercent >= 60 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      )}>
                        {assignment.scoreEarned}/{assignment.totalScore} ({scorePercent.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AssignmentForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingAssignment(null); }}
        onSubmit={async (data) => {
          if (editingAssignment) {
            await updateAssignment(editingAssignment.assignmentId, data);
          } else {
            await addAssignment(data);
          }
          setEditingAssignment(null);
        }}
        subjects={subjects}
        editingAssignment={editingAssignment}
      />

      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
