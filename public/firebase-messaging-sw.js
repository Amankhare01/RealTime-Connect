importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBrT0Xf9cX1uC9T32EMIpP74FHps4Ouc7c",
  authDomain: "realtime-connect-d577c.firebaseapp.com",
  projectId: "realtime-connect-d577c",
  messagingSenderId: "1006991520749",
  appId: "1:1006991520749:web:6d44fd9ef4d6312cb96de4",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || payload.data?.title || "New Message";
  const body = payload.notification?.body || payload.data?.body || "";
  const url = payload.data?.url || payload.fcmOptions?.link || "/chat";

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    data: {
      url,
      ...payload.data,
    },
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/chat";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes("/chat") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});