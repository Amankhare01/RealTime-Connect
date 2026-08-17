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

function isValidMimeType(
  declaredType: "image" | "audio" | "document",
  mimeType: string
): boolean {
  if (!mimeType) return false;

  if (declaredType === "image") {
    return mimeType.startsWith("image/");
  }

  if (declaredType === "audio") {
    return mimeType.startsWith("audio/");
  }

  if (declaredType === "document") {
    const allowedDocs = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/rtf",
      "application/zip",
      "application/x-zip-compressed",
    ];
    return allowedDocs.includes(mimeType) || mimeType.startsWith("text/");
  }

  return false;
}

/* ======================================================
   GET: Fetch messages between logged-in user & receiver
====================================================== */
export async function GET(req: Request) {
  try {
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

    await connectDB();

    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("receiverId");
    const limitParam = searchParams.get("limit");
    const beforeParam = searchParams.get("before");

    if (!receiverId) {
      return NextResponse.json(
        { message: "receiverId required" },
        { status: 400 }
      );
    }

    const filter: any = {
      $or: [
        { senderId: decoded.id, receiverId },
        { senderId: receiverId, receiverId: decoded.id },
      ],
    };

    if (beforeParam) {
      filter.createdAt = { $lt: new Date(beforeParam) };
    }

    if (limitParam) {
      const limit = Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 100);
      const messages = await Message.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);
      return NextResponse.json(messages.reverse(), { status: 200 });
    }

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Messages fetch error:", error);
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

    await connectDB();

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

    let fileUrl = (formData.get("fileUrl") as string | null) || undefined;

    /* ---------- FILE VALIDATION ---------- */
    if (file) {
      if (!fileType || !isValidMimeType(fileType, file.type)) {
        return NextResponse.json(
          { message: "Invalid file type or format" },
          { status: 400 }
        );
      }

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
      status: "sent",
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { message: "Message send failed" },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE: Bulk Delete Messages
====================================================== */
export async function DELETE(req: Request) {
  try {
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

    await connectDB();

    const { searchParams } = new URL(req.url);
    const messageIdsStr = searchParams.get("messageIds");

    if (!messageIdsStr) {
      return NextResponse.json(
        { message: "messageIds required" },
        { status: 400 }
      );
    }

    const messageIds = messageIdsStr.split(",");

    const result = await Message.deleteMany({
      _id: { $in: messageIds },
      $or: [{ senderId: decoded.id }, { receiverId: decoded.id }],
    });

    return NextResponse.json(
      { message: "Messages deleted successfully", count: result.deletedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Message delete error:", error);
    return NextResponse.json(
      { message: "Failed to delete messages" },
      { status: 500 }
    );
  }
}

