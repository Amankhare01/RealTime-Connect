import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/verifyJwt";

interface JwtPayload {
  id: string;
}

export async function GET() {
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

    const users = await User.find({ _id: { $ne: decoded.id } })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(users, { status: 200 });
  } catch (error: unknown) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

