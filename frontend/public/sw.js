// Restro OS — Service Worker (offline + cache)
const CACHE_NAME = 'restro-os-v1';
const OFFLINE_URL = '/offline.html';

// Install: cache shell + offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL, '/']).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: take control and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fallback Response when cache miss (must always return a Response)
const offlineResponse = () =>
  new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:2rem;background:#0f172a;color:#fff"><h1>You\'re offline</h1><p>Restro OS will work again when you\'re back online.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );

// Fetch: only handle same-origin document/navigation; never intercept API (other origins)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Skip non-GET or cross-origin (e.g. API at localhost:5000) — browser handles them normally
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode !== 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .then((res) => res || new Response('', { status: 404, statusText: 'Not Found' }))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached || caches.match(OFFLINE_URL).then((offline) => offline || offlineResponse())
        )
      )
  );
});
