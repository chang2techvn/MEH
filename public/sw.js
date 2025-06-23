// Advanced Service Worker with Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log('Workbox is loaded! 🎉');
  
  // Force service worker to take control immediately
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Configure workbox
  workbox.setConfig({
    debug: false,
    modulePathPrefix: 'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/',
  });

  // Precache and route all files
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache strategies for different types of content
  
  // 1. Cache HTML pages - Network First with fallback
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        }),
      ],
    })
  );

  // 2. Cache static assets - Cache First
  workbox.routing.registerRoute(
    ({ request }) => 
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'worker',
    new workbox.strategies.CacheFirst({
      cacheName: 'static-assets',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
      ],
    })
  );

  // 3. Cache images - Cache First with WebP/AVIF support
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 150,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          purgeOnQuotaError: true,
        }),
      ],
    })
  );

  // 4. Cache Next.js data - Stale While Revalidate
  workbox.routing.registerRoute(
    /\/_next\/data\/.+\.json$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'next-data',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        }),
      ],
    })
  );

  // 5. Cache API responses - Network First
  workbox.routing.registerRoute(
    /^https:\/\/.*\.supabase\.co\/.*$/,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 5, // 5 minutes
        }),
      ],
    })
  );

  // 6. Cache fonts - Cache First
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'fonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
      ],
    })
  );

  // Background sync for form submissions
  const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('form-submissions', {
    maxRetentionTime: 24 * 60, // 24 hours
  });

  workbox.routing.registerRoute(
    /\/api\/.*\/submit$/,
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    'POST'
  );

  // Offline page fallback
  const OFFLINE_VERSION = 1;
  const CACHE_NAME = 'offline';
  const OFFLINE_URL = '/offline.html';

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
    );
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.open(CACHE_NAME).then((cache) => {
            return cache.match(OFFLINE_URL);
          });
        })
      );
    }
  });

  // Clean up old caches
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('offline')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

} else {
  console.log('Workbox failed to load 😬');
}