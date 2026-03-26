// ✅ ============================================
// ✅ FIREBASE CLOUD MESSAGING (FCM) - NO TOPO
// ✅ ============================================
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Config Firebase (MESMA da app)
firebase.initializeApp({
  apiKey: "AIzaSyDfUDqEJxVnWbQgn6LEVQAjlKeBJdp0vyY",
  authDomain: "vilamoura-select.firebaseapp.com",
  projectId: "vilamoura-select",
  storageBucket: "vilamoura-select.firebasestorage.app",
  messagingSenderId: "189990454398",
  appId: "1:189990454398:web:3d9eac9cf3a84b0510c42f"
});

const messaging = firebase.messaging();

// ✅ Background push handler
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.notification;
  
  const notificationOptions = {
    body,
    icon: icon || '/app/icon-192.png',
    badge: '/app/icon-192.png',
    data: { url: click_action || '/app/' },  // ← ← ← CORRETO: "data:" antes de {
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };
  
  self.registration.showNotification(title, notificationOptions);
});

// ✅ Click handler
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

// ✅ ============================================
// ✅ CÓDIGO ORIGINAL DO SW.JS (CACHE/OFFLINE)
// ✅ ============================================

const CACHE_NAME = 'vilamoura-select-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/app/',
  '/app/index.html',
  '/app/manifest.json',
  '/app/icon-192.png',
  '/app/icon-512.png',
  '/favicon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyCqRtZgE7hw-znacoAqXuXZ4SEGVuXWudo&libraries=places',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache aberto');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  // ✅ FILTRAR URLs que não podem ser cacheados
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1') {
    return; // Ignora estes requests
  }
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firebaseinstallations') || 
      event.request.url.includes('firebase.messaging')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/app/index.html');
            }
          });
      })
  );
});

// ✅ Push event handler
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova atualização do Vilamoura Select',
      icon: data.icon || '/app/icon-192.png',
      badge: '/app/icon-192.png',
      data: { url: data.click_action || '/app/' },  // ← ← ← TAMBÉM CORRIGIDO AQUI
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'close', title: 'Fechar' }
      ]
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Vilamoura Select', options)
    );
  }
});
