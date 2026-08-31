/**
 * Firebase Admin SDK Initialization & Push Notification Service
 * 
 * REQUIRED PRODUCTION ENVIRONMENT VARIABLES (Set in Vercel Dashboard / Hosting Provider):
 * - FIREBASE_PROJECT_ID: Your Firebase project ID (e.g. "realtime-connect-d577c")
 * - FIREBASE_CLIENT_EMAIL: Service account client email (e.g. "firebase-adminsdk-xxxxx@realtime-connect-d577c.iam.gserviceaccount.com")
 * - FIREBASE_PRIVATE_KEY: Service account private key (including "-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----")
 * 
 * How to get these credentials:
 * 1. Go to Firebase Console -> Project Settings -> Service Accounts.
 * 2. Click "Generate new private key" to download the JSON service account file.
 * 3. Copy `project_id`, `client_email`, and `private_key` into your environment variables.
 */

import { getApps, initializeApp, cert, getApp, type App } from "firebase-admin/app";
import { getMessaging, type MulticastMessage, type Messaging } from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

const isConfigured = Boolean(projectId && clientEmail && rawPrivateKey);

let app: App | null = null;
let messaging: Messaging | null = null;

function formatPrivateKey(key: string): string {
  let cleaned = key.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, "\n");
}

if (isConfigured) {
  try {
    const apps = getApps();
    if (apps.length > 0) {
      app = getApp();
    } else {
      const privateKey = formatPrivateKey(rawPrivateKey!);
      app = initializeApp({
        credential: cert({
          projectId: projectId!.trim(),
          clientEmail: clientEmail!.trim(),
          privateKey,
        }),
      });
      console.log("✅ Firebase Admin SDK initialized successfully");
    }
    if (app) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    messaging = null;
  }
} else {
  console.warn(
    "⚠️ Firebase Admin SDK credentials missing (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Push notifications are disabled in this environment."
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushNotificationResult {
  successCount: number;
  failureCount: number;
  staleTokens: string[];
}

/**
 * Send push notification to multiple device tokens and return any stale tokens to be pruned.
 */
export async function sendPushNotification(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<PushNotificationResult> {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, staleTokens: [] };
  }

  // If Firebase Admin is not initialized or credentials missing, gracefully no-op
  if (!messaging) {
    return { successCount: 0, failureCount: 0, staleTokens: [] };
  }

  try {
    const validTokens = tokens.filter((t) => typeof t === "string" && t.trim().length > 0);
    if (validTokens.length === 0) {
      return { successCount: 0, failureCount: 0, staleTokens: [] };
    }

    const message: MulticastMessage = {
      tokens: validTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      webpush: {
        fcmOptions: {
          link: payload.data?.url || "/chat",
        },
        notification: {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);

    const staleTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        // Collect tokens that are invalid or no longer registered
        if (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/invalid-argument"
        ) {
          staleTokens.push(validTokens[idx]);
        } else {
          console.warn(`Push notification failed for token ${validTokens[idx]}:`, resp.error?.message);
        }
      }
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      staleTokens,
    };
  } catch (error) {
    console.error("Error sending push notification via Firebase Admin:", error);
    return { successCount: 0, failureCount: tokens.length, staleTokens: [] };
  }
}

export { messaging };
