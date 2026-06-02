// firebase-messaging-sw.js (na RAIZ do repositório, NÃO na pasta /app/)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Configuração do Firebase (mesmos dados do seu index.html)
const firebaseConfig = {
  apiKey: "AIzaSyDfUDqEJxVnWbQgn6LEVQAjlKeBJdp0vyY",
  authDomain: "vilamoura-select.firebaseapp.com",
  projectId: "vilamoura-select",
  storageBucket: "vilamoura-select.firebasestorage.app",
  messagingSenderId: "189990454398",
  appId: "1:189990454398:web:3d9eac9cf3a84b0510c42f"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Tratar notificações quando a app está em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem em segundo plano recebida: ', payload);
  
  const notificationTitle = payload.notification.title || 'Nova Promoção Vilamoura-Select!';
  const notificationOptions = {
    body: payload.notification.body || 'Toque para ver a novidade.',
    icon: '/app/icon-192x192.png',
    badge: '/app/icon-192x192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Ação quando o utilizador clica na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Clique na notificação recebido.');
  event.notification.close();
  
  const urlParaAbrir = event.notification.data.url || '/app/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlParaAbrir && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlParaAbrir);
      }
    })
  );
});
