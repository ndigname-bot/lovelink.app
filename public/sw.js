const CACHE_NAME = 'lovelink-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for HTML documents (like /gift/[id])
  if (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        // If network fails (e.g., timeout/offline), return the offline page instead of browser crash
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
