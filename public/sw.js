const CACHE_NAME = 'acadex-v1';
const STATIC_CACHE = 'acadex-static-v1';
const DYNAMIC_CACHE = 'acadex-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: return a guaranteed Response even when cache returns undefined
async function cacheMatchOrFallback(request, fallbackBody = '', fallbackStatus = 503) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return new Response(fallbackBody, {
    status: fallbackStatus,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// Fetch - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests - let them pass through unmodified
  if (request.method !== 'GET') return;

  // Skip external APIs: Firebase, Cloudinary, Google APIs
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('cloudinary') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('firestore')
  ) {
    return;
  }

  // For HTML navigation (SPA routes like /presets, /reports, etc.)
  // Network first; if network fails or cache misses, serve index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Try cached version of this exact URL first
          const exactMatch = await caches.match(request);
          if (exactMatch) return exactMatch;
          // Fall back to index.html so the SPA can handle the route client-side
          const indexMatch = await caches.match('/index.html');
          if (indexMatch) return indexMatch;
          // Last resort: minimal offline page
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
            '<body style="font-family:sans-serif;text-align:center;padding:40px">' +
            '<h2>You\'re offline</h2><p>Please check your connection and try again.</p>' +
            '<button onclick="location.reload()">Retry</button></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // For static assets (scripts, styles, images, fonts) - cache first, then network
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then(async cached => {
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        } catch {
          // Asset not available offline - return empty 503 so the browser handles it gracefully
          return new Response('', { status: 503, statusText: 'Service Unavailable' });
        }
      })
    );
    return;
  }

  // Default: network first with cache fallback
  // CRITICAL FIX: always resolve to a valid Response, never undefined
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        // If nothing is cached return a proper 503 - never return undefined
        return cached || new Response('', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-acadex-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_REQUIRED' });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Acadex', {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  );
});