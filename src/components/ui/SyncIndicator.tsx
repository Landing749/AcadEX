import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useSync } from '../../contexts/SyncContext';
import { cn } from '../../utils/helpers';

export function SyncIndicator() {
  const { syncStatus, isOnline, pendingCount } = useSync();

  const configs = {
    synced: {
      icon: <CheckCircle size={12}/>,
      label: 'Synced',
      dot: 'bg-emerald-500',
      cls: 'text-emerald-600 dark:text-emerald-400',
    },
    syncing: {
      icon: <RefreshCw size={12} className="animate-spin"/>,
      label: 'Syncing',
      dot: 'bg-blue-500 animate-pulse',
      cls: 'text-blue-600 dark:text-blue-400',
    },
    offline: {
      icon: <CloudOff size={12}/>,
      label: 'Offline',
      dot: 'bg-gray-400',
      cls: 'text-gray-500 dark:text-gray-400',
    },
    pending: {
      icon: <Cloud size={12}/>,
      label: `${pendingCount} queued`,
      dot: 'bg-amber-500 animate-pulse',
      cls: 'text-amber-600 dark:text-amber-400',
    },
    failed: {
      icon: <AlertCircle size={12}/>,
      label: 'Failed',
      dot: 'bg-red-500',
      cls: 'text-red-600 dark:text-red-400',
    },
  };

  const c = configs[syncStatus];

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold', c.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)}/>
      {c.icon}
      <span className="hidden sm:inline">{c.label}</span>
    </div>
  );
}
