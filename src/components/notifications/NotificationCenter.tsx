import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, X, MessageCircle, ThumbsUp, Mail, Users2,
  CheckCheck, Trash2, AtSign, ChevronRight
} from 'lucide-react';
import { useAppNotifications } from '../../hooks/useFirebase';
import { AppNotification, AppNotificationType } from '../../types';
import { EmptyNotificationsIllustration } from '../illustrations';
import { cn, formatRelativeTime } from '../../utils/helpers';

const TYPE_META: Record<AppNotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  reply:       { icon: <MessageCircle size={14} />, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-500/20' },
  upvote:      { icon: <ThumbsUp size={14} />,      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
  upvote_reply:{ icon: <ThumbsUp size={14} />,      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
  dm:          { icon: <Mail size={14} />,           color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-100 dark:bg-purple-500/20' },
  rsvp:        { icon: <Users2 size={14} />,         color: 'text-orange-600 dark:text-orange-400',  bg: 'bg-orange-100 dark:bg-orange-500/20' },
  mention:     { icon: <AtSign size={14} />,         color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
};

const TABS: { id: 'all' | AppNotificationType; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'reply',       label: 'Replies' },
  { id: 'upvote',      label: 'Upvotes' },
  { id: 'dm',          label: 'DMs' },
  { id: 'rsvp',        label: 'RSVPs' },
];

function NotifItem({ notif, onRead }: { notif: AppNotification; onRead: (id: string) => void }) {
  const meta = TYPE_META[notif.type] || TYPE_META.reply;
  return (
    <button
      onClick={() => onRead(notif.id)}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0',
        !notif.read && 'bg-indigo-50/50 dark:bg-indigo-500/5'
      )}
    >
      {/* Icon */}
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', meta.bg, meta.color)}>
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{notif.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(notif.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
      )}
    </button>
  );
}

export function NotificationCenter({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { notifications, markRead, markAllRead, clearAll, unreadCount } = useAppNotifications();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | AppNotificationType>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = tab === 'all' ? notifications : notifications.filter(n =>
    tab === 'upvote' ? (n.type === 'upvote' || n.type === 'upvote_reply') : n.type === tab
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'relative p-2 rounded-xl transition-all',
          open
            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
            : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400'
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-500" />
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Mark all read"
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-3 py-2 border-b border-gray-100 dark:border-white/10 overflow-x-auto hide-scrollbar shrink-0">
            {TABS.map(t => {
              const count = t.id === 'all'
                ? unreadCount
                : notifications.filter(n => !n.read && (t.id === 'upvote' ? (n.type === 'upvote' || n.type === 'upvote_reply') : n.type === t.id)).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-all',
                    tab === t.id
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                  )}
                >
                  {t.label}
                  {count > 0 && (
                    <span className="w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="w-24 h-24 mb-3">
                  <EmptyNotificationsIllustration className="w-full h-full" />
                </div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No notifications here yet</p>
              </div>
            ) : (
              filtered.map(n => (
                <NotifItem key={n.id} notif={n} onRead={markRead} />
              ))
            )}
          </div>

          {/* Footer */}
          {onNavigate && (
            <div className="border-t border-gray-100 dark:border-white/10 shrink-0">
              <button
                onClick={() => { setOpen(false); onNavigate('community'); }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                Go to Community <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
