// firebase-messaging-sw.js
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

// ✅ Inicializar messaging com service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    messaging.useServiceWorker(registration);
  });
}

// ✅ Background push handler
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.notification;
  
  const notificationOptions = {
    body,
    icon: icon || '/app/icon-192.png',
    badge: '/app/icon-192.png',
    data: { url: click_action || '/app/' },
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
