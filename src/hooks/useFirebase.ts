import { useState, useEffect, useCallback } from 'react';
import { ref, set, remove, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  getCachedSubjects, cacheSubject, cacheSubjects, deleteCachedSubject,
  getCachedAssignments, cacheAssignment, cacheAssignments, deleteCachedAssignment,
  queueOfflineAction,
} from '../lib/indexeddb';
import { Subject, Assignment, GradePreset, HelpPost, HelpReply, UserProfile } from '../types';
import { generateId } from '../utils/helpers';

/** Remove undefined values recursively — Firebase RTDB rejects them */
function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---- SUBJECTS ----

export function useSubjects() {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setSubjects([]); setLoading(false); return; }

    getCachedSubjects(currentUser.uid).then(cached => {
      if (cached.length > 0) { setSubjects(cached); setLoading(false); }
    });

    if (!navigator.onLine) { setLoading(false); return; }

    const subjectsRef = ref(db, `subjects/${currentUser.uid}`);
    const unsubscribe = onValue(subjectsRef, (snapshot) => {
      const data = snapshot.val();
      const list: Subject[] = data ? Object.values(data) as Subject[] : [];
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
      await queueOfflineAction({ id: generateId(), type: 'create', collection: 'subjects', data: subject, timestamp: Date.now() });
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
      await queueOfflineAction({ id: generateId(), type: 'update', collection: 'subjects', data: newSubject, timestamp: Date.now() });
    }
  }, [currentUser, subjects]);

  const deleteSubject = useCallback(async (subjectId: string) => {
    if (!currentUser) return;
    await deleteCachedSubject(subjectId);
    setSubjects(prev => prev.filter(s => s.subjectId !== subjectId));
    if (navigator.onLine) {
      await remove(ref(db, `subjects/${currentUser.uid}/${subjectId}`));
    } else {
      await queueOfflineAction({ id: generateId(), type: 'delete', collection: 'subjects', data: { subjectId }, timestamp: Date.now() });
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
      if (cached.length > 0) { setAssignments(cached); setLoading(false); }
    });

    if (!navigator.onLine) { setLoading(false); return; }

    const assignmentsRef = ref(db, `assignments/${currentUser.uid}`);
    const unsubscribe = onValue(assignmentsRef, async (snapshot) => {
      const data = snapshot.val();
      const list: Assignment[] = data ? Object.values(data) as Assignment[] : [];
      const now = Date.now();
      const processed = list.map(a => {
        if (a.status === 'pending' || a.status === 'in-progress') {
          const due = new Date(`${a.dueDate}T${a.dueTime || '23:59'}`).getTime();
          if (due < now) return { ...a, status: 'overdue' as const };
        }
        return a;
      });

      // Merge Firebase data with any locally-cached assignments that didn't sync yet.
      // This prevents assignments from disappearing on refresh when the Firebase write
      // was delayed or failed (e.g. brief network drop, security rule timing).
      const cached = await getCachedAssignments(currentUser.uid);
      const fbIds = new Set(processed.map(a => a.assignmentId));
      const localPending = cached.filter(a => !fbIds.has(a.assignmentId));

      // Re-queue any unsynced local assignments to Firebase so they eventually land.
      if (localPending.length > 0) {
        localPending.forEach(a => {
          set(ref(db, `assignments/${currentUser.uid}/${a.assignmentId}`), stripUndefined(a)).catch(console.error);
        });
      }

      const merged = [...processed, ...localPending];
      setAssignments(merged);
      cacheAssignments(merged);
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
      await set(ref(db, `assignments/${currentUser.uid}/${assignment.assignmentId}`), stripUndefined(assignment));
    } else {
      await queueOfflineAction({ id: generateId(), type: 'create', collection: 'assignments', data: stripUndefined(assignment), timestamp: Date.now() });
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
      await set(ref(db, `assignments/${currentUser.uid}/${assignmentId}`), stripUndefined(updated));
    } else {
      await queueOfflineAction({ id: generateId(), type: 'update', collection: 'assignments', data: stripUndefined(updated), timestamp: Date.now() });
    }
  }, [currentUser, assignments]);

  const deleteAssignment = useCallback(async (assignmentId: string) => {
    if (!currentUser) return;
    await deleteCachedAssignment(assignmentId);
    setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));
    if (navigator.onLine) {
      await remove(ref(db, `assignments/${currentUser.uid}/${assignmentId}`));
    } else {
      await queueOfflineAction({ id: generateId(), type: 'delete', collection: 'assignments', data: { assignmentId }, timestamp: Date.now() });
    }
  }, [currentUser]);

  return { assignments, loading, addAssignment, updateAssignment, deleteAssignment };
}

