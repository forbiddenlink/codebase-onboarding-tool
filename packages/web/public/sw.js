/**
 * Service Worker for CodeCompass
 *
 * Provides offline functionality by caching:
 * - Static assets (HTML, CSS, JS, fonts)
 * - API responses (with stale-while-revalidate strategy)
 * - Previously viewed pages and data
 *
 * Strategy:
 * - Cache-first for static assets
 * - Network-first with cache fallback for API calls
 * - Runtime caching for dynamic content
 */

const CACHE_NAME = 'codecompass-v1';
const STATIC_CACHE = 'codecompass-static-v1';
const API_CACHE = 'codecompass-api-v1';
const RUNTIME_CACHE = 'codecompass-runtime-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/search',
  '/viewer',
  '/learning-path',
  '/settings',
  '/chat',
  '/notifications',
  '/offline.html', // Fallback page for offline
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch((error) => {
      console.error('[Service Worker] Failed to cache static assets:', error);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // HTML pages - Network first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // Default - try cache first, then network
  event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
});

/**
 * Cache-first strategy
 * Try cache first, fall back to network, cache new responses
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[Service Worker] Cache hit:', request.url);
      return cached;
    }

    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Cache-first strategy failed:', error);
    return new Response('Offline - Unable to fetch resource', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache if offline
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);

    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[Service Worker] Serving from cache (offline):', request.url);
      return cached;
    }

    // If HTML page and not cached, show offline page
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }

    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. This content is not available in cache.',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.ico'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || pathname.startsWith('/_next/static/');
}

/**
 * Background sync for offline actions (future enhancement)
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

/**
 * Sync actions that were queued while offline
 */
async function syncOfflineActions() {
  // Future: Implement sync logic for offline actions
  // (e.g., notes saved while offline, bookmarks, etc.)
  console.log('[Service Worker] Syncing offline actions...');
  return Promise.resolve();
}

/**
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[Service Worker] Script loaded');
