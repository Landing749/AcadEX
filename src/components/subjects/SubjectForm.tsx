import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { SUBJECT_COLORS, SUBJECT_ICONS, Subject, GradeWeights, GRADE_CATEGORIES, DEFAULT_GRADE_WEIGHTS, DEPED_SHS_CORE_WEIGHTS, DEPED_JHS_WEIGHTS, DEPED_COLLEGE_WEIGHTS } from '../../types';
import { cn } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subject, 'subjectId' | 'userId' | 'createdAt'>) => Promise<any>;
  editingSubject?: Subject | null;
}

const WEIGHT_PRESETS = [
  { label: 'SHS Core', hint: 'WW 25 / PT 50 / QA 25', weights: DEPED_SHS_CORE_WEIGHTS },
  { label: 'JHS', hint: 'WW 30 / PT 50 / QA 20', weights: DEPED_JHS_WEIGHTS },
  { label: 'College', hint: 'WW 30 / PT 40 / QA 30', weights: DEPED_COLLEGE_WEIGHTS },
];

export function SubjectForm({ isOpen, onClose, onSubmit, editingSubject }: SubjectFormProps) {
  const [subjectName, setSubjectName] = useState(editingSubject?.subjectName || '');
  const [color, setColor] = useState(editingSubject?.color || SUBJECT_COLORS[0]);
  const [icon, setIcon] = useState(editingSubject?.icon || SUBJECT_ICONS[0]);
  const [semester, setSemester] = useState(editingSubject?.semester || '');
  const [teacherName, setTeacherName] = useState(editingSubject?.teacherName || '');
  const [targetGrade, setTargetGrade] = useState(editingSubject?.targetGrade || 85);
  const [weight, setWeight] = useState(editingSubject?.weight ?? 3);
  const [gradeWeights, setGradeWeights] = useState<GradeWeights>(
    editingSubject?.gradeWeights || DEFAULT_GRADE_WEIGHTS
  );
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
      setGradeWeights(editingSubject.gradeWeights || DEFAULT_GRADE_WEIGHTS);
    } else {
      setSubjectName(''); setColor(SUBJECT_COLORS[0]); setIcon(SUBJECT_ICONS[0]);
      setSemester(''); setTeacherName(''); setTargetGrade(85); setWeight(3);
      setGradeWeights(DEFAULT_GRADE_WEIGHTS);
    }
  }, [editingSubject, isOpen]);

  const totalWeight =
    gradeWeights.written_work + gradeWeights.performance_task + gradeWeights.quarterly_assessment;

  const handleWeightChange = (key: keyof GradeWeights, value: number) => {
    setGradeWeights(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    if (totalWeight !== 100) {
      toast.error(`Grade weights must total 100% (currently ${totalWeight}%)`);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        subjectName: subjectName.trim(), color, icon, semester, teacherName,
        targetGrade, weight, gradeWeights,
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

        {/* Grade Component Weights — DepEd 3-component system */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Grade Components</label>
            <span className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full',
              totalWeight === 100
                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            )}>
              {totalWeight}% {totalWeight === 100 ? '✓' : `(${100 - totalWeight > 0 ? '+' : ''}${100 - totalWeight}% needed)`}
            </span>
          </div>

          {/* Quick-fill presets */}
          <div className="flex gap-2 flex-wrap">
            {WEIGHT_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setGradeWeights(p.weights)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all font-medium"
                title={p.hint}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
            <p className="text-xs text-gray-500 mb-1">
              Set the percentage weight for each grade component as specified by your school. Must total 100%.
            </p>

            {GRADE_CATEGORIES.map(cat => {
              const val = gradeWeights[cat.value];
              return (
                <div key={cat.value}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{cat.label}</p>
                      <p className="text-xs text-gray-400">{cat.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0} max={100}
                        value={val}
                        onChange={e => handleWeightChange(cat.value, Number(e.target.value))}
                        className="input py-1 px-2 text-center text-sm w-14 font-bold"
                      />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                  </div>
                  {/* Weight bar */}
                  <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(val, 100)}%`,
                        backgroundColor: color,
                        opacity: 0.7 + (val / 100) * 0.3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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