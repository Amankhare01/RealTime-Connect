import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/verifyJwt";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

interface JwtPayload {
  id: string;
}

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

    // Rate limiting: 30 search requests per minute per IP
    const ip = getClientIp(req);
    const rateLimitResult = rateLimit(`search:${ip}`, 30, 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many search requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfterSeconds.toString(),
          },
        }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ users: [] });
    }

    const query: any[] = [
      { email: { $regex: q, $options: "i" } },
    ];

    // ✅ only add _id search if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(q)) {
      query.push({ _id: q });
    }

    const users = await User.find({
      _id: { $ne: decoded.id },
      $or: query,
    }).select("_id email fullName profilePic");

    return NextResponse.json({ users });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

