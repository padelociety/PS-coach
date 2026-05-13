// PS Coach Schedule Service Worker
// Strategy: NEVER cache index.html (always fresh), cache CDN deps for offline.
// Bump CACHE_VERSION whenever you change cached asset URLs or behavior.

const CACHE_VERSION = 'ps-coach-v3';
const NEVER_CACHE = ['index.html', '/', './'];

// CDN deps that rarely change — cache aggressively for offline use
const CDN_DEPS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
];

const LOCAL_ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
];

// Install: precache deps
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.allSettled([
        ...CDN_DEPS.map((url) => cache.add(new Request(url, { mode: 'no-cors' })).catch(() => {})),
        ...LOCAL_ASSETS.map((url) => cache.add(url).catch(() => {})),
      ])
    )
  );
  // Don't auto-skip; let the page send SKIP_WAITING via message
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING message from page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHtml =
    NEVER_CACHE.some((p) => url.pathname.endsWith(p)) ||
    req.mode === 'navigate' ||
    (req.destination === 'document');

  if (isHtml) {
    // Network-first for the app shell so updates land immediately when online
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Cache a copy as fallback for offline navigation
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for everything else (CDN deps, icons, fonts)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Only cache successful basic/cors responses; opaque is fine too for CDN
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
