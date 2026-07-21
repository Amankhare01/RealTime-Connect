import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/verifyJwt";

interface JwtPayload {
  id: string;
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyJwt(token) as JwtPayload;

    const { messageId, emoji } = await req.json();

    if (!messageId) {
      return NextResponse.json(
        { message: "messageId required" },
        { status: 400 }
      );
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Ensure user is part of the conversation
    if (message.senderId !== decoded.id && message.receiverId !== decoded.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Toggle reaction: if emoji matches the existing one, remove it
    const currentReaction = message.reactions.get(decoded.id);
    if (emoji) {
      if (currentReaction === emoji) {
        // remove if clicked same emoji
        message.reactions.delete(decoded.id);
      } else {
        // set/update
        message.reactions.set(decoded.id, emoji);
      }
    } else {
      message.reactions.delete(decoded.id);
    }

    await message.save();

    // Convert map to object to return cleanly
    const reactionsObj = Object.fromEntries(message.reactions);

    return NextResponse.json(
      {
        _id: message._id,
        reactions: reactionsObj,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reaction failed:", error);
    return NextResponse.json(
      { message: "Failed to update reaction" },
      { status: 500 }
    );
  }
}
