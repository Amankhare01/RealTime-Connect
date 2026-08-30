import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyJwt } from "@/lib/verifyJwt";
import Users from "@/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch {
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.set("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      return res;
    }

    await connectDB();

    const user = await Users.findById(decoded.id).select("-password");
    if (!user) {
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.set("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

