const CACHE_NAME = 'bsod-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/BSoD maker_files/bsod.css',
  '/BSoD maker_files/bsod-fhd.css',
  '/BSoD maker_files/windowsui.css',
  '/BSoD maker_files/fonts.css',
  '/BSoD maker_files/jquery.min.js',
  '/BSoD maker_files/qrcode.min.js',
  '/BSoD maker_files/html2canvas.min.js',
  '/BSoD maker_files/mobilecheck.js',
  '/BSoD maker_files/bsod.js',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/index.html'))
  );
});