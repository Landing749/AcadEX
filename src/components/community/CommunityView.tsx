import React, { useState, useEffect } from 'react';
import {
  MessageCircle, ThumbsUp, Plus, Send, School, Tag,
  ChevronDown, ChevronUp, Clock, Search, CheckCircle2,
  AlertCircle, ArrowLeft,
} from 'lucide-react';
import { useCommunity } from '../../hooks/useFirebase';
import { useAuth } from '../../contexts/AuthContext';
import { HelpPost, HelpReply, PHILIPPINE_SCHOOLS } from '../../types';
import { Modal } from '../ui/Modal';
import { cn, formatRelativeTime, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ---- New Post Modal ----
function NewPostModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; body: string; schoolTag: string; subjectTag: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [schoolTag, setSchoolTag] = useState('');
  const [subjectTag, setSubjectTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !schoolTag) return;
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), body: body.trim(), schoolTag, subjectTag: subjectTag.trim() });
      toast.success('Post shared with the community!');
      setTitle(''); setBody(''); setSchoolTag(''); setSubjectTag('');
      onClose();
    } catch {
      toast.error('Failed to post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask for Help" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Your Question *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            placeholder="e.g. How do I solve this integral? Can someone explain photosynthesis?"
            required
          />
        </div>
        <div>
          <label className="label">Details / Context *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="input resize-none"
            rows={4}
            placeholder="Explain your question in more detail. Share what you've tried so far..."
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">School Tag *</label>
            <select
              value={schoolTag}
              onChange={e => setSchoolTag(e.target.value)}
              className="input"
              required
            >
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
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading || !title.trim() || !body.trim() || !schoolTag} className="btn-primary flex-1 justify-center">
            {loading ? 'Posting...' : <><Send size={14} /> Post Question</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---- Post Detail View ----
function PostDetail({
  post,
  replies,
  onBack,
  onUpvotePost,
  onAddReply,
  onUpvoteReply,
  onMarkResolved,
}: {
  post: HelpPost;
  replies: HelpReply[];
  onBack: () => void;
  onUpvotePost: (post: HelpPost) => void;
  onAddReply: (postId: string, body: string) => Promise<void>;
  onUpvoteReply: (reply: HelpReply) => void;
  onMarkResolved: (replyId: string) => void;
}) {
  const { currentUser } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const hasUpvotedPost = currentUser ? post.upvotedBy?.includes(currentUser.uid) : false;

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
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Feed
      </button>

      {/* Post */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(post.authorName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{post.authorName}</p>
              <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {post.subjectTag && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                {post.subjectTag}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <School size={10} /> {post.schoolTag.length > 25 ? post.schoolTag.slice(0, 22) + '...' : post.schoolTag}
            </span>
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-3">{post.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">{post.body}</p>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={() => onUpvotePost(post)}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors',
              hasUpvotedPost ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400 hover:text-indigo-500'
            )}
          >
            <ThumbsUp size={14} /> {post.upvotes || 0}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <MessageCircle size={14} /> {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
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
                    className={cn(
                      'flex items-center gap-1 text-xs transition-colors',
                      hasUpvoted ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400 hover:text-indigo-500'
                    )}
                  >
                    <ThumbsUp size={12} /> {reply.upvotes || 0} helpful
                  </button>
                  {isOwn && !reply.isResolved && (
                    <button
                      onClick={() => onMarkResolved(reply.replyId)}
                      className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={12} /> Mark as helpful
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Box */}
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
    </div>
  );
}

// ---- Post Card (Feed) ----
function PostCard({
  post,
  onClick,
  onUpvote,
}: {
  post: HelpPost;
  onClick: () => void;
  onUpvote: (e: React.MouseEvent) => void;
}) {
  const { currentUser } = useAuth();
  const hasUpvoted = currentUser ? post.upvotedBy?.includes(currentUser.uid) : false;

  return (
    <button
      onClick={onClick}
      className="card p-4 text-left w-full hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(post.authorName)}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{post.authorName}</p>
            <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {post.subjectTag && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
              {post.subjectTag}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white mt-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
        {post.title}
      </h3>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.body}</p>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
        <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
          <School size={11} /> {post.schoolTag.length > 30 ? post.schoolTag.slice(0, 27) + '...' : post.schoolTag}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onUpvote}
            className={cn(
              'flex items-center gap-1 text-xs transition-colors',
              hasUpvoted ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400 hover:text-indigo-500'
            )}
          >
            <ThumbsUp size={11} /> {post.upvotes || 0}
          </button>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <MessageCircle size={11} /> {post.replyCount || 0}
          </span>
        </div>
      </div>
    </button>
  );
}

// ---- Main Community View ----
export function CommunityView() {
  const { currentUser } = useAuth();
  const { posts, replies, loading, addPost, addReply, upvotePost, upvoteReply, markReplyResolved } = useCommunity();
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<HelpPost | null>(null);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');

  const filtered = posts
    .filter(p => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase());
      const matchSchool = schoolFilter === 'all' || p.schoolTag === schoolFilter;
      return matchSearch && matchSchool;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

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
      postId,
      body,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
    });
    // Update selected post reply count
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
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Help</h1>
          <p className="text-sm text-gray-500">Ask questions, help classmates across PH schools</p>
        </div>
        <button onClick={() => setShowNewPost(true)} className="btn-primary shrink-0 text-sm">
          <Plus size={14} /> Ask
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-8 py-2 text-sm"
            placeholder="Search questions..."
          />
        </div>
        <select
          value={schoolFilter}
          onChange={e => setSchoolFilter(e.target.value)}
          className="input py-2 text-sm max-w-[160px]"
        >
          <option value="all">All Schools</option>
          {PHILIPPINE_SCHOOLS.map(s => <option key={s} value={s}>{s.length > 25 ? s.slice(0, 23) + '...' : s}</option>)}
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MessageCircle size={12} /> {posts.length} questions</span>
        <span className="flex items-center gap-1"><ThumbsUp size={12} /> {posts.reduce((s, p) => s + (p.upvotes || 0), 0)} upvotes</span>
        <span className="flex items-center gap-1"><School size={12} /> {new Set(posts.map(p => p.schoolTag)).size} schools</span>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={28} className="text-blue-500" />
          </div>
          <p className="font-semibold text-gray-800 dark:text-white">
            {search || schoolFilter !== 'all' ? 'No matching questions' : 'No questions yet'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {search || schoolFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Be the first to ask something!'}
          </p>
          {(!search && schoolFilter === 'all') && (
            <button onClick={() => setShowNewPost(true)} className="btn-primary mx-auto mt-4 text-sm">
              <Plus size={14} /> Ask a Question
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
            />
          ))}
        </div>
      )}

      <NewPostModal
        isOpen={showNewPost}
        onClose={() => setShowNewPost(false)}
        onSubmit={handleNewPost}
      />
    </div>
  );
}
