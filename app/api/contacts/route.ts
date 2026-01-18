import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/verifyJwt";

interface JwtPayload {
  id: string;
}

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyJwt(token) as JwtPayload;

  // Find all messages involving this user
  const messages = await Message.find({
    $or: [{ senderId: decoded.id }, { receiverId: decoded.id }],
  }).sort({ createdAt: -1 });

  // Map userId → lastMessageTime
  const contactMap = new Map<string, string>();

  for (const msg of messages) {
    const otherUser =
      msg.senderId === decoded.id ? msg.receiverId : msg.senderId;

    if (!contactMap.has(otherUser)) {
      contactMap.set(otherUser, msg.createdAt.toISOString());
    }
  }

  const users = await User.find({
    _id: { $in: Array.from(contactMap.keys()) },
  });

  return NextResponse.json({
    users,
    lastMessageMap: Object.fromEntries(contactMap),
  });
}
