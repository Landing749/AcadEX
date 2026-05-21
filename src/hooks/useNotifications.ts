import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { registerFCMToken, onForegroundMessage } from '../lib/notifications';

/**
 * useNotifications
 *
 * Drop this hook into AppContent (inside AuthProvider) to:
 *  1. Register the FCM token once the user logs in.
 *  2. Show a toast for foreground push messages while the app is open.
 *  3. Clean up the listener on logout.
 *
 * Background notifications (app closed / in background) are handled
 * automatically by public/firebase-messaging-sw.js.
 */
export function useNotifications() {
  const { currentUser } = useAuth();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!currentUser) {
      // Clean up listener when user logs out
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      return;
    }

    let cancelled = false;

    (async () => {
      // Register / refresh FCM token
      await registerFCMToken(currentUser.uid);

      if (cancelled) return;

      // Listen for foreground messages
      const unsub = await onForegroundMessage(({ title, body }) => {
        toast(
          <div>
            <p className="font-semibold text-sm">{title || 'Acadex'}</p>
            {body && <p className="text-xs text-gray-500 mt-0.5">{body}</p>}
          </div>,
          { icon: '🔔', duration: 5000 }
        );
      });

      if (cancelled) {
        unsub();
        return;
      }

      unsubscribeRef.current = unsub;
    })();

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [currentUser?.uid]);
}
