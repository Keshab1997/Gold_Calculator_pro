const CACHE_NAME = 'gold-calc-v1';
const urlsToCache = [
  './',
  './index.html',
  './dashboard.html',
  './css/global.css',
  './css/login.css',
  './css/dashboard.css',
  './js/auth.js',
  './js/calculator.js',
  './js/supabase-client.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch Data (Offline Support)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});