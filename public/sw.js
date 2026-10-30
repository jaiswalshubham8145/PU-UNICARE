const CACHE_VERSION = 'pu-unicare-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install Event: cache core app shell resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Use resilient allSettled to ensure service worker installs even if an asset fails
      await Promise.allSettled(
        CRITICAL_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            // Non-blocking asset fetch failure
            console.warn('[SW] Pre-cache skipped for:', url, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Event: purge stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('pu-unicare') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip external APIs, Supabase real-time/auth/rest, and AI endpoints
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('generativelanguage.googleapis.com') ||
    url.hostname.includes('fast2sms.com') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return;
  }

  // 1. Navigation requests (HTML): Network first, falling back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return cached || new Response('Offline - PU UNICARE', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 2. Static Google Fonts & Fontshare: Cache first with network fallback
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('fontshare.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkRes) => {
          if (networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 3. Local Same-Origin Assets (Vite chunks, JS, CSS, images)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Serve cached and refresh dynamically in background
          fetch(request).then((networkRes) => {
            if (networkRes && networkRes.ok) {
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, networkRes));
            }
          }).catch(() => {});
          return cached;
        }

        return fetch(request)
          .then((networkRes) => {
            if (networkRes.ok) {
              const clone = networkRes.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkRes;
          })
          .catch(() => {
            // Return placeholder or offline fallback if needed
            return new Response('Asset not available offline', { status: 404 });
          });
      })
    );
  }
});

// Message listener (for SKIP_WAITING updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'PU UNICARE Alert', {
        body: data.body || 'New campus maintenance update.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: data.url || '/'
      })
    );
  } catch {
    // Non-JSON push notification fallback
    event.waitUntil(
      self.registration.showNotification('PU UNICARE', {
        body: event.data.text(),
        icon: '/icon-192.png'
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
