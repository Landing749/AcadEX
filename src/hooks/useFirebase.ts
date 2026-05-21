import { useState, useEffect, useCallback } from 'react';
import { ref, set, remove, onValue, push, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  getCachedSubjects, cacheSubject, cacheSubjects, deleteCachedSubject,
  getCachedAssignments, cacheAssignment, cacheAssignments, deleteCachedAssignment,
  queueOfflineAction,
} from '../lib/indexeddb';
import { Subject, Assignment } from '../types';
import { generateId } from '../utils/helpers';

// ---- SUBJECTS ----

export function useSubjects() {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setSubjects([]); setLoading(false); return; }

    // Load cached first
    getCachedSubjects(currentUser.uid).then(cached => {
      if (cached.length > 0) {
        setSubjects(cached);
        setLoading(false);
      }
    });

    if (!navigator.onLine) { setLoading(false); return; }

    const subjectsRef = ref(db, `subjects/${currentUser.uid}`);
    const unsubscribe = onValue(subjectsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Subject[] = data
        ? Object.values(data) as Subject[]
        : [];
      setSubjects(list);
      cacheSubjects(list);
      setLoading(false);
    }, (error) => {
      console.error('Firebase subjects error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addSubject = useCallback(async (data: Omit<Subject, 'subjectId' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    const subject: Subject = {
      ...data,
      subjectId: generateId(),
      userId: currentUser.uid,
      createdAt: Date.now(),
    };
    await cacheSubject(subject);
    setSubjects(prev => [...prev, subject]);

    if (navigator.onLine) {
      await set(ref(db, `subjects/${currentUser.uid}/${subject.subjectId}`), subject);
    } else {
      await queueOfflineAction({
        id: generateId(),
        type: 'create',
        collection: 'subjects',
        data: subject,
        timestamp: Date.now(),
      });
    }
    return subject;
  }, [currentUser]);

  const updateSubject = useCallback(async (subjectId: string, data: Partial<Subject>) => {
    if (!currentUser) return;
    const updated = subjects.find(s => s.subjectId === subjectId);
    if (!updated) return;
    const newSubject = { ...updated, ...data };
    await cacheSubject(newSubject);
    setSubjects(prev => prev.map(s => s.subjectId === subjectId ? newSubject : s));

    if (navigator.onLine) {
      await set(ref(db, `subjects/${currentUser.uid}/${subjectId}`), newSubject);
    } else {
      await queueOfflineAction({
        id: generateId(),
        type: 'update',
        collection: 'subjects',
        data: newSubject,
        timestamp: Date.now(),
      });
    }
  }, [currentUser, subjects]);

  const deleteSubject = useCallback(async (subjectId: string) => {
    if (!currentUser) return;
    await deleteCachedSubject(subjectId);
    setSubjects(prev => prev.filter(s => s.subjectId !== subjectId));

    if (navigator.onLine) {
      await remove(ref(db, `subjects/${currentUser.uid}/${subjectId}`));
    } else {
      await queueOfflineAction({
        id: generateId(),
        type: 'delete',
        collection: 'subjects',
        data: { subjectId },
        timestamp: Date.now(),
      });
    }
  }, [currentUser]);

  return { subjects, loading, addSubject, updateSubject, deleteSubject };
}

// ---- ASSIGNMENTS ----

