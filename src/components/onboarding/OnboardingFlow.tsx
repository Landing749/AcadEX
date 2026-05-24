import React, { useState } from 'react';
import {
  BookOpen, GraduationCap, School, Building2, ChevronRight,
  Bell, CheckCircle2, Sparkles, ArrowRight, X
} from 'lucide-react';
import { useOnboarding } from '../../hooks/useFirebase';
import { GraduationIllustration, BellIllustration, SchoolIllustration } from '../illustrations';
import { usePresets } from '../../hooks/useFirebase';
import { SchoolType, PRESET_TEMPLATES } from '../../types';
import { cn } from '../../utils/helpers';
import { requestNotificationPermission } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SCHOOL_TYPES: { id: SchoolType; label: string; sub: string; icon: React.ReactNode; color: string; bg: string }[] = [
  {
    id: 'jhs',
    label: 'Junior High School',
    sub: 'Grades 7–10 (DepEd JHS)',
    icon: <School size={28} />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
  },
  {
    id: 'shs',
    label: 'Senior High School',
    sub: 'Grades 11–12 (DepEd SHS)',
    icon: <GraduationCap size={28} />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
  },
  {
    id: 'college',
    label: 'College / University',
    sub: 'Bachelor\'s degree programs',
    icon: <Building2 size={28} />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
  },
];

const STEPS = ['Welcome', 'School Type', 'Import Preset', 'Notifications', 'Done'];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { completeOnboarding } = useOnboarding();
  const { importPreset } = usePresets();
  const [step, setStep] = useState(0);
  const [schoolType, setSchoolType] = useState<SchoolType>('college');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredPresets = PRESET_TEMPLATES.filter(p => p.schoolType === schoolType);

  const handleEnableNotifications = async () => {
    try {
      await requestNotificationPermission();
      setNotifEnabled(true);
      toast.success('Notifications enabled!');
    } catch {
      toast('You can enable notifications later in settings.', { icon: 'ℹ️' });
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (selectedPreset !== null && filteredPresets[selectedPreset]) {
        const preset = filteredPresets[selectedPreset];
        await importPreset(preset);
      }
      await completeOnboarding({
        schoolType,
        schoolName: '',
        notificationsEnabled: notifEnabled,
        completedAt: Date.now(),
      });
      toast.success('Welcome to Acadex! 🎉');
      onComplete();
    } catch (e) {
      toast.error('Setup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-300">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs text-gray-400">{STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="p-8 text-center">
              <div className="w-36 h-36 mx-auto mb-4">
                <GraduationIllustration className="w-full h-full" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Welcome to Acade<span className="text-indigo-500">x</span>! 🎉
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Your all-in-one academic companion built for Filipino students. Let's get you set up in just a minute.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: '📊', label: 'Track Grades' },
                  { icon: '📅', label: 'Manage Tasks' },
                  { icon: '👥', label: 'Study Community' },
                ].map(f => (
                  <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                    <span className="text-2xl">{f.icon}</span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{f.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary w-full justify-center text-base py-3">
                Let's Start <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1: School Type */}
          {step === 1 && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">What's your school type?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This helps us show the right grading system</p>
              </div>
              <div className="space-y-3 mb-6">
                {SCHOOL_TYPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSchoolType(s.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                      schoolType === s.id
                        ? s.bg + ' ' + s.color
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                    )}
                  >
                    <div className={cn('shrink-0', schoolType === s.id ? s.color : 'text-gray-400')}>
                      {s.icon}
                    </div>
                    <div>
                      <p className={cn('font-bold text-sm', schoolType === s.id ? '' : 'text-gray-900 dark:text-white')}>{s.label}</p>
                      <p className={cn('text-xs mt-0.5', schoolType === s.id ? 'opacity-70' : 'text-gray-500 dark:text-gray-400')}>{s.sub}</p>
                    </div>
                    {schoolType === s.id && (
                      <CheckCircle2 size={18} className="ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center">Next <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* Step 2: Import Preset */}
          {step === 2 && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import a subject preset</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start with a pre-built subject list (optional)</p>
              </div>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {filteredPresets.length === 0 ? (
                  <p className="text-sm text-center text-gray-400 py-6">No presets for {schoolType.toUpperCase()} yet</p>
                ) : (
                  filteredPresets.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPreset(selectedPreset === i ? null : i)}
                      className={cn(
                        'w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all text-left',
                        selectedPreset === i
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      )}
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.description} • {p.subjects.length} subjects</p>
                      </div>
                      {selectedPreset === i && <CheckCircle2 size={18} className="ml-auto text-indigo-500 shrink-0 mt-0.5" />}
                    </button>
                  ))
                )}
              </div>
              {selectedPreset === null && (
                <p className="text-xs text-center text-gray-400 mb-4">✓ Skip this — you can add subjects manually later</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 justify-center">Next <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* Step 3: Notifications */}
          {step === 3 && (
            <div className="p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4">
                <BellIllustration className="w-full h-full" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Stay on top of things</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Get notified about due assignments, replies in the community, and study group invites.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: '📋', label: 'Assignment reminders' },
                  { icon: '💬', label: 'Community replies & upvotes' },
                  { icon: '👥', label: 'Study group updates' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <span>{f.icon}</span>{f.label}
                  </div>
                ))}
              </div>
              {notifEnabled ? (
                <div className="flex items-center justify-center gap-2 py-3 mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={18} /> <span className="text-sm font-semibold">Notifications enabled!</span>
                </div>
              ) : (
                <button onClick={handleEnableNotifications} className="btn-primary w-full justify-center mb-3">
                  <Bell size={16} /> Enable Notifications
                </button>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">Back</button>
                <button onClick={() => setStep(4)} className="btn-primary flex-1 justify-center">Next <ChevronRight size={16} /></button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're all set!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                {selectedPreset !== null && filteredPresets[selectedPreset]
                  ? `Importing "${filteredPresets[selectedPreset].name}" subjects...`
                  : 'Your Acadex account is ready to go.'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                School Type: <span className="font-semibold uppercase text-indigo-500">{schoolType}</span>
                {notifEnabled && ' · Notifications ON'}
              </p>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="btn-primary w-full justify-center text-base py-3"
              >
                {loading ? 'Setting up...' : 'Go to Dashboard 🚀'}
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        {step < 4 && (
          <button
            onClick={async () => {
              await completeOnboarding({ schoolType, schoolName: '', notificationsEnabled: false, completedAt: Date.now() });
              onComplete();
            }}
            className="block w-full text-center text-xs text-gray-500 hover:text-gray-300 mt-4 transition-colors"
          >
            Skip setup
          </button>
        )}
      </div>
    </div>
  );
}
