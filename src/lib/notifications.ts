/**
 * notifications.ts
 * Handles Firebase Cloud Messaging token registration and foreground message listening.
 *
 * SETUP REQUIRED:
 * 1. In Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
 *    click "Generate key pair" and copy the VAPID key.
 * 2. Add it to your .env file:
 *    VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
 * 3. Deploy public/firebase-messaging-sw.js alongside your app.
 */

import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, serverTimestamp } from 'firebase/database';
import { db, getMessagingInstance } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/**
 * Requests notification permission, registers the FCM token,
 * and saves it to the user's RTDB node so your backend/Cloud Function
 * can send push messages to this device.
 *
 * Returns the token string on success, or null if unsupported / denied.
 */
export async function registerFCMToken(userId: string): Promise<string | null> {
  try {
    if (!('Notification' in window)) return null;

    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn('[FCM] Messaging not supported in this browser.');
      return null;
    }

    if (!VAPID_KEY) {
      console.warn('[FCM] VITE_FIREBASE_VAPID_KEY is not set. Push notifications will not work.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Notification permission denied.');
      return null;
    }

    // Register the SW if not already registered, then wait until it's active.
    // getRegistration() returns undefined if it hasn't installed yet, which
    // causes PushManager to throw "no active Service Worker".
    let swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    }
    // Wait for the SW to finish activating (handles installing → activated transition)
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      console.warn('[FCM] No registration token available.');
      return null;
    }

    // Persist the token in RTDB under the user's node.
    // Using the token as key makes it easy to store multiple devices
    // and to delete stale tokens later.
    await set(ref(db, `users/${userId}/fcmTokens/${encodeToken(token)}`), {
      token,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent.slice(0, 200),
    });

    console.info('[FCM] Token registered successfully.');
    return token;
  } catch (err) {
    // Don't surface registration errors to the user — notifications are non-critical.
    console.error('[FCM] Token registration failed:', err);
    return null;
  }
}

/**
 * Removes the FCM token from the user's RTDB node when they log out.
 * Call this inside your sign-out handler.
 */
export async function unregisterFCMToken(userId: string): Promise<void> {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging || !VAPID_KEY) return;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY }).catch(() => null);
    if (!token) return;

    await set(ref(db, `users/${userId}/fcmTokens/${encodeToken(token)}`), null);
  } catch (err) {
    console.error('[FCM] Token unregistration failed:', err);
  }
}

/**
 * Listens for FCM messages while the app is in the foreground.
 * Background messages are handled by firebase-messaging-sw.js.
 *
 * Returns an unsubscribe function — call it in your useEffect cleanup.
 */
export async function onForegroundMessage(
  callback: (payload: { title?: string; body?: string; url?: string }) => void
): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
      url: (payload.data?.url as string | undefined),
    });
  });

  return unsubscribe;
}

// Firebase tokens contain characters like : and - that are invalid as RTDB keys.
function encodeToken(token: string): string {
  return token.replace(/[.#$[\]]/g, '_');
}