export function useAssignments() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setAssignments([]); setLoading(false); return; }

    getCachedAssignments(currentUser.uid).then(cached => {
      if (cached.length > 0) {
        setAssignments(cached);
        setLoading(false);
      }
    });

    if (!navigator.onLine) { setLoading(false); return; }

    const assignmentsRef = ref(db, `assignments/${currentUser.uid}`);
    const unsubscribe = onValue(assignmentsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Assignment[] = data ? Object.values(data) as Assignment[] : [];
      // Auto-mark overdue
      const now = Date.now();
      const processed = list.map(a => {
        if (a.status === 'pending' || a.status === 'in-progress') {
          const due = new Date(`${a.dueDate}T${a.dueTime || '23:59'}`).getTime();
          if (due < now) return { ...a, status: 'overdue' as const };
        }
        return a;
      });
      setAssignments(processed);
      cacheAssignments(processed);
      setLoading(false);
    }, (err) => {
      console.error('Firebase assignments error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addAssignment = useCallback(async (data: Omit<Assignment, 'assignmentId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    const assignment: Assignment = {
      ...data,
      assignmentId: generateId(),
      userId: currentUser.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await cacheAssignment(assignment);
    setAssignments(prev => [...prev, assignment]);

    if (navigator.onLine) {
      await set(ref(db, `assignments/${currentUser.uid}/${assignment.assignmentId}`), assignment);
    } else {
      await queueOfflineAction({
        id: generateId(),
        type: 'create',
        collection: 'assignments',
        data: assignment,
        timestamp: Date.now(),
      });
    }
    return assignment;
  }, [currentUser]);

  const updateAssignment = useCallback(async (assignmentId: string, data: Partial<Assignment>) => {
    if (!currentUser) return;
    const existing = assignments.find(a => a.assignmentId === assignmentId);
    if (!existing) return;
    const updated = { ...existing, ...data, updatedAt: Date.now() };
    await cacheAssignment(updated);
    setAssignments(prev => prev.map(a => a.assignmentId === assignmentId ? updated : a));

    if (navigator.onLine) {
      await set(ref(db, `assignments/${currentUser.uid}/${assignmentId}`), updated);
    } else {
      await queueOfflineAction({
        id: generateId(),
        type: 'update',
        collection: 'assignments',
        data: updated,
        timestamp: Date.now(),
      });
    }
  }, [currentUser, assignments]);

  const deleteAssignment = useCallback(async (assignmentId: string) => {
    if (!currentUser) return;
    await deleteCachedAssignment(assignmentId);
    setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));

    if (navigator.onLine) {
      await remove(ref(db, `assignments/${currentUser.uid}/${assignmentId}`));
    } else {
      await queueOfflineAction({
        id: generateId(),
        type: 'delete',
        collection: 'assignments',
        data: { assignmentId },
        timestamp: Date.now(),
      });
    }
  }, [currentUser]);

  return { assignments, loading, addAssignment, updateAssignment, deleteAssignment };
}

// ---- PRESETS ----

import { GradePreset, HelpPost, HelpReply, UserProfile } from '../types';

