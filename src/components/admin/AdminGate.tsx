import React from 'react';
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { AdminIllustration, AccessDeniedIllustration } from '../illustrations';
import { useAdminAccess } from '../../hooks/useFirebase';
import { useAuth } from '../../contexts/AuthContext';

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const { currentUser } = useAuth();
  const { isAdmin } = useAdminAccess();

  // ── Checking Firebase ──────────────────────────────────────────────────────
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32">
            <AdminIllustration className="w-full h-full" />
            <span className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" style={{ borderRadius: '50%' }} />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Verifying access
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not an admin ───────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-36 h-36 mx-auto mb-3">
            <AccessDeniedIllustration className="w-full h-full" />
          </div>

          <h1
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Access Denied
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            Your account doesn't have admin privileges. Ask the database owner to add your UID to{' '}
            <code className="px-1.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/10 font-mono text-xs text-gray-700 dark:text-gray-300">
              /admin/&lt;uid&gt;
            </code>{' '}
            in Firebase.
          </p>

          {/* UID card — easy to copy */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-left">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">Your UID</p>
            <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all select-all leading-relaxed">
              {currentUser?.uid}
            </p>
            <p className="text-xs text-gray-400 mt-2">{currentUser?.email}</p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Select the UID above, copy it, and paste it as a key under{' '}
            <code className="font-mono">/admin/</code> in your Firebase Realtime Database.
          </p>
        </div>
      </div>
    );
  }

  // ── Admin confirmed — render panel ────────────────────────────────────────
  return (
    <>
      {/* Thin admin ribbon */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border-b border-red-200 dark:border-red-500/20 shrink-0">
        <ShieldCheck size={13} className="text-red-500 shrink-0" />
        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
          Admin Mode
        </span>
        <span className="text-xs text-red-400 dark:text-red-500 ml-1">
          · {currentUser?.email}
        </span>
      </div>
      {children}
    </>
  );
}
