// ══════════════════════════════════════════════════
//  NST Executive Scheduler — Service Worker
//  Offline-first strategy: cache on install,
//  serve from cache, refresh in background.
// ══════════════════════════════════════════════════

const CACHE_NAME = 'nst-scheduler-v1';

// All assets to pre-cache on install
const PRECACHE_ASSETS = [
  './',
  './nst_pro_v9.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Google Fonts — cached on first use (see fetch handler)
];

// External origins we are willing to cache
const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// ── INSTALL: pre-cache core assets ──────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching core assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean up old caches ───────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first for app shell, network-first for everything else ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // App shell + local assets — cache first, fallback to network
  const isLocal = url.origin === self.location.origin;
  const isCacheableExternal = CACHEABLE_ORIGINS.some(o => request.url.startsWith(o));

  if (isLocal || isCacheableExternal) {
    event.respondWith(cacheFirst(request));
  }
  // All other requests — just fetch normally (no interference)
});

// ── Strategy: Cache First, then Network ─────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Refresh cache in background (stale-while-revalidate)
    refreshCache(request);
    return cached;
  }
  // Not in cache — fetch from network and store
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed and nothing in cache — return offline fallback
    return offlineFallback(request);
  }
}

// ── Background refresh ──────────────────────────────
function refreshCache(request) {
  fetch(request).then(response => {
    if (response && (response.ok || response.type === 'opaque')) {
      caches.open(CACHE_NAME).then(cache => cache.put(request, response));
    }
  }).catch(() => {/* silently ignore */});
}

// ── Offline fallback ────────────────────────────────
async function offlineFallback(request) {
  // For navigation requests, return the cached app shell
  if (request.mode === 'navigate') {
    const cached = await caches.match('./nst_pro_v9.html');
    if (cached) return cached;
  }
  // Generic fallback response
  return new Response(
    JSON.stringify({ error: 'offline', message: 'NST Scheduler is offline. Your data is safe in local storage.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

// ── Message handler (manual cache clear from app) ───
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0]?.postMessage({ cleared: true });
    });
  }
});
