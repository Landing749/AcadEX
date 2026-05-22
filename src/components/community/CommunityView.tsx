import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageCircle, ThumbsUp, Plus, Send, School, X,
  ChevronDown, Clock, Search, CheckCircle2,
  ArrowLeft, Users2, Bookmark, BookmarkCheck, UserCheck, UserPlus,
  TrendingUp, Calendar, FileText, Lightbulb, HelpCircle, Flame,
  EyeOff, CalendarPlus, AtSign,
} from 'lucide-react';
import { useCommunity, useProfile, useSavedPosts, useDirectMessages, useConnections } from '../../hooks/useFirebase';
import { useAuth } from '../../contexts/AuthContext';
import { HelpPost, HelpReply, PHILIPPINE_SCHOOLS, PostType, POST_TYPE_META } from '../../types';
import { Modal } from '../ui/Modal';
import { cn, formatRelativeTime, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trendingScore(post: HelpPost) {
  const hoursOld = Math.max(1, (Date.now() - post.createdAt) / 3_600_000);
  return ((post.upvotes || 0) + (post.replyCount || 0)) / hoursOld;
}

function PostTypeBadge({ type }: { type: PostType }) {
  const meta = POST_TYPE_META[type] || POST_TYPE_META.question;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold', meta.bg, meta.darkBg, meta.color)}>
      <span>{meta.icon}</span> {meta.label}
    </span>
  );
}

// ─── New Post Modal ────────────────────────────────────────────────────────────

