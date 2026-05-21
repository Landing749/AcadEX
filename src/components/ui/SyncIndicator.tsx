import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useSync } from '../../contexts/SyncContext';
import { cn } from '../../utils/helpers';

export function SyncIndicator() {
  const { syncStatus, isOnline, pendingCount } = useSync();

  const config = {
    synced: {
      icon: <CheckCircle size={14} />,
      label: 'Synced',
      className: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    },
    syncing: {
      icon: <RefreshCw size={14} className="animate-spin" />,
      label: 'Syncing...',
      className: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    },
    offline: {
      icon: <CloudOff size={14} />,
      label: 'Offline',
      className: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400',
    },
    pending: {
      icon: <RefreshCw size={14} className="animate-pulse" />,
      label: `${pendingCount} pending`,
      className: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    },
    failed: {
      icon: <AlertCircle size={14} />,
      label: 'Sync failed',
      className: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    },
  };

  const { icon, label, className } = config[syncStatus];

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', className)}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
