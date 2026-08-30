"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { api } from "@/lib/axios";

export const useFCM = (userId?: string) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !userId) return;
    
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        if (!messaging) return;
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
          await api.post("/api/save-token", { userId, token });
        }
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  return { permission, requestPermission };
};