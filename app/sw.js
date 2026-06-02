// app/sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Substitua pelos dados do seu projeto Firebase (os mesmos que usa no index.html)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar o Firebase Messaging
const messaging = firebase.messaging();

// Opcional: Personalizar a notificação quando a app estiver em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'Nova Promoção!';
  const notificationOptions = {
    body: payload.notification.body || 'Temos uma novidade para si no Vilamoura-Select.',
    icon: '/app/icon-192x192.png', // Ajuste para o caminho do seu ícone
    badge: '/app/icon-192x192.png',
    data: payload.data // Pode guardar um link para abrir ao clicar
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Quando o utilizador clica na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('[sw.js] Notification click received.');
  event.notification.close();
  
  // Se houver um link nos dados da notificação, abre esse link
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else {
    // Caso contrário, abre a página principal da app
    event.waitUntil(clients.openWindow('/app/'));
  }
});
