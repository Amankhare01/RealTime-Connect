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
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/chat-icon.png",
  });
});