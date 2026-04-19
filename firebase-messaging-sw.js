// ✅ /firebase-messaging-sw.js (NA RAIZ DO DOMÍNIO)
// Este ficheiro é exigido pelo Firebase Messaging para push notifications

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Inicializar Firebase (mesma config do index.html)
firebase.initializeApp({
  apiKey: "AIzaSyDfUDqEJxVnWbQgn6LEVQAjlKeBJdp0vyY",
  authDomain: "vilamoura-select.firebaseapp.com",
  projectId: "vilamoura-select",
  storageBucket: "vilamoura-select.firebasestorage.app",
  messagingSenderId: "189990454398",
  appId: "1:189990454398:web:3d9eac9cf3a84b0510c42f"
});

const messaging = firebase.messaging();

// ✅ Handler para mensagens em BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Push recebida:', payload);
  
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

// ✅ Handler para click na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://vilamouraselect.pt/app/')
  );
});
