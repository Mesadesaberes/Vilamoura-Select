// app/sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 1. CONFIGURAÇÃO DO FIREBASE (Use os mesmos dados do seu index.html)
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "189990454398", // <-- ID do remetente que vimos no painel
  appId: "SEU_APP_ID_AQUI"
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
    icon: '/app/icon-192x192.png', // Ajuste para o caminho do seu ícone real
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