export function usePresets() {
  const { currentUser } = useAuth();
  const [presets, setPresets] = useState<GradePreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setPresets([]); setLoading(false); return; }
    if (!navigator.onLine) { setLoading(false); return; }

    const presetsRef = ref(db, `presets/${currentUser.uid}`);
    const unsubscribe = onValue(presetsRef, (snapshot) => {
      const data = snapshot.val();
      const list: GradePreset[] = data ? Object.values(data) as GradePreset[] : [];
      setPresets(list.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [currentUser]);

  const addPreset = useCallback(async (data: Omit<GradePreset, 'presetId' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    const preset: GradePreset = {
      ...data,
      presetId: generateId(),
      userId: currentUser.uid,
      createdAt: Date.now(),
    };
    setPresets(prev => [preset, ...prev]);
    if (navigator.onLine) {
      await set(ref(db, `presets/${currentUser.uid}/${preset.presetId}`), preset);
    }
    return preset;
  }, [currentUser]);

  const deletePreset = useCallback(async (presetId: string) => {
    if (!currentUser) return;
    setPresets(prev => prev.filter(p => p.presetId !== presetId));
    if (navigator.onLine) {
      await remove(ref(db, `presets/${currentUser.uid}/${presetId}`));
    }
  }, [currentUser]);

  return { presets, loading, addPreset, deletePreset };
}

// ---- COMMUNITY ----

export function useCommunity() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<HelpPost[]>([]);
  const [replies, setReplies] = useState<HelpReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.onLine) { setLoading(false); return; }

    // All posts are shared globally
    const postsRef = ref(db, 'community/posts');
    const unsubPosts = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      const list: HelpPost[] = data ? Object.values(data) as HelpPost[] : [];
      setPosts(list.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }, () => setLoading(false));

    const repliesRef = ref(db, 'community/replies');
    const unsubReplies = onValue(repliesRef, (snapshot) => {
      const data = snapshot.val();
      const list: HelpReply[] = data ? Object.values(data) as HelpReply[] : [];
      setReplies(list);
    });

    return () => { unsubPosts(); unsubReplies(); };
  }, []);

  const addPost = useCallback(async (data: Omit<HelpPost, 'postId' | 'createdAt' | 'replyCount' | 'upvotes' | 'upvotedBy'>) => {
    const post: HelpPost = {
      ...data,
      postId: generateId(),
      createdAt: Date.now(),
      replyCount: 0,
      upvotes: 0,
      upvotedBy: [],
    };
    setPosts(prev => [post, ...prev]);
    if (navigator.onLine) {
      await set(ref(db, `community/posts/${post.postId}`), post);
    }
    return post;
  }, []);

  const addReply = useCallback(async (data: Omit<HelpReply, 'replyId' | 'createdAt' | 'upvotes' | 'upvotedBy'>) => {
    const reply: HelpReply = {
      ...data,
      replyId: generateId(),
      createdAt: Date.now(),
      upvotes: 0,
      upvotedBy: [],
    };
    setReplies(prev => [...prev, reply]);
    if (navigator.onLine) {
      await set(ref(db, `community/replies/${reply.replyId}`), reply);
      // Increment reply count on post
      const postRef = ref(db, `community/posts/${data.postId}`);
      onValue(postRef, (snap) => {
        const post = snap.val();
        if (post) {
          set(postRef, { ...post, replyCount: (post.replyCount || 0) + 1 });
        }
      }, { onlyOnce: true });
    }
    return reply;
  }, []);

  const upvotePost = useCallback(async (postId: string, userId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.postId !== postId) return p;
      const alreadyUpvoted = p.upvotedBy?.includes(userId);
      const upvotedBy = alreadyUpvoted
        ? p.upvotedBy.filter(id => id !== userId)
        : [...(p.upvotedBy || []), userId];
      return { ...p, upvotes: upvotedBy.length, upvotedBy };
    }));
    if (navigator.onLine) {
      const postRef = ref(db, `community/posts/${postId}`);
      onValue(postRef, (snap) => {
        const post = snap.val();
        if (post) {
          const alreadyUpvoted = (post.upvotedBy || []).includes(userId);
          const upvotedBy = alreadyUpvoted
            ? post.upvotedBy.filter((id: string) => id !== userId)
            : [...(post.upvotedBy || []), userId];
          set(postRef, { ...post, upvotes: upvotedBy.length, upvotedBy });
        }
      }, { onlyOnce: true });
    }
  }, []);

  const upvoteReply = useCallback(async (replyId: string, userId: string) => {
    setReplies(prev => prev.map(r => {
      if (r.replyId !== replyId) return r;
      const alreadyUpvoted = r.upvotedBy?.includes(userId);
      const upvotedBy = alreadyUpvoted
        ? r.upvotedBy.filter(id => id !== userId)
        : [...(r.upvotedBy || []), userId];
      return { ...r, upvotes: upvotedBy.length, upvotedBy };
    }));
    if (navigator.onLine) {
      const rRef = ref(db, `community/replies/${replyId}`);
      onValue(rRef, (snap) => {
        const reply = snap.val();
        if (reply) {
          const alreadyUpvoted = (reply.upvotedBy || []).includes(userId);
          const upvotedBy = alreadyUpvoted
            ? reply.upvotedBy.filter((id: string) => id !== userId)
            : [...(reply.upvotedBy || []), userId];
          set(rRef, { ...reply, upvotes: upvotedBy.length, upvotedBy });
        }
      }, { onlyOnce: true });
    }
  }, []);

  const markReplyResolved = useCallback(async (replyId: string) => {
    setReplies(prev => prev.map(r => r.replyId === replyId ? { ...r, isResolved: true } : r));
    if (navigator.onLine) {
      const rRef = ref(db, `community/replies/${replyId}`);
      onValue(rRef, (snap) => {
        const reply = snap.val();
        if (reply) set(rRef, { ...reply, isResolved: true });
      }, { onlyOnce: true });
    }
  }, []);

  return { posts, replies, loading, addPost, addReply, upvotePost, upvoteReply, markReplyResolved };
}

// ---- USER PROFILE ----

export function useProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setProfile(null); setLoading(false); return; }
    if (!navigator.onLine) { setLoading(false); return; }

    const profileRef = ref(db, `profiles/${currentUser.uid}`);
    const unsub = onValue(profileRef, (snap) => {
      setProfile(snap.val() || null);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [currentUser]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const now = Date.now();
    const existing = profile || {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Student',
      bio: '',
      school: '',
      course: '',
      yearLevel: '',
      bannerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      avatarBg: '#6366f1',
      isPublic: true,
      shareId: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = { ...existing, ...data, updatedAt: now };
    setProfile(updated as UserProfile);
    if (navigator.onLine) {
      await set(ref(db, `profiles/${currentUser.uid}`), updated);
      // Also store public profile under shareId for sharing
      if (updated.isPublic && updated.shareId) {
        await set(ref(db, `public_profiles/${updated.shareId}`), updated);
      } else if (!updated.isPublic && updated.shareId) {
        await remove(ref(db, `public_profiles/${updated.shareId}`));
      }
    }
  }, [currentUser, profile]);

  return { profile, loading, updateProfile };
}