function NewPostModal({
  isOpen, onClose, onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string; body: string; schoolTag: string; subjectTag: string;
    postType: PostType; isAnonymous: boolean; studyGroupDate?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [schoolTag, setSchoolTag] = useState('');
  const [subjectTag, setSubjectTag] = useState('');
  const [postType, setPostType] = useState<PostType>('question');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [studyGroupDate, setStudyGroupDate] = useState('');
  const [loading, setLoading] = useState(false);

  const POST_TYPES: { value: PostType; label: string; icon: string; placeholder: string }[] = [
    { value: 'question',    label: 'Question',    icon: '❓', placeholder: 'e.g. How do I solve this integral? Can someone explain photosynthesis?' },
    { value: 'study_group', label: 'Study Group', icon: '👥', placeholder: 'e.g. Looking for group to study for our upcoming Math finals!' },
    { value: 'notes_share', label: 'Notes Share', icon: '📝', placeholder: 'e.g. Sharing my summary notes for Biochemistry Chapter 4' },
    { value: 'exam_tip',    label: 'Exam Tip',    icon: '💡', placeholder: 'e.g. For Physics exams, always draw a free body diagram first!' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !schoolTag) return;
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(), body: body.trim(), schoolTag, subjectTag: subjectTag.trim(),
        postType, isAnonymous,
        ...(postType === 'study_group' && studyGroupDate ? { studyGroupDate } : {}),
      });
      toast.success('Post shared with the community!');
      setTitle(''); setBody(''); setSchoolTag(''); setSubjectTag(''); setStudyGroupDate('');
      onClose();
    } catch {
      toast.error('Failed to post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentMeta = POST_TYPE_META[postType];
  const currentPlaceholder = POST_TYPES.find(t => t.value === postType)?.placeholder || '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Post" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Type Selector */}
        <div>
          <label className="label">Post Type</label>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setPostType(t.value)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                  postType === t.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                )}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">
            {postType === 'question' ? 'Your Question' : postType === 'study_group' ? 'Group Name / Subject' : postType === 'notes_share' ? 'Notes Title' : 'Tip Title'} *
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            placeholder={currentPlaceholder.split('?')[0] || currentPlaceholder.slice(0, 60)}
            required
          />
        </div>

        <div>
          <label className="label">
            {postType === 'question' ? 'Details / Context' : postType === 'study_group' ? 'What will you study? Meeting details?' : postType === 'notes_share' ? 'What topics do your notes cover?' : 'Explain your tip'} *
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="input resize-none"
            rows={4}
            placeholder="Add more details here..."
            required
          />
        </div>

        {/* Study Group Date */}
        {postType === 'study_group' && (
          <div>
            <label className="label">Study Session Date & Time (optional)</label>
            <input
              type="datetime-local"
              value={studyGroupDate}
              onChange={e => setStudyGroupDate(e.target.value)}
              className="input"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">School *</label>
            <select value={schoolTag} onChange={e => setSchoolTag(e.target.value)} className="input" required>
              <option value="">Select school...</option>
              {PHILIPPINE_SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Subject Tag</label>
            <input
              value={subjectTag}
              onChange={e => setSubjectTag(e.target.value)}
              className="input"
              placeholder="e.g. Math, Physics..."
            />
          </div>
        </div>

        {/* Anonymous toggle */}
        <button
          type="button"
          onClick={() => setIsAnonymous(v => !v)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold',
            isAnonymous
              ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
              : 'border-dashed border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300'
          )}
        >
          <EyeOff size={16} />
          <div className="text-left">
            <p>{isAnonymous ? 'Posting anonymously' : 'Post anonymously'}</p>
            {isAnonymous && <p className="text-xs font-normal text-gray-400">Your name will be hidden. Author ID is stored for moderation.</p>}
          </div>
          <div className={cn('ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', isAnonymous ? 'border-gray-500 bg-gray-400' : 'border-gray-300')}>
            {isAnonymous && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
          </div>
        </button>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading || !title.trim() || !body.trim() || !schoolTag} className="btn-primary flex-1 justify-center">
            {loading ? 'Posting...' : <><Send size={14} /> Post</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── DM Thread Modal ───────────────────────────────────────────────────────────

function DMModal({
  isOpen, onClose, targetUserId, targetUserName,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}) {
  const { messages, loading, sendMessage } = useDirectMessages(isOpen ? targetUserId : null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { currentUser } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage(text.trim());
      setText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chat with ${targetUserName}`} size="md">
      <div className="flex flex-col h-80">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
          {loading && <div className="text-center text-sm text-gray-400 py-4">Loading...</div>}
          {!loading && messages.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-8">
              <AtSign size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>Start the conversation!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <div key={msg.messageId} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[75%] px-3 py-2 rounded-2xl text-sm',
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                )}>
                  <p>{msg.body}</p>
                  <p className={cn('text-[10px] mt-0.5', isMe ? 'text-indigo-200' : 'text-gray-400')}>
                    {formatRelativeTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className="input flex-1 py-2 text-sm"
            placeholder="Type a message..."
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-3 py-2">
            <Send size={14} />
          </button>
        </form>
      </div>
    </Modal>
  );
}

// ─── Study Partner Modal ───────────────────────────────────────────────────────

function StudyPartnerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { posts } = useCommunity();
  const { profile } = useProfile();
  const { currentUser } = useAuth();
  const { connections, toggleConnection } = useConnections();
  const [subjectFilter, setSubjectFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState(profile?.school || '');
  const [dmTarget, setDmTarget] = useState<{ userId: string; userName: string } | null>(null);

  const schools = useMemo(() => [...new Set(posts.map(p => p.schoolTag).filter(Boolean))].sort(), [posts]);

  const partners = useMemo(() => {
    const filtered = posts.filter(p => {
      const matchSchool = !schoolFilter || p.schoolTag === schoolFilter;
      const matchSubject = !subjectFilter || p.subjectTag?.toLowerCase().includes(subjectFilter.toLowerCase());
      return matchSchool && matchSubject && Boolean(p.authorName) && p.authorId !== currentUser?.uid;
    });

    const byAuthor = new Map<string, { authorId: string; authorName: string; schools: Set<string>; subjects: Set<string>; postCount: number; lastActive: number }>();
    for (const p of filtered) {
      const existing = byAuthor.get(p.authorId);
      if (existing) {
        existing.schools.add(p.schoolTag);
        if (p.subjectTag) existing.subjects.add(p.subjectTag);
        existing.postCount++;
        if (p.createdAt > existing.lastActive) existing.lastActive = p.createdAt;
      } else {
        byAuthor.set(p.authorId, {
          authorId: p.authorId, authorName: p.isAnonymous ? 'Anonymous Student' : p.authorName,
          schools: new Set([p.schoolTag]),
          subjects: new Set(p.subjectTag ? [p.subjectTag] : []),
          postCount: 1, lastActive: p.createdAt,
        });
      }
    }
    return [...byAuthor.values()].sort((a, b) => b.lastActive - a.lastActive).slice(0, 20);
  }, [posts, schoolFilter, subjectFilter, currentUser]);

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Find a Study Partner" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">School</label>
              <select value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)} className="input text-sm">
                <option value="">All schools</option>
                {schools.map(s => <option key={s} value={s}>{s.length > 30 ? s.slice(0, 28) + '…' : s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <input value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="input text-sm" placeholder="e.g. Math…" />
            </div>
          </div>

          {partners.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users2 size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium">No matches yet.</p>
              <p className="text-xs mt-1">Try broadening your filters.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {partners.map(p => {
                const isConnected = connections.some(c => c.userId === p.authorId);
                return (
                  <div key={p.authorId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(p.authorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.authorName}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {[...p.schools].slice(0, 1).map(s => (
                          <span key={s} className="text-xs text-blue-500 flex items-center gap-0.5">
                            <School size={10} />{s.length > 20 ? s.slice(0, 18) + '…' : s}
                          </span>
                        ))}
                        {[...p.subjects].slice(0, 2).map(s => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleConnection(p.authorId, p.authorName)}
                        className={cn(
                          'p-1.5 rounded-lg transition-all text-xs',
                          isConnected
                            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                        )}
                        title={isConnected ? 'Remove connection' : 'Add connection'}
                      >
                        {isConnected ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      </button>
                      <button
                        onClick={() => setDmTarget({ userId: p.authorId, userName: p.authorName })}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all"
                        title="Send message"
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {dmTarget && (
        <DMModal
          isOpen={Boolean(dmTarget)}
          onClose={() => setDmTarget(null)}
          targetUserId={dmTarget.userId}
          targetUserName={dmTarget.userName}
        />
      )}
    </>
  );
}

// ─── Post Detail ───────────────────────────────────────────────────────────────

function PostDetail({
  post, replies, onBack, onUpvotePost, onAddReply, onUpvoteReply, onMarkResolved, onRsvp,
}: {
  post: HelpPost;
  replies: HelpReply[];
  onBack: () => void;
  onUpvotePost: (post: HelpPost) => void;
  onAddReply: (postId: string, body: string) => Promise<void>;
  onUpvoteReply: (reply: HelpReply) => void;
  onMarkResolved: (replyId: string) => void;
  onRsvp: (postId: string) => void;
}) {
  const { currentUser } = useAuth();
  const { savedIds, toggleSave } = useSavedPosts();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [dmTarget, setDmTarget] = useState<{ userId: string; userName: string } | null>(null);
  const hasUpvotedPost = currentUser ? post.upvotedBy?.includes(currentUser.uid) : false;
  const isSaved = savedIds.has(post.postId);
  const hasRsvpd = currentUser ? post.studyGroupRsvps?.includes(currentUser.uid) : false;
  const authorDisplayName = post.isAnonymous ? 'Anonymous Student' : post.authorName;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await onAddReply(post.postId, replyText.trim());
      setReplyText('');
      toast.success('Reply posted!');
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={16} /> Back to Feed
        </button>
        <button
          onClick={() => { toggleSave(post.postId); toast.success(isSaved ? 'Removed from bookmarks' : 'Bookmarked!'); }}
          className={cn('p-2 rounded-xl transition-all', isSaved ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-50 dark:hover:bg-white/5')}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0', post.isAnonymous ? 'bg-gray-400' : 'bg-indigo-600')}>
              {post.isAnonymous ? <EyeOff size={14} /> : getInitials(post.authorName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{authorDisplayName}</p>
              <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end items-center">
            <PostTypeBadge type={post.postType || 'question'} />
            {post.subjectTag && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">{post.subjectTag}</span>
            )}
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-3">{post.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">{post.body}</p>

        {/* Study Group: date + RSVP */}
        {post.postType === 'study_group' && post.studyGroupDate && (
          <div className="mt-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Study Session</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  {new Date(post.studyGroupDate).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-violet-500">{(post.studyGroupRsvps || []).length} going</span>
              <button
                onClick={() => onRsvp(post.postId)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
                  hasRsvpd
                    ? 'bg-violet-600 text-white'
                    : 'bg-white dark:bg-white/10 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/30 hover:bg-violet-600 hover:text-white'
                )}
              >
                {hasRsvpd ? <><CheckCircle2 size={11} className="inline mr-1" />Going</> : <><CalendarPlus size={11} className="inline mr-1" />RSVP</>}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex-wrap">
          <button
            onClick={() => onUpvotePost(post)}
            className={cn('flex items-center gap-1.5 text-sm transition-colors', hasUpvotedPost ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400 hover:text-indigo-500')}
          >
            <ThumbsUp size={14} /> {post.upvotes || 0}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <MessageCircle size={14} /> {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
          <span className="flex items-center gap-1 text-xs text-blue-500 ml-auto">
            <School size={11} /> {post.schoolTag.length > 25 ? post.schoolTag.slice(0, 23) + '...' : post.schoolTag}
          </span>
          {/* DM author button (only if not anonymous, not self) */}
          {!post.isAnonymous && currentUser && post.authorId !== currentUser.uid && (
            <button
              onClick={() => setDmTarget({ userId: post.authorId, userName: post.authorName })}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
            >
              <AtSign size={12} /> Message
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3 mb-4">
          {replies.sort((a, b) => (b.isResolved ? 1 : 0) - (a.isResolved ? 1 : 0) || a.createdAt - b.createdAt).map(reply => {
            const hasUpvoted = currentUser ? reply.upvotedBy?.includes(currentUser.uid) : false;
            const isOwn = currentUser?.uid === post.authorId;
            return (
              <div key={reply.replyId} className={cn('card p-4', reply.isResolved && 'border border-green-300 dark:border-green-500/40')}>
                {reply.isResolved && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold mb-2">
                    <CheckCircle2 size={13} /> Marked as Helpful
                  </div>
                )}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(reply.authorName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{reply.authorName}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(reply.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => onUpvoteReply(reply)}
                    className={cn('flex items-center gap-1 text-xs transition-colors', hasUpvoted ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400 hover:text-indigo-500')}
                  >
                    <ThumbsUp size={12} /> {reply.upvotes || 0} helpful
                  </button>
                  {isOwn && !reply.isResolved && (
                    <button onClick={() => onMarkResolved(reply.replyId)} className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 flex items-center gap-1 transition-colors">
                      <CheckCircle2 size={12} /> Mark as helpful
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleReply} className="card p-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Write a reply</p>
        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          className="input resize-none mb-3"
          rows={3}
          placeholder="Share your answer or tip..."
        />
        <button type="submit" disabled={sending || !replyText.trim()} className="btn-primary text-sm">
          <Send size={13} /> {sending ? 'Sending...' : 'Post Reply'}
        </button>
      </form>

      {dmTarget && (
        <DMModal isOpen={Boolean(dmTarget)} onClose={() => setDmTarget(null)} targetUserId={dmTarget.userId} targetUserName={dmTarget.userName} />
      )}
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({ post, onClick, onUpvote, onToggleSave, isSaved }: {
  post: HelpPost;
  onClick: () => void;
  onUpvote: (e: React.MouseEvent) => void;
  onToggleSave: (e: React.MouseEvent) => void;
  isSaved: boolean;
}) {
  const { currentUser } = useAuth();
  const hasUpvoted = currentUser ? post.upvotedBy?.includes(currentUser.uid) : false;
  const authorDisplayName = post.isAnonymous ? 'Anonymous Student' : post.authorName;
  const meta = POST_TYPE_META[post.postType || 'question'];

  return (
    <button onClick={onClick} className="card p-4 text-left w-full hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold', post.isAnonymous ? 'bg-gray-400' : 'bg-indigo-600')}>
            {post.isAnonymous ? <EyeOff size={12} /> : getInitials(post.authorName)}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{authorDisplayName}</p>
            <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <PostTypeBadge type={post.postType || 'question'} />
        </div>
      </div>

      {/* Study group date pill */}
      {post.postType === 'study_group' && post.studyGroupDate && (
        <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 mb-1.5">
          <Calendar size={10} />
          {new Date(post.studyGroupDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {(post.studyGroupRsvps || []).length > 0 && (
            <span className="ml-1 text-violet-400">· {(post.studyGroupRsvps || []).length} going</span>
          )}
        </div>
      )}

      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 text-sm">
        {post.title}
      </h3>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.body}</p>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
        <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
          <School size={10} /> {post.schoolTag.length > 22 ? post.schoolTag.slice(0, 20) + '...' : post.schoolTag}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={onUpvote} className={cn('flex items-center gap-1 text-xs transition-colors', hasUpvoted ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400 hover:text-indigo-500')}>
            <ThumbsUp size={11} /> {post.upvotes || 0}
          </button>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <MessageCircle size={11} /> {post.replyCount || 0}
          </span>
          <button onClick={onToggleSave} className={cn('p-0.5 rounded transition-colors', isSaved ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 hover:text-indigo-400')}>
            {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
        </div>
      </div>
    </button>
  );
}

// ─── Main Community View ───────────────────────────────────────────────────────

type FeedTab = 'latest' | 'trending' | 'saved';

export function CommunityView() {
  const { currentUser } = useAuth();
  const { posts, replies, loading, addPost, addReply, upvotePost, upvoteReply, markReplyResolved, rsvpStudyGroup } = useCommunity();
  const { savedIds, toggleSave } = useSavedPosts();
  const [showNewPost, setShowNewPost] = useState(false);
  const [showPartners, setShowPartners] = useState(false);
  const [selectedPost, setSelectedPost] = useState<HelpPost | null>(null);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<PostType | 'all'>('all');
  const [feedTab, setFeedTab] = useState<FeedTab>('latest');

  const filtered = useMemo(() => {
    let list = posts.filter(p => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase());
      const matchSchool = schoolFilter === 'all' || p.schoolTag === schoolFilter;
      const matchType = typeFilter === 'all' || p.postType === typeFilter;
      const matchSaved = feedTab !== 'saved' || savedIds.has(p.postId);
      return matchSearch && matchSchool && matchType && matchSaved;
    });

    if (feedTab === 'trending') {
      list = [...list].sort((a, b) => trendingScore(b) - trendingScore(a));
    } else if (feedTab === 'latest' || feedTab === 'saved') {
      list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    }

    return list;
  }, [posts, search, schoolFilter, typeFilter, feedTab, savedIds]);

  const postReplies = selectedPost ? replies.filter(r => r.postId === selectedPost.postId) : [];

  const handleNewPost = async (data: any) => {
    if (!currentUser) return;
    await addPost({
      ...data,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
    });
  };

  const handleUpvotePost = async (post: HelpPost) => {
    if (!currentUser) { toast.error('Sign in to upvote'); return; }
    await upvotePost(post.postId, currentUser.uid);
  };

  const handleAddReply = async (postId: string, body: string) => {
    if (!currentUser) return;
    await addReply({
      postId, body,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
    });
    setSelectedPost(prev => prev ? { ...prev, replyCount: (prev.replyCount || 0) + 1 } : prev);
  };

  const handleUpvoteReply = async (reply: HelpReply) => {
    if (!currentUser) { toast.error('Sign in to upvote'); return; }
    await upvoteReply(reply.replyId, currentUser.uid);
  };

  const handleMarkResolved = async (replyId: string) => {
    await markReplyResolved(replyId);
    toast.success('Marked as helpful!');
  };

  const handleRsvp = async (postId: string) => {
    if (!currentUser) { toast.error('Sign in to RSVP'); return; }
    await rsvpStudyGroup(postId, currentUser.uid);
    const post = posts.find(p => p.postId === postId);
    const alreadyIn = post?.studyGroupRsvps?.includes(currentUser.uid);
    toast.success(alreadyIn ? 'RSVP removed' : 'You\'re going! 🎉');
    if (selectedPost?.postId === postId) {
      setSelectedPost(prev => {
        if (!prev) return prev;
        const alreadyInLocal = prev.studyGroupRsvps?.includes(currentUser.uid);
        const studyGroupRsvps = alreadyInLocal
          ? (prev.studyGroupRsvps || []).filter(id => id !== currentUser.uid)
          : [...(prev.studyGroupRsvps || []), currentUser.uid];
        return { ...prev, studyGroupRsvps };
      });
    }
  };

  if (selectedPost) {
    return (
      <div className="p-4 sm:p-6">
        <PostDetail
          post={selectedPost}
          replies={postReplies}
          onBack={() => setSelectedPost(null)}
          onUpvotePost={handleUpvotePost}
          onAddReply={handleAddReply}
          onUpvoteReply={handleUpvoteReply}
          onMarkResolved={handleMarkResolved}
          onRsvp={handleRsvp}
        />
      </div>
    );
  }

  const POST_TYPE_FILTERS: { value: PostType | 'all'; label: string; icon: string }[] = [
    { value: 'all',         label: 'All',         icon: '📋' },
    { value: 'question',    label: 'Questions',   icon: '❓' },
    { value: 'study_group', label: 'Groups',      icon: '👥' },
    { value: 'notes_share', label: 'Notes',       icon: '📝' },
    { value: 'exam_tip',    label: 'Tips',        icon: '💡' },
  ];

  return (
    <div className="p-4 sm:p-6 animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Help</h1>
          <p className="text-sm text-gray-500">Ask questions, help classmates across PH schools</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPartners(true)} className="btn-secondary shrink-0 text-sm">
            <Users2 size={14} /> Partners
          </button>
          <button onClick={() => setShowNewPost(true)} className="btn-primary shrink-0 text-sm">
            <Plus size={14} /> Post
          </button>
        </div>
      </div>

      {/* Feed Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
        {([
          { value: 'latest' as FeedTab, label: 'Latest', icon: Clock },
          { value: 'trending' as FeedTab, label: 'Trending', icon: Flame },
          { value: 'saved' as FeedTab, label: 'Saved', icon: Bookmark },
        ]).map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setFeedTab(tab.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all',
                feedTab === tab.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              <Icon size={13} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Post Type Filter Pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5">
        {POST_TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border',
              typeFilter === f.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-indigo-300'
            )}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Search & School Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-8 py-2 text-sm" placeholder="Search posts..." />
        </div>
        <select value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)} className="input py-2 text-sm max-w-[140px]">
          <option value="all">All Schools</option>
          {PHILIPPINE_SCHOOLS.map(s => <option key={s} value={s}>{s.length > 20 ? s.slice(0, 18) + '...' : s}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><MessageCircle size={12} /> {posts.length} posts</span>
        <span className="flex items-center gap-1"><ThumbsUp size={12} /> {posts.reduce((s, p) => s + (p.upvotes || 0), 0)} upvotes</span>
        <span className="flex items-center gap-1"><School size={12} /> {new Set(posts.map(p => p.schoolTag)).size} schools</span>
        <span className="flex items-center gap-1"><Users2 size={12} /> {new Set(posts.filter(p => p.postType === 'study_group').map(p => p.authorId)).size} study groups</span>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
            {feedTab === 'saved' ? <Bookmark size={28} className="text-blue-500" /> : <MessageCircle size={28} className="text-blue-500" />}
          </div>
          <p className="font-semibold text-gray-800 dark:text-white">
            {feedTab === 'saved' ? 'No bookmarks yet' : search || schoolFilter !== 'all' || typeFilter !== 'all' ? 'No matching posts' : 'No posts yet'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {feedTab === 'saved' ? 'Bookmark posts to save them here.' : search || schoolFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your filters.' : 'Be the first to post!'}
          </p>
          {(!search && schoolFilter === 'all' && typeFilter === 'all' && feedTab !== 'saved') && (
            <button onClick={() => setShowNewPost(true)} className="btn-primary mx-auto mt-4 text-sm">
              <Plus size={14} /> New Post
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(post => (
            <PostCard
              key={post.postId}
              post={post}
              onClick={() => setSelectedPost(post)}
              onUpvote={(e) => { e.stopPropagation(); handleUpvotePost(post); }}
              onToggleSave={(e) => { e.stopPropagation(); toggleSave(post.postId); }}
              isSaved={savedIds.has(post.postId)}
            />
          ))}
        </div>
      )}

      <NewPostModal isOpen={showNewPost} onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} />
      <StudyPartnerModal isOpen={showPartners} onClose={() => setShowPartners(false)} />
    </div>
  );
}