// ---- PRESETS ----

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
    const preset: GradePreset = { ...data, presetId: generateId(), userId: currentUser.uid, createdAt: Date.now() };
    setPresets(prev => [preset, ...prev]);
    if (navigator.onLine) await set(ref(db, `presets/${currentUser.uid}/${preset.presetId}`), preset);
    return preset;
  }, [currentUser]);

  const deletePreset = useCallback(async (presetId: string) => {
    if (!currentUser) return;
    setPresets(prev => prev.filter(p => p.presetId !== presetId));
    if (navigator.onLine) await remove(ref(db, `presets/${currentUser.uid}/${presetId}`));
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
    const post: HelpPost = { ...data, postId: generateId(), createdAt: Date.now(), replyCount: 0, upvotes: 0, upvotedBy: [] };
    setPosts(prev => [post, ...prev]);
    if (navigator.onLine) await set(ref(db, `community/posts/${post.postId}`), post);
    return post;
  }, []);

  const addReply = useCallback(async (data: Omit<HelpReply, 'replyId' | 'createdAt' | 'upvotes' | 'upvotedBy'>) => {
    const reply: HelpReply = { ...data, replyId: generateId(), createdAt: Date.now(), upvotes: 0, upvotedBy: [] };
    setReplies(prev => [...prev, reply]);
    if (navigator.onLine) {
      await set(ref(db, `community/replies/${reply.replyId}`), reply);
      onValue(ref(db, `community/posts/${data.postId}`), (snap) => {
        const post = snap.val();
        if (post) set(ref(db, `community/posts/${data.postId}`), { ...post, replyCount: (post.replyCount || 0) + 1 });
      }, { onlyOnce: true });
    }
    return reply;
  }, []);

  const upvotePost = useCallback(async (postId: string, userId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.postId !== postId) return p;
      const alreadyUpvoted = p.upvotedBy?.includes(userId);
      const upvotedBy = alreadyUpvoted ? p.upvotedBy.filter(id => id !== userId) : [...(p.upvotedBy || []), userId];
      return { ...p, upvotes: upvotedBy.length, upvotedBy };
    }));
    if (navigator.onLine) {
      onValue(ref(db, `community/posts/${postId}`), (snap) => {
        const post = snap.val();
        if (post) {
          const alreadyUpvoted = (post.upvotedBy || []).includes(userId);
          const upvotedBy = alreadyUpvoted ? post.upvotedBy.filter((id: string) => id !== userId) : [...(post.upvotedBy || []), userId];
          set(ref(db, `community/posts/${postId}`), { ...post, upvotes: upvotedBy.length, upvotedBy });
        }
      }, { onlyOnce: true });
    }
  }, []);

  const upvoteReply = useCallback(async (replyId: string, userId: string) => {
    setReplies(prev => prev.map(r => {
      if (r.replyId !== replyId) return r;
      const alreadyUpvoted = r.upvotedBy?.includes(userId);
      const upvotedBy = alreadyUpvoted ? r.upvotedBy.filter(id => id !== userId) : [...(r.upvotedBy || []), userId];
      return { ...r, upvotes: upvotedBy.length, upvotedBy };
    }));
    if (navigator.onLine) {
      onValue(ref(db, `community/replies/${replyId}`), (snap) => {
        const reply = snap.val();
        if (reply) {
          const alreadyUpvoted = (reply.upvotedBy || []).includes(userId);
          const upvotedBy = alreadyUpvoted ? reply.upvotedBy.filter((id: string) => id !== userId) : [...(reply.upvotedBy || []), userId];
          set(ref(db, `community/replies/${replyId}`), { ...reply, upvotes: upvotedBy.length, upvotedBy });
        }
      }, { onlyOnce: true });
    }
  }, []);

  const markReplyResolved = useCallback(async (replyId: string) => {
    setReplies(prev => prev.map(r => r.replyId === replyId ? { ...r, isResolved: true } : r));
    if (navigator.onLine) {
      onValue(ref(db, `community/replies/${replyId}`), (snap) => {
        const reply = snap.val();
        if (reply) set(ref(db, `community/replies/${replyId}`), { ...reply, isResolved: true });
      }, { onlyOnce: true });
    }
  }, []);

  return { posts, replies, loading, addPost, addReply, upvotePost, upvoteReply, markReplyResolved };
}

// ---- USER PROFILE ----

const profileCacheKey = (uid: string) => `acadex_profile_${uid}`;

export function useProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setProfile(null); setLoading(false); return; }

    // Load from localStorage cache first so it shows instantly on refresh
    try {
      const cached = localStorage.getItem(profileCacheKey(currentUser.uid));
      if (cached) {
        setProfile(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}

    if (!navigator.onLine) { setLoading(false); return; }

    const profileRef = ref(db, `profiles/${currentUser.uid}`);
    const unsub = onValue(profileRef, (snap) => {
      const data = snap.val();
      if (data) {
        setProfile(data);
        try { localStorage.setItem(profileCacheKey(currentUser.uid), JSON.stringify(data)); } catch {}
      }
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [currentUser]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const now = Date.now();

    // Use functional updater to avoid stale closure — always works off latest state
    setProfile(prev => {
      const existing: UserProfile = prev ?? {
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
      const updated: UserProfile = { ...existing, ...data, updatedAt: now };

      // Persist to localStorage immediately
      try { localStorage.setItem(profileCacheKey(currentUser.uid), JSON.stringify(updated)); } catch {}

      // Persist to Firebase
      if (navigator.onLine) {
        set(ref(db, `profiles/${currentUser.uid}`), updated);
        if (updated.isPublic && updated.shareId) {
          set(ref(db, `public_profiles/${updated.shareId}`), updated);
        } else if (!updated.isPublic && updated.shareId) {
          remove(ref(db, `public_profiles/${updated.shareId}`));
        }
      }

      return updated;
    });
  }, [currentUser]);

  return { profile, loading, updateProfile };
}

// ---- PUBLIC PROFILE (for shared links) ----

export function usePublicProfile(shareId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareId) { setLoading(false); setNotFound(true); return; }
    if (!navigator.onLine) { setLoading(false); setNotFound(true); return; }

    const profileRef = ref(db, `public_profiles/${shareId}`);
    const unsub = onValue(profileRef, (snap) => {
      const data = snap.val();
      if (data && data.isPublic) {
        setProfile(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, () => { setLoading(false); setNotFound(true); });

    return () => unsub();
  }, [shareId]);

  return { profile, loading, notFound };
}