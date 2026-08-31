import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { messaging } from "@/lib/firebase-admin";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({}, "_id fullName email fcmTokens");
    const totalUsers = users.length;
    const usersWithTokens = users.filter((u) => u.fcmTokens && u.fcmTokens.length > 0);

    const envCheck = {
      FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
      FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
      FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      NEXT_PUBLIC_FIREBASE_API_KEY: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
    };

    const isFirebaseAdminReady = Boolean(messaging);

    return NextResponse.json({
      status: isFirebaseAdminReady ? "Firebase Admin Ready ✅" : "Firebase Admin Not Ready ❌",
      environmentVariables: envCheck,
      databaseStats: {
        totalUsers,
        usersWithFcmTokensCount: usersWithTokens.length,
        usersWithTokens: usersWithTokens.map((u) => ({
          id: u._id,
          name: u.fullName,
          email: u.email,
          tokenCount: u.fcmTokens.length,
        })),
      },
      diagnosticNote: !isFirebaseAdminReady
        ? "Firebase Admin is not ready. Check that FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set correctly and Vercel was redeployed."
        : usersWithTokens.length === 0
        ? "Firebase Admin is ready, but NO users have registered FCM tokens in MongoDB yet! Make sure the receiver opened the app, clicked 'Enable Notifications' / allowed notification permission."
        : "Firebase Admin is ready and users have tokens. Push notifications should fire when messages are sent.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "Error running diagnostic",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
