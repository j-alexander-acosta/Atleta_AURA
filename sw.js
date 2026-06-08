const CACHE_NAME = 'gymucn-fitness-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.css',
  './clustering.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// Evento de Instalación: Cachear Recursos Estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos principales...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de Activación: Limpiar Caches Antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Borrando caché antiguo...', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento Fetch: Servir desde Caché Offline-First
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar llamadas de videos externos (YouTube)
  if (event.request.url.includes('youtube.com') || event.request.url.includes('youtu.be')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(networkResponse => {
            // No cachear llamadas inválidas
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clonar respuesta y guardar en caché
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return networkResponse;
          })
          .catch(() => {
            // Manejar fallas de red offline silenciosas
            console.warn('Recurso no disponible offline:', event.request.url);
          });
      })
  );
});
