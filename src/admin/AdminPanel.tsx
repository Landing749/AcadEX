import React, { useState } from 'react';
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Trash2,
  Flag, User, MessageCircle, FileText, Clock, Eye,
  EyeOff, ChevronDown, Filter, BarChart2, Users, Activity
} from 'lucide-react';
import { useAdminReports, useCommunity } from '../../hooks/useFirebase';
import { Report, ReportStatus } from '../../types';
import { cn, formatRelativeTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = ['admin@acadex.ph', 'admin@acadex.com']; // Configurable admin emails

const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-500/20',   icon: <Clock size={12} /> },
  reviewed:   { label: 'Reviewed',   color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-500/20',     icon: <Eye size={12} /> },
  actioned:   { label: 'Actioned',   color: 'text-red-700 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-500/20',       icon: <XCircle size={12} /> },
  dismissed:  { label: 'Dismissed',  color: 'text-gray-700 dark:text-gray-400',     bg: 'bg-gray-100 dark:bg-gray-500/20',     icon: <CheckCircle2 size={12} /> },
};

const TARGET_META: Record<string, { icon: React.ReactNode; label: string }> = {
  post:  { icon: <FileText size={14} />, label: 'Post' },
  reply: { icon: <MessageCircle size={14} />, label: 'Reply' },
  user:  { icon: <User size={14} />, label: 'User' },
};

function ReportCard({ report, onAction }: { report: Report; onAction: (id: string, status: ReportStatus, note?: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(report.adminNote || '');
  const { deletePost, deleteReply, flagPost } = useAdminReports();
  const statusMeta = STATUS_META[report.status];
  const targetMeta = TARGET_META[report.targetType] || TARGET_META.post;

  const handleAction = async (status: ReportStatus) => {
    onAction(report.reportId, status, note || undefined);
    toast.success(`Report ${status}`);
  };

  const handleDeleteContent = async () => {
    if (!confirm('Delete this content permanently?')) return;
    if (report.targetType === 'post') await deletePost(report.targetId);
    else if (report.targetType === 'reply') await deleteReply(report.targetId);
    await handleAction('actioned');
    toast.success('Content deleted');
  };

  const handleFlag = async (flagged: boolean) => {
    if (report.targetType === 'post') await flagPost(report.targetId, flagged);
    toast.success(flagged ? 'Content flagged' : 'Flag removed');
  };

  return (
    <div className={cn(
      'card overflow-hidden border-l-4',
      report.status === 'pending' ? 'border-l-amber-400' :
      report.status === 'actioned' ? 'border-l-red-400' :
      report.status === 'reviewed' ? 'border-l-blue-400' : 'border-l-gray-300'
    )}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        {/* Target Type Icon */}
        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400">
          {targetMeta.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold', statusMeta.bg, statusMeta.color)}>
              {statusMeta.icon} {statusMeta.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {targetMeta.label} • {report.reason}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">
            {report.targetContent ? `"${report.targetContent.slice(0, 80)}..."` : `[${report.targetType} ${report.targetId.slice(0, 8)}]`}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Reported by {report.reportedByName} · {formatRelativeTime(report.createdAt)}
          </p>
        </div>

        <ChevronDown size={16} className={cn('text-gray-400 shrink-0 mt-1 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/10 pt-4 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-gray-400 mb-1">Target ID</p>
              <p className="font-mono text-gray-700 dark:text-gray-300 break-all">{report.targetId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-gray-400 mb-1">Reporter</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{report.reportedByName}</p>
              <p className="text-gray-400 break-all">{report.reportedBy.slice(0, 12)}...</p>
            </div>
          </div>

          {report.reasonDetail && (
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-sm">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Reporter's note:</p>
              <p className="text-gray-700 dark:text-gray-300">{report.reasonDetail}</p>
            </div>
          )}

          {/* Admin Note */}
          <div>
            <label className="label">Admin Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="Add moderation note..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {report.status === 'pending' && (
              <>
                <button
                  onClick={() => handleAction('reviewed')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  <Eye size={12} /> Mark Reviewed
                </button>
                <button
                  onClick={() => handleAction('dismissed')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  <CheckCircle2 size={12} /> Dismiss
                </button>
              </>
            )}
            {report.targetType !== 'user' && (
              <>
                <button
                  onClick={() => handleFlag(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  <Flag size={12} /> Flag Content
                </button>
                <button
                  onClick={handleDeleteContent}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  <Trash2 size={12} /> Delete Content
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPanel() {
  const { reports, loading, updateReportStatus } = useAdminReports();
  const { posts } = useCommunity();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'post' | 'reply' | 'user'>('all');
  const [showArchive, setShowArchive] = useState(false);

  // Active = needs attention; Archived = resolved (actioned / dismissed)
  const activeReports = reports.filter(r => r.status === 'pending' || r.status === 'reviewed');
  const archivedReports = reports.filter(r => r.status === 'actioned' || r.status === 'dismissed');

  const filtered = (showArchive ? archivedReports : activeReports).filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.targetType !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    actioned: reports.filter(r => r.status === 'actioned').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  const flaggedPosts = posts.filter(p => (p as any).flagged);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center">
          <Shield size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Admin Panel
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Moderation & Community Management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Reports', value: stats.total, icon: <AlertTriangle size={16} />, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-white/10' },
          { label: 'Pending', value: stats.pending, icon: <Clock size={16} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20' },
          { label: 'Actioned', value: stats.actioned, icon: <XCircle size={16} />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20' },
          { label: 'Flagged Posts', value: flaggedPosts.length, icon: <Flag size={16} />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-2', s.bg, s.color)}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Flagged Posts */}
      {flaggedPosts.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Flag size={14} className="text-orange-500" /> Flagged Content ({flaggedPosts.length})
          </h2>
          <div className="space-y-2">
            {flaggedPosts.map(post => (
              <div key={post.postId} className="card p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">{post.authorName} · {formatRelativeTime(post.createdAt)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 font-semibold">FLAGGED</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports */}
      <div>
        {/* Active / Archive toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => { setShowArchive(false); setStatusFilter('all'); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              !showArchive
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:opacity-80'
            )}
          >
            <AlertTriangle size={12} /> Active ({activeReports.length})
          </button>
          <button
            onClick={() => { setShowArchive(true); setStatusFilter('all'); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              showArchive
                ? 'bg-gray-200 dark:bg-white/20 text-gray-700 dark:text-gray-300'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:opacity-80'
            )}
          >
            <EyeOff size={12} /> Archive ({archivedReports.length})
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {showArchive
              ? <><EyeOff size={14} className="text-gray-400" /> Archived Reports ({filtered.length})</>
              : <><AlertTriangle size={14} className="text-amber-500" /> Active Reports ({filtered.length})</>
            }
          </h2>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Status</option>
              {!showArchive && <option value="pending">Pending</option>}
              {!showArchive && <option value="reviewed">Reviewed</option>}
              {showArchive && <option value="actioned">Actioned</option>}
              {showArchive && <option value="dismissed">Dismissed</option>}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Types</option>
              <option value="post">Posts</option>
              <option value="reply">Replies</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Shield size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            {showArchive ? (
              <>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Archive is empty</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Resolved reports will appear here</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No reports to review</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">The community is looking healthy!</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <ReportCard key={r.reportId} report={r} onAction={updateReportStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
