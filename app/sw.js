// ✅ NO TOPO DE app/sw.js - CÓDIGO FCM
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
  const { title, body, icon, click_action } = payload.notification;
  const notificationOptions = {
    body,
    icon: icon || '/app/icon-192.png',
    badge: '/app/icon-192.png',
     { url: click_action || '/app/' },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };
  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/app/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          for (let client of windowClients) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// ✅ ABAIXO DISTO: mantém o teu código original do sw.js
// ... (o resto do sw.js que já tinhas)
const CACHE_NAME = 'vilamoura-select-v16';

const urlsToCache = [
  '/app/',
  '/app/index.html',
  '/app/manifest.json',
  '/app/icon-192.png',
  '/app/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache aberto:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('❌ Erro ao cachear:', err))
  );
  self.skipWaiting(); // Força ativação imediata
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Cache antigo removido:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume controlo imediato
});

// Intercepta pedidos de rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(() => {
            // Fallback para offline
            return caches.match('/index.html');
          });
      })
  );
});

