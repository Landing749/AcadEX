// =============================================================================
// firebase-messaging-sw.js
// Place this file at: public/firebase-messaging-sw.js
//
// This service worker is loaded by the Firebase Messaging SDK to handle
// BACKGROUND push notifications (when the app is closed or not in focus).
// Foreground messages are handled in src/lib/notifications.ts via onMessage().
// =============================================================================

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Must match the config in src/lib/firebase.ts
firebase.initializeApp({
  apiKey: "AIzaSyA7MctYf3RK7eAqZ9cXMW3sc0bn-yrIPFE",
  authDomain: "acadex-a0f5b.firebaseapp.com",
  projectId: "acadex-a0f5b",
  storageBucket: "acadex-a0f5b.firebasestorage.app",
  messagingSenderId: "55379558760",
  appId: "1:55379558760:web:702ca7ff3e40fcb92956dd",
  databaseURL: "https://acadex-a0f5b-default-rtdb.firebaseio.com",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const title = payload.notification?.title || 'Acadex';
  const body  = payload.notification?.body  || 'You have a new notification.';
  const url   = payload.data?.url || '/';

  self.registration.showNotification(title, {
    body,
    icon:    '/icons/icon-192x192.png',
    badge:   '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    tag:     'acadex-notification',       // replaces older notification of the same tag
    renotify: true,
    data: { url },
  });
});

// Open / focus the app when the notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // If the app is already open, focus it
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});
