import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyJwt } from "@/lib/verifyJwt";
import Users from "@/models/User";

export async function GET() {
  // ✅ cookies() is async in Next 15+
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  await connectDB();

  const decoded = verifyJwt(token);
  const user = await Users.findById(decoded.id).select("-password");

  return NextResponse.json({ user });
}
