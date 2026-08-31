"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { api } from "@/lib/axios";
import { toast } from "react-toastify";

export const useFCM = (userId?: string) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const syncToken = useCallback(async () => {
    if (!messaging || !userId) return;
    try {
      if (process.env.NODE_ENV === "development" && "serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log("🛠️ [FCM Diagnostics] Active Service Worker Registrations:", registrations);
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        await api.post("/api/save-token", { userId, token });
        if (process.env.NODE_ENV === "development") {
          console.log("✅ [FCM] Token saved successfully:", token.substring(0, 15) + "...");
        }
      }
    } catch (error) {
      console.warn("⚠️ [FCM] Error obtaining / saving FCM push token:", error);
    }
  }, [userId]);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !userId) return;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        await syncToken();
      }
    } catch (error) {
      console.warn("⚠️ [FCM] Error requesting notification permission:", error);
    }
  };

  // If permission is already granted when user logs in, ensure token is synced
  useEffect(() => {
    if (userId && permission === "granted") {
      syncToken();
    }
  }, [userId, permission, syncToken]);

  // Task 5: Handle foreground push messages when app is open and focused
  useEffect(() => {
    if (!messaging) return;

    try {
      const unsubscribe = onMessage(messaging, (payload) => {
        if (process.env.NODE_ENV === "development") {
          console.log("🔔 [FCM Foreground Message Received]:", payload);
        }

        const title = payload.notification?.title || payload.data?.title || "New Message";
        const body = payload.notification?.body || payload.data?.body || "";

        toast.info(body ? `${title}: ${body}` : title, {
          icon: "💬",
          autoClose: 5000,
        });
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.warn("⚠️ [FCM] onMessage registration failed:", err);
    }
  }, []);

  return { permission, requestPermission };
};