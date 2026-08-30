"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigValid = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let messaging: Messaging | null = null;

if (typeof window !== "undefined" && isConfigValid) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging initialization skipped or failed:", error);
    messaging = null;
  }
}

export { messaging };