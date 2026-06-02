// app/sw.js - Service Worker para Notificações Push (Vilamoura-Select)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 1. CONFIGURAÇÃO DO FIREBASE (com os seus dados reais)
const firebaseConfig = {
  apiKey: "AIzaSyDfUDqEJxVnWbQgn6LEVQAjlKeBJdp0vyY",
  authDomain: "vilamoura-select.firebaseapp.com",
  projectId: "vilamoura-select",
  storageBucket: "vilamoura-select.firebasestorage.app",
  messagingSenderId: "189990454398",
  appId: "1:189990454398:web:3d9eac9cf3a84b0510c42f"
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// 2. Tratar notificações quando a app está em segundo plano (ou fechada)
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Mensagem em segundo plano recebida: ', payload);
  
  const notificationTitle = payload.notification.title || 'Nova Promoção Vilamoura-Select!';
  const notificationOptions = {
    body: payload.notification.body || 'Toque para ver a novidade.',
    icon: '/app/icon-192x192.png', // ⚠️ Ajuste este caminho se o seu ícone tiver outro nome
    badge: '/app/icon-192x192.png',
    data: payload.data || {} // Guarda dados extras (ex: link para abrir)
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 3. Ação quando o utilizador clica na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('[sw.js] Clique na notificação recebido.');
  event.notification.close();
  
  // Se a notificação tiver um link, abre esse link. Se não, abre a home da app.
  const urlParaAbrir = event.notification.data.url || '/app/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Se já houver uma janela aberta, foca nela
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlParaAbrir && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlParaAbrir);
      }
    })
  );
});
