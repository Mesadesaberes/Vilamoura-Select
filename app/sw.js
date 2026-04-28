// ✅ /app/sw.js - SERVICE WORKER COM CACHE OFFLINE COMPLETO

const CACHE_NAME = 'vilamoura-select-v2';
const CACHE_VERSION = '2026-01-20';

// ✅ Recursos para cachear na instalação
const ASSETS_TO_CACHE = [
  '/app/',
  '/app/index.html',
  '/app/manifest.json',
  '/app/icon-192.png',
  '/app/icon-512.png',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyCqRtZgE7hw-znacoAqXuXZ4SEGVuXWudo&libraries=places',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js',
  'https://flagcdn.com/w40/pt.png',
  'https://flagcdn.com/w40/gb.png',
  'https://flagcdn.com/w40/fr.png',
  'https://flagcdn.com/w40/de.png',
  'https://flagcdn.com/w40/es.png'
];

// ✅ INSTALAÇÃO — Cache de todos os recursos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Recursos cacheados com sucesso');
        return self.skipWaiting(); // Ativa imediatamente
      })
      .catch((err) => {
        console.error('[SW] Erro ao cachear:', err);
      })
  );
});

// ✅ ATIVAÇÃO — Limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Limpando cache antigo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Cache limpo');
        return self.clients.claim(); // Assume controlo imediato
      })
  );
});

// ✅ FETCH — Serve do cache, fallback para rede
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;
  
  // Ignora requisições externas (ex: Firebase, Google Maps)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    // Cache-first para CDNs
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((networkResponse) => {
              // Cacheia resposta da rede para futuro
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
              return networkResponse;
            })
            .catch(() => {
              // Fallback offline para recursos externos
              return new Response('Offline', { status: 503 });
            });
        })
    );
    return;
  }
  
  // Cache-first para recursos locais
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[SW] Servindo do cache:', event.request.url);
          return response;
        }
        console.log('[SW] Servindo da rede:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Cacheia resposta da rede para futuro
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return networkResponse;
          })
          .catch(() => {
            // Fallback para index.html (SPA)
            if (event.request.mode === 'navigate') {
              return caches.match('/app/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// ✅ PUSH NOTIFICATIONS (mantém funcionalidade existente)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDfUDqEJxVnWbQgn6LEVQAjlKeBJdp0vyY",
  authDomain: "vilamoura-select.firebaseapp.com",
  projectId: "vilamoura-select",
  storageBucket: "vilamoura-select.firebasestorage.app",
  messagingSenderId: "189990454398",
  appId: "1:189990454398:web:3d9eac9cf3a84b0510c42f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Push recebida:', payload);
  const title = payload.notification?.title || 'Vilamoura Select';
  const options = {
    body: payload.notification?.body || 'Nova promoção!',
    icon: '/app/icon-192.png',
    badge: '/app/icon-192.png',
    vibrate: [200, 100, 200],
     {
      url: payload.data?.click_action || '/app/',
      dateOfArrival: Date.now()
    }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://vilamouraselect.pt/app/'));
});
