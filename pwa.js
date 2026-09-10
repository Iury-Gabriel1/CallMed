// pwa.js
// Habilita PWA e cache offline

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => console.log("Service Worker registrado:", reg.scope))
      .catch(err => console.error("Erro ao registrar Service Worker:", err));
  });
}

// Exemplo de service-worker.js (arquivo separado):
// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open('CallMed-cache-v1').then(cache => {
//       return cache.addAll([
//         '/',
//         '/index.html',
//         '/css/base.css',
//         '/js/main.js',
//         '/img/logo.png'
//       ]);
//     })
//   );
// });

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(response => response || fetch(event.request))
//   );
// });
