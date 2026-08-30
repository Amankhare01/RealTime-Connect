import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/verifyJwt";

interface JwtPayload {
  id: string;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyJwt(token) as JwtPayload;
    } catch {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { message: "Message text required" },
        { status: 400 }
      );
    }

    await connectDB();

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Only sender can edit message
    if (message.senderId !== decoded.id) {
      return NextResponse.json(
        { message: "Forbidden: You can only edit your own messages" },
        { status: 403 }
      );
    }

    message.text = text.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    console.error("Message edit error:", error);
    return NextResponse.json(
      { message: "Failed to edit message" },
      { status: 500 }
    );
  }
}
