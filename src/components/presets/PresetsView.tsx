import React, { useState, useMemo } from 'react';
import {
  Bookmark, Plus, Share2, Download, Trash2, Copy, Check,
  ChevronDown, ChevronRight, BookOpen, Sparkles, Upload,
} from 'lucide-react';
import { usePresets } from '../../hooks/useFirebase';
import { useSubjects } from '../../hooks/useFirebase';
import { GradePreset, SubjectPresetEntry, SUBJECT_COLORS, SUBJECT_ICONS, PRESET_TEMPLATES, SCHOOL_TYPES } from '../../types';
import { Modal } from '../ui/Modal';
import { cn, generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ---- Encode / Decode share codes ----
function encodePreset(preset: GradePreset): string {
  const payload = {
    n: preset.name,
    d: preset.description,
    t: preset.schoolType,
    s: preset.subjects.map(s => ({
      n: s.subjectName,
      i: s.icon,
      c: s.color,
      w: s.weight,
      g: s.targetGrade,
    })),
  };
  return btoa(JSON.stringify(payload));
}

function decodePreset(code: string): Omit<GradePreset, 'presetId' | 'userId' | 'createdAt' | 'shareCode'> | null {
  try {
    const payload = JSON.parse(atob(code.trim()));
    return {
      name: payload.n,
      description: payload.d || '',
      schoolType: payload.t || 'custom',
      subjects: (payload.s || []).map((s: any) => ({
        subjectName: s.n,
        icon: s.i || '📚',
        color: s.c || SUBJECT_COLORS[0],
        weight: s.w || 3,
        targetGrade: s.g || 85,
      })),
    };
  } catch {
    return null;
  }
}

// ---- Save Preset Modal ----
function SavePresetModal({
  isOpen,
  onClose,
  onSave,
  subjects,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  subjects: SubjectPresetEntry[];
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schoolType, setSchoolType] = useState('college');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), schoolType, subjects });
      toast.success('Preset saved!');
      onClose();
    } catch {
      toast.error('Failed to save preset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save as Preset" size="md">
      <div className="space-y-4">
        <div>
          <label className="label">Preset Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="e.g. My STEM Subjects Sem 1" />
        </div>
        <div>
          <label className="label">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="Brief description..." />
        </div>
        <div>
          <label className="label">School Type</label>
          <select value={schoolType} onChange={e => setSchoolType(e.target.value)} className="input">
            {SCHOOL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
          <p className="text-xs font-semibold text-gray-500 mb-2">Subjects to save ({subjects.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: s.color + '20', color: s.color }}>
                {s.icon} {s.subjectName} ({s.weight}u)
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={loading || !name.trim()} className="btn-primary flex-1 justify-center">
            {loading ? 'Saving...' : 'Save Preset'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---- Import Modal ----
function ImportModal({
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (preset: Omit<GradePreset, 'presetId' | 'userId' | 'createdAt' | 'shareCode'>) => void;
}) {
  const [code, setCode] = useState('');
  const [decoded, setDecoded] = useState<ReturnType<typeof decodePreset>>(null);
  const [error, setError] = useState('');

  const handleDecode = () => {
    const result = decodePreset(code);
    if (result) { setDecoded(result); setError(''); }
    else setError('Invalid share code. Please check and try again.');
  };

  const handleImport = () => {
    if (!decoded) return;
    onImport(decoded);
    onClose();
    setCode(''); setDecoded(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Preset via Code" size="md">
      <div className="space-y-4">
        <div>
          <label className="label">Share Code</label>
          <textarea
            value={code}
            onChange={e => { setCode(e.target.value); setDecoded(null); setError(''); }}
            className="input resize-none font-mono text-xs"
            rows={3}
            placeholder="Paste share code here..."
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!decoded && (
          <button onClick={handleDecode} disabled={!code.trim()} className="btn-primary w-full justify-center">
            Decode Code
          </button>
        )}
        {decoded && (
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-500/30">
              <p className="font-bold text-indigo-800 dark:text-indigo-200">{decoded.name}</p>
              {decoded.description && <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-0.5">{decoded.description}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {decoded.subjects.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: s.color + '20', color: s.color }}>
                    {s.icon} {s.subjectName} ({s.weight}u)
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setDecoded(null); setCode(''); }} className="btn-secondary flex-1 justify-center">Try Again</button>
              <button onClick={handleImport} className="btn-primary flex-1 justify-center">
                <Download size={14} /> Import Preset
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---- Preset Card ----
function PresetCard({
  preset,
  onApply,
  onDelete,
  onShare,
}: {
  preset: GradePreset;
  onApply: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const schoolLabel = SCHOOL_TYPES.find(t => t.value === preset.schoolType)?.label || preset.schoolType;
  const totalUnits = preset.subjects.reduce((s, sub) => s + sub.weight, 0);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{preset.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
              {schoolLabel.split(' ')[0]}
            </span>
          </div>
          {preset.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{preset.description}</p>}
          <p className="text-xs text-gray-400 mt-1">
            {preset.subjects.length} subjects · {totalUnits} total units
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={onShare} title="Copy share code" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-indigo-500 transition-colors">
            <Share2 size={15} />
          </button>
          <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Subject chips */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        {expanded ? 'Hide' : 'Show'} subjects
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {preset.subjects.map((s, i) => (
            <span key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: s.color + '20', color: s.color }}>
              {s.icon} {s.subjectName}
              <span className="opacity-60 text-xs">{s.weight}u</span>
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onApply}
        className="mt-3 w-full btn-secondary text-xs justify-center py-2"
      >
        <Download size={13} />
        Apply to My Subjects
      </button>
    </div>
  );
}

// ---- Main View ----
export function PresetsView() {
  const { presets, loading, addPreset, deletePreset } = usePresets();
  const { subjects, addSubject } = useSubjects();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [applyPreview, setApplyPreview] = useState<GradePreset | null>(null);

  const currentSubjectsAsEntries: SubjectPresetEntry[] = subjects.map(s => ({
    subjectName: s.subjectName,
    icon: s.icon,
    color: s.color,
    weight: s.weight ?? 3,
    targetGrade: s.targetGrade,
  }));

  const handleSavePreset = async (data: any) => {
    const id = generateId();
    const shareCode = encodePreset({ ...data, presetId: id, userId: '', createdAt: Date.now(), shareCode: '' });
    await addPreset({ ...data, shareCode });
  };

  const handleShare = async (preset: GradePreset) => {
    const code = preset.shareCode || encodePreset(preset);
    await navigator.clipboard.writeText(code);
    setCopiedId(preset.presetId);
    toast.success('Share code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (presetId: string) => {
    if (!confirm('Delete this preset?')) return;
    await deletePreset(presetId);
    toast.success('Preset deleted');
  };

  const handleImportSave = async (decoded: Omit<GradePreset, 'presetId' | 'userId' | 'createdAt' | 'shareCode'>) => {
    const id = generateId();
    const shareCode = encodePreset({ ...decoded, presetId: id, userId: '', createdAt: Date.now(), shareCode: '' });
    await addPreset({ ...decoded, shareCode });
    toast.success('Preset imported!');
  };

  const handleApplyPreset = async (preset: GradePreset) => {
    setApplyPreview(preset);
  };

  const confirmApply = async () => {
    if (!applyPreview) return;
    for (const s of applyPreview.subjects) {
      await addSubject({
        subjectName: s.subjectName,
        icon: s.icon,
        color: s.color,
        weight: s.weight,
        targetGrade: s.targetGrade,
        semester: '',
        teacherName: '',
      });
    }
    toast.success(`Added ${applyPreview.subjects.length} subjects from preset!`);
    setApplyPreview(null);
  };

  const handleApplyTemplate = async (template: typeof PRESET_TEMPLATES[0]) => {
    if (!confirm(`Add ${template.subjects.length} subjects from "${template.name}" to your subjects?`)) return;
    for (const s of template.subjects) {
      await addSubject({
        subjectName: s.subjectName,
        icon: s.icon,
        color: s.color,
        weight: s.weight,
        targetGrade: s.targetGrade,
        semester: '',
        teacherName: '',
      });
    }
    toast.success(`Added ${template.subjects.length} subjects!`);
  };

  return (
    <div className="p-4 sm:p-6 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grade Presets</h1>
          <p className="text-sm text-gray-500">Save subject lineups and share with classmates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary text-sm">
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={subjects.length === 0}
            className="btn-primary text-sm"
          >
            <Plus size={14} /> Save Current
          </button>
        </div>
      </div>

      {/* My Presets */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : presets.length > 0 ? (
        <div>
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">My Saved Presets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map(preset => (
              <PresetCard
                key={preset.presetId}
                preset={preset}
                onApply={() => handleApplyPreset(preset)}
                onDelete={() => handleDelete(preset.presetId)}
                onShare={() => handleShare(preset)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bookmark size={26} className="text-indigo-500" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">No presets yet</p>
          <p className="text-sm text-gray-500 mt-1">Save your current subjects as a preset to reuse or share with classmates.</p>
          {subjects.length > 0 && (
            <button onClick={() => setShowSaveModal(true)} className="btn-primary mx-auto mt-4 text-sm">
              <Plus size={14} /> Save My Subjects
            </button>
          )}
        </div>
      )}

      {/* PH Templates */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-amber-500" />
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">PH Curriculum Templates</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_TEMPLATES.map((template, i) => {
            const totalUnits = template.subjects.reduce((s, sub) => s + sub.weight, 0);
            const schoolLabel = SCHOOL_TYPES.find(t => t.value === template.schoolType)?.label || '';
            return (
              <div key={i} className="card p-4 border border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{template.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{template.subjects.length} subjects · {totalUnits} units</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium shrink-0">
                    {schoolLabel.split(' ')[0]}
                  </span>
                </div>
                {template.description && <p className="text-xs text-gray-500 mb-2">{template.description}</p>}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.subjects.slice(0, 4).map((s, j) => (
                    <span key={j} className="text-xs px-1.5 py-0.5 rounded-md" style={{ backgroundColor: s.color + '20', color: s.color }}>
                      {s.icon}
                    </span>
                  ))}
                  {template.subjects.length > 4 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500">
                      +{template.subjects.length - 4}
                    </span>
                  )}
                </div>
                <button onClick={() => handleApplyTemplate(template)} className="w-full btn-secondary text-xs justify-center py-2">
                  <Download size={12} /> Use Template
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Modal */}
      <SavePresetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePreset}
        subjects={currentSubjectsAsEntries}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportSave}
      />

      {/* Apply Confirmation Modal */}
      <Modal isOpen={!!applyPreview} onClose={() => setApplyPreview(null)} title="Apply Preset" size="sm">
        {applyPreview && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This will add <strong>{applyPreview.subjects.length} subjects</strong> from "{applyPreview.name}" to your subjects list.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {applyPreview.subjects.map((s, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: s.color + '20', color: s.color }}>
                  {s.icon} {s.subjectName} ({s.weight}u)
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApplyPreview(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={confirmApply} className="btn-primary flex-1 justify-center">Apply</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
