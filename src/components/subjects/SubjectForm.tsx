import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { SUBJECT_COLORS, SUBJECT_ICONS, ASSIGNMENT_TYPES, Subject, AssignmentType } from '../../types';
import { cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subject, 'subjectId' | 'userId' | 'createdAt'>) => Promise<any>;
  editingSubject?: Subject | null;
}

const DEFAULT_TYPE_WEIGHTS: Partial<Record<AssignmentType, number>> = {
  exam: 40,
  quiz: 20,
  homework: 15,
  project: 15,
  activity: 10,
};

export function SubjectForm({ isOpen, onClose, onSubmit, editingSubject }: SubjectFormProps) {
  const [subjectName, setSubjectName] = useState(editingSubject?.subjectName || '');
  const [color, setColor] = useState(editingSubject?.color || SUBJECT_COLORS[0]);
  const [icon, setIcon] = useState(editingSubject?.icon || SUBJECT_ICONS[0]);
  const [semester, setSemester] = useState(editingSubject?.semester || '');
  const [teacherName, setTeacherName] = useState(editingSubject?.teacherName || '');
  const [targetGrade, setTargetGrade] = useState(editingSubject?.targetGrade || 85);
  const [weight, setWeight] = useState(editingSubject?.weight ?? 3);
  const [typeWeights, setTypeWeights] = useState<Partial<Record<AssignmentType, number>>>(
    editingSubject?.typeWeights || DEFAULT_TYPE_WEIGHTS
  );
  const [useTypeWeights, setUseTypeWeights] = useState(!!(editingSubject?.typeWeights));
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (editingSubject) {
      setSubjectName(editingSubject.subjectName);
      setColor(editingSubject.color);
      setIcon(editingSubject.icon);
      setSemester(editingSubject.semester);
      setTeacherName(editingSubject.teacherName);
      setTargetGrade(editingSubject.targetGrade);
      setWeight(editingSubject.weight ?? 3);
      setTypeWeights(editingSubject.typeWeights || DEFAULT_TYPE_WEIGHTS);
      setUseTypeWeights(!!(editingSubject.typeWeights));
    } else {
      setSubjectName(''); setColor(SUBJECT_COLORS[0]); setIcon(SUBJECT_ICONS[0]);
      setSemester(''); setTeacherName(''); setTargetGrade(85); setWeight(3);
      setTypeWeights(DEFAULT_TYPE_WEIGHTS); setUseTypeWeights(false);
    }
  }, [editingSubject, isOpen]);

  const totalTypeWeight = Object.values(typeWeights).reduce((s, v) => s + (v || 0), 0);

  const handleTypeWeightChange = (type: AssignmentType, value: number) => {
    setTypeWeights(prev => ({ ...prev, [type]: Math.max(0, Math.min(100, value)) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    if (useTypeWeights && totalTypeWeight !== 100) {
      toast.error(`Weights must total 100% (currently ${totalTypeWeight}%)`);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        subjectName: subjectName.trim(), color, icon, semester, teacherName, targetGrade, weight,
        typeWeights: useTypeWeights ? typeWeights : undefined,
      });
      toast.success(editingSubject ? 'Subject updated!' : 'Subject created!');
      onClose();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingSubject ? 'Edit Subject' : 'Add Subject'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preview */}
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: color + '20' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{subjectName || 'Subject Name'}</p>
            <p className="text-xs text-gray-500">{weight} unit{weight !== 1 ? 's' : ''}{semester ? ` · ${semester}` : ''}</p>
          </div>
        </div>

        <div>
          <label className="label">Subject Name *</label>
          <input
            type="text"
            value={subjectName}
            onChange={e => setSubjectName(e.target.value)}
            placeholder="e.g. Mathematics, Biology..."
            className="input"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Semester / Term</label>
            <input type="text" value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. Sem 1 2024" className="input" />
          </div>
          <div>
            <label className="label">Teacher Name</label>
            <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Mrs. Santos" className="input" />
          </div>
        </div>

        {/* Weight / Units */}
        <div>
          <label className="label">Subject Weight (Units / Credit Hours)</label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map(w => (
              <button
                key={w}
                type="button"
                onClick={() => setWeight(w)}
                className={cn(
                  'w-10 h-10 rounded-xl text-sm font-bold transition-all',
                  weight === w
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                )}
                style={weight === w ? { backgroundColor: color } : {}}
              >
                {w}
              </button>
            ))}
            <input
              type="number" min={1} max={12} value={weight}
              onChange={e => setWeight(Math.max(1, Math.min(12, Number(e.target.value))))}
              className="input w-16 text-center py-2"
              placeholder="?"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Used to compute weighted GWA. Most PH college subjects = 3 units.</p>
        </div>

        {/* Assignment Type Weights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Grade Composition</label>
            <button
              type="button"
              onClick={() => setUseTypeWeights(v => !v)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
                useTypeWeights
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-500'
              )}
            >
              {useTypeWeights ? 'Custom ✓' : 'Set Weights'}
            </button>
          </div>

          {useTypeWeights && (
            <div className="space-y-2 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-500 mb-3">
                Set how much each type contributes to the final grade. Must total 100%.
              </p>
              {ASSIGNMENT_TYPES.map(t => (
                <div key={t.value} className="flex items-center gap-3">
                  <span className="text-base w-6">{t.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-24">{t.label}</span>
                  <input
                    type="range"
                    min={0} max={100} step={5}
                    value={typeWeights[t.value] ?? 0}
                    onChange={e => handleTypeWeightChange(t.value, Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <div className="flex items-center gap-1 w-16">
                    <input
                      type="number"
                      min={0} max={100}
                      value={typeWeights[t.value] ?? 0}
                      onChange={e => handleTypeWeightChange(t.value, Number(e.target.value))}
                      className="input py-1 px-2 text-center text-xs w-12"
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </div>
              ))}
              <div className={cn(
                'flex items-center justify-between mt-3 pt-3 border-t',
                totalTypeWeight === 100
                  ? 'border-green-200 dark:border-green-500/20'
                  : 'border-red-200 dark:border-red-500/20'
              )}>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total</span>
                <span className={cn(
                  'text-sm font-bold',
                  totalTypeWeight === 100 ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                )}>
                  {totalTypeWeight}% {totalTypeWeight === 100 ? '✓' : `(need ${100 - totalTypeWeight > 0 ? '+' : ''}${100 - totalTypeWeight}%)`}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="label">Target Grade (%)</label>
          <div className="flex items-center gap-3">
            <input type="range" min={60} max={100} value={targetGrade}
              onChange={e => setTargetGrade(Number(e.target.value))} className="flex-1" />
            <span className="text-sm font-bold text-indigo-600 w-12 text-center">{targetGrade}%</span>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={cn('w-8 h-8 rounded-xl transition-all', color === c && 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600')}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="label">Icon</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_ICONS.map(ic => (
              <button key={ic} type="button" onClick={() => setIcon(ic)}
                className={cn(
                  'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all',
                  'hover:bg-gray-100 dark:hover:bg-white/10',
                  icon === ic && 'bg-indigo-50 dark:bg-indigo-500/20 ring-2 ring-indigo-500'
                )}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading || !subjectName.trim()} className="btn-primary flex-1 justify-center">
            {loading ? 'Saving...' : editingSubject ? 'Update' : 'Add Subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}