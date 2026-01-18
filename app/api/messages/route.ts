import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/verifyJwt";
import cloudinary from "@/lib/cloudinary";

interface JwtPayload {
  id: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/* ======================================================
   GET: Fetch messages between logged-in user & receiver
====================================================== */
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("receiverId");

    if (!receiverId) {
      return NextResponse.json(
        { message: "receiverId required" },
        { status: 400 }
      );
    }

    const messages = await Message.find({
      $or: [
        { senderId: decoded.id, receiverId },
        { senderId: receiverId, receiverId: decoded.id },
      ],
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST: Send message (text / image / audio / document)
====================================================== */
export async function POST(req: Request) {
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

    const formData = await req.formData();

    const receiverId = formData.get("receiverId") as string;
    const text = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;
    const fileType = formData.get("fileType") as
      | "image"
      | "audio"
      | "document"
      | null;

    if (!receiverId) {
      return NextResponse.json(
        { message: "receiverId required" },
        { status: 400 }
      );
    }

    let fileUrl: string | undefined;

    /* ---------- FILE VALIDATION ---------- */
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "File size exceeds 5MB" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Cloudinary resource type
      const resourceType =
        fileType === "audio" ? "video" : "auto";

      const uploadResult = await new Promise<any>(
        (resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: "chat-assets",
              resource_type: resourceType,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }
      );

      fileUrl = uploadResult.secure_url;
    }

    if (!text && !fileUrl) {
      return NextResponse.json(
        { message: "Empty message" },
        { status: 400 }
      );
    }

    const message = await Message.create({
      senderId: decoded.id,
      receiverId,
      text,
      fileUrl,
      fileType,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Message send failed" },
      { status: 500 }
    );
  }
}
