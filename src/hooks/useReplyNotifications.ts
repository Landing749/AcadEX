import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from './useFirebase';

/**
 * useReplyNotifications
 *
 * Watches the community replies list. When a new reply lands on a post
 * authored by the current user, it fires:
 *   • An in-app toast (always)
 *   • A browser Notification (if permission is already granted)
 *
 * Drop this hook inside AppContent alongside useGradeNotifications.
 */
export function useReplyNotifications() {
  const { currentUser } = useAuth();
  const { posts, replies } = useCommunity();
  const seenRepliesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || replies.length === 0 || posts.length === 0) return;

    // Build a set of postIds authored by the current user
    const myPostIds = new Set(
      posts.filter(p => p.authorId === currentUser.uid).map(p => p.postId)
    );

    // Find replies on my posts that we haven't surfaced yet
    const newReplies = replies.filter(
      r =>
        myPostIds.has(r.postId) &&
        r.authorId !== currentUser.uid && // not my own reply
        !seenRepliesRef.current.has(r.replyId)
    );

    // Mark ALL current replies as seen (so only truly new ones fire next time)
    replies.forEach(r => seenRepliesRef.current.add(r.replyId));

    if (newReplies.length === 0) return;

    for (const reply of newReplies) {
      const post = posts.find(p => p.postId === reply.postId);
      const title = `💬 New reply on your post`;
      const body = post
        ? `${reply.authorName} replied to "${post.title.slice(0, 50)}${post.title.length > 50 ? '…' : ''}"`
        : `${reply.authorName} replied to your question`;

      // In-app toast
      toast(
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{body}</p>
        </div>,
        {
          icon: '💬',
          duration: 6000,
          style: { borderLeft: '3px solid #6366f1' },
        }
      );

      // OS notification (only if already granted — don't prompt here)
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: `reply-${reply.replyId}`,
          });
        } catch {
          // Non-critical
        }
      }
    }
  }, [replies, posts, currentUser]);
}
