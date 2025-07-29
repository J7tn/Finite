const CACHE_NAME = 'finite-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index-DmRrfCcy.css',
  '/assets/index-DNUQPJSL.js',
  '/assets/react-vendor-B-AEH8Cq.js',
  '/assets/capacitor-BfyQfm6Z.js',
  '/meditation-ambient-music-354473.mp3',
  '/clockMinuteTick.mp3',
  '/clockSecondsTicking.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // Return a fallback response for failed requests
            if (event.request.destination === 'image') {
              return new Response('', { status: 404 });
            }
            return new Response('Network error', { status: 503 });
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 