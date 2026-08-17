import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyJwt } from "@/lib/verifyJwt";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";

interface JwtPayload {
  id: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(req: Request) {
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
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const fullName = formData.get("fullName") as string | null;
    const email = formData.get("email") as string | null;
    const image = formData.get("profilepic") as File | null;

    /* ---------- UPDATE NAME / EMAIL ---------- */
    if (fullName) {
      user.fullName = fullName.trim();
    }
    if (email) {
      const trimmedEmail = email.toLowerCase().trim();
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        return NextResponse.json(
          { message: "Invalid email format" },
          { status: 400 }
        );
      }
      user.email = trimmedEmail;
    }

    /* ---------- IMAGE UPLOAD ---------- */
    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());

      // Optional: delete old image
      if (user.profilePic?.includes("cloudinary")) {
        const publicId = user.profilePic
          .split("/")
          .pop()
          ?.split(".")[0];

        if (publicId) {
          await cloudinary.uploader.destroy(
            `chat-profile/${publicId}`
          );
        }
      }

      const upload = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "chat-profile",
              resource_type: "image",
            },
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          )
          .end(buffer);
      });

      user.profilePic = upload.secure_url;
    }

    await user.save();

    return NextResponse.json({
      message: "Profile updated",
      user,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Profile update failed" },
      { status: 500 }
    );
  }
}

