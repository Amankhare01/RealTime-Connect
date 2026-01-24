import { NextResponse } from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
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
  $or: query,
}).select("_id email fullName");


    return NextResponse.json({ users });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
