/* ===========================================================
   CallMed - Service Worker
   Cache offline + Estratégias de fetch
   =========================================================== */

const CACHE_NAME = 'callmed-v1.0.0';
const CACHE_STATIC = 'callmed-static-v1';
const CACHE_DYNAMIC = 'callmed-dynamic-v1';

// Arquivos para cachear na instalação
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/admin.html',
  '/paciente.html',
  
  // CSS
  '/css/styles.css',
  
  // JS
  '/js/components.js',
  '/js/tabs.js',
  '/js/app.js',
  '/js/crud.js',
  '/js/agendamento.js',
  '/js/features.js',
  
  // Assets
  '/assets/images/logo.png',
  '/assets/images/avatar.png',
  '/assets/images/chatbot.png',
  
  // Manifest
  '/pwa/manifest.json'
];

// ============================================
// INSTALL - Cachear arquivos
// ============================================
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('📦 Cacheando arquivos estáticos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalado com sucesso');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erro ao cachear arquivos:', error);
      })
  );
});

// ============================================
// ACTIVATE - Limpar caches antigos
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_STATIC && cacheName !== CACHE_DYNAMIC) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativado');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH - Estratégias de cache
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições não-GET e requisições externas
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  
  // Ignora requisições para APIs externas
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Estratégia: Cache First para assets estáticos
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }
  
  // Estratégia: Network First para HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_DYNAMIC));
    return;
  }
  
  // Estratégia: Stale While Revalidate para o resto
  event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC));
});

// ============================================
// HELPERS - Estratégias
// ============================================

function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Cache First: Tenta cache, senão busca na rede
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('⚠️ Falha ao buscar:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

// Network First: Tenta rede, senão cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('⚠️ Rede falhou, tentando cache:', request.url);
    const cached = await cache.match(request);
    if (cached) return cached;
    
    // Fallback para página offline
    return caches.match('/login.html');
  }
}

// Stale While Revalidate: Retorna cache e atualiza em background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// ============================================
// MESSAGE - Comunicação com o cliente
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map(name => caches.delete(name)));
    }).then(() => {
      console.log('✅ Cache limpo');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// ============================================
// PUSH NOTIFICATIONS (opcional)
// ============================================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: '/assets/images/icons/icon-192x192.png',
    badge: '/assets/images/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/admin.html'
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CallMed', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const urlToOpen = event.notification.data.url || '/admin.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================
// SYNC - Background Sync (opcional)
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-agendamentos') {
    event.waitUntil(syncAgendamentos());
  }
});

async function syncAgendamentos() {
  console.log('🔄 Sincronizando agendamentos...');
  // Aqui você pode implementar sincronização com backend
  // quando estiver offline
}

console.log('✅ Service Worker registrado com sucesso');