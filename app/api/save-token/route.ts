import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  await connectDB();

  const { userId, token } = await req.json();

  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { fcmTokens: token } },
    { new: true }
  );

  return NextResponse.json({ success: true });
}