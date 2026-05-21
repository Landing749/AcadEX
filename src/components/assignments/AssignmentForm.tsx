import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FileUpload } from '../uploads/FileUpload';
import { Assignment, AssignmentType, AssignmentStatus, Priority, ASSIGNMENT_TYPES, Subject, Attachment } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Assignment, 'assignmentId' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  subjects: Subject[];
  editingAssignment?: Assignment | null;
  defaultSubjectId?: string;
}

export function AssignmentForm({ isOpen, onClose, onSubmit, subjects, editingAssignment, defaultSubjectId }: AssignmentFormProps) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || '');
  const [type, setType] = useState<AssignmentType>('homework');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('23:59');
  const [status, setStatus] = useState<AssignmentStatus>('pending');
  const [scoreEarned, setScoreEarned] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'grade' | 'files'>('details');

  useEffect(() => {
    if (editingAssignment) {
      setTitle(editingAssignment.title);
      setSubjectId(editingAssignment.subjectId);
      setType(editingAssignment.type);
      setDueDate(editingAssignment.dueDate);
      setDueTime(editingAssignment.dueTime || '23:59');
      setStatus(editingAssignment.status);
      setScoreEarned(editingAssignment.scoreEarned?.toString() || '');
      setTotalScore(editingAssignment.totalScore?.toString() || '');
      setNotes(editingAssignment.notes || '');
      setPriority(editingAssignment.priority);
      setEstimatedTime(editingAssignment.estimatedTime || 30);
      setAttachments(editingAssignment.attachments || []);
    } else {
      setTitle(''); setSubjectId(defaultSubjectId || subjects[0]?.subjectId || '');
      setType('homework'); setDueDate(format(new Date(), 'yyyy-MM-dd'));
      setDueTime('23:59'); setStatus('pending'); setScoreEarned('');
      setTotalScore(''); setNotes(''); setPriority('medium');
      setEstimatedTime(30); setAttachments([]);
    }
    setActiveTab('details');
  }, [editingAssignment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (!subjectId) return toast.error('Please select a subject');

    const subject = subjects.find(s => s.subjectId === subjectId);
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        subjectId,
        subjectName: subject?.subjectName || '',
        subjectColor: subject?.color || '#6366f1',
        type,
        dueDate,
        dueTime,
        status,
        scoreEarned: scoreEarned ? parseFloat(scoreEarned) : undefined,
        totalScore: totalScore ? parseFloat(totalScore) : undefined,
        notes,
        priority,
        estimatedTime,
        attachments,
      });
      toast.success(editingAssignment ? 'Assignment updated!' : 'Assignment created!');
      onClose();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'grade', label: 'Grade' },
    { id: 'files', label: `Files${attachments.length > 0 ? ` (${attachments.length})` : ''}` },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingAssignment ? 'Edit Assignment' : 'New Assignment'} size="lg">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 Quiz, Science Project..."
                className="input"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Subject *</label>
                <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input" required>
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s.subjectId} value={s.subjectId}>{s.icon} {s.subjectName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select value={type} onChange={e => setType(e.target.value as AssignmentType)} className="input">
                  {ASSIGNMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Due Date *</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">Due Time</label>
                <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as AssignmentStatus)} className="input">
                  <option value="pending">📋 Pending</option>
                  <option value="in-progress">⏳ In Progress</option>
                  <option value="submitted">✅ Submitted</option>
                  <option value="graded">⭐ Graded</option>
                  <option value="overdue">🔴 Overdue</option>
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="input">
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Estimated Study Time</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={5} max={480} step={5} value={estimatedTime}
                  onChange={e => setEstimatedTime(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-indigo-600 w-20 text-right">
                  {estimatedTime >= 60 ? `${Math.floor(estimatedTime/60)}h ${estimatedTime%60}m` : `${estimatedTime}m`}
                </span>
              </div>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional notes, instructions..."
                rows={3}
                className="input resize-none"
              />
            </div>
          </div>
        )}

        {/* Grade Tab */}
        {activeTab === 'grade' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                Enter scores after the assignment is graded.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Score Earned</label>
                <input
                  type="number" value={scoreEarned}
                  onChange={e => setScoreEarned(e.target.value)}
                  placeholder="e.g. 45"
                  min={0} step={0.5}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Total Score</label>
                <input
                  type="number" value={totalScore}
                  onChange={e => setTotalScore(e.target.value)}
                  placeholder="e.g. 50"
                  min={0} step={0.5}
                  className="input"
                />
              </div>
            </div>
            {scoreEarned && totalScore && parseFloat(totalScore) > 0 && (
              <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {((parseFloat(scoreEarned) / parseFloat(totalScore)) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {scoreEarned} / {totalScore} points
                </p>
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div>
            <p className="text-sm text-gray-500 mb-3">Upload photos, screenshots, PDFs, or other files for this assignment.</p>
            <FileUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Saving...' : editingAssignment ? 'Update' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
