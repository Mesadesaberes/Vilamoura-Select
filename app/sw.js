// ✅ /app/sw.js - SERVICE WORKER PARA PUSH NOTIFICATIONS (CORRIGIDO)

// Importar Firebase
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Inicializar Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDfUDqEJxVnWbQgn6LEVQAjlKeBJdp0vyY",
  authDomain: "vilamoura-select.firebaseapp.com",
  projectId: "vilamoura-select",
  storageBucket: "vilamoura-select.firebasestorage.app",
  messagingSenderId: "189990454398",
  appId: "1:189990454398:web:3d9eac9cf3a84b0510c42f"
});

// Obter instância do Messaging
const messaging = firebase.messaging();

// ✅ Handler para mensagens em BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Mensagem push recebida:', payload);
  
  const notificationTitle = payload.notification?.title || 'Vilamoura Select';
  
  // ✅ CORREÇÃO: Adicionar chave "data" ao objeto
  const notificationOptions = {
    body: payload.notification?.body || 'Nova promoção disponível!',
    icon: '/app/icon-192.png',
    badge: '/app/icon-192.png',
    vibrate: [200, 100, 200],
    data: {  // ✅ CHAVE "data" ADICIONADA
      url: payload.data?.click_action || '/app/',
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  // Mostrar notificação
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handler para click na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[sw.js] Notificação clicada');
  event.notification.close();
  
  // Abrir a app quando clica
  event.waitUntil(
    clients.openWindow('https://vilamouraselect.pt/app/')
  );
});

// ✅ Cache básico para offline (opcional)
const CACHE_NAME = 'vilamoura-select-v1';
const urlsToCache = [
  '/app/',
  '/app/index.html',
  '/app/manifest.json',
  '/app/icon-192.png',
  '/app/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
