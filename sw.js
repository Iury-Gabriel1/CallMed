// sw.js - Service Worker básico
const CACHE_NAME = 'CallMed-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/base.css',
  '/layout.css', 
  '/storage.js',
  '/main.js',
  '/logo.png',
  '/avatar.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});