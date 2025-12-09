const CACHE_NAME = 'gold-calc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/css/global.css',
  '/css/login.css',
  '/css/dashboard.css',
  '/js/app.js',
  '/js/calculator.js'
];

// Install Event
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch Event (অফলাইনেও যাতে পেজ লোড হয়)
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cacheRes) => {
      return cacheRes || fetch(evt.request);
    })
  );
});