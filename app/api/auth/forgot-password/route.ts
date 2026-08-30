import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/nodemailer";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store or replace OTP in MongoDB
    await Otp.findOneAndUpdate(
      { email: normalizedEmail, type: "password_reset" },
      {
        email: normalizedEmail,
        otp,
        type: "password_reset",
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email with styled card
    await sendOtpEmail(normalizedEmail, otp, user.fullName);

    return NextResponse.json(
      { message: "Verification OTP sent to your email" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to send reset OTP. Please try again." },
      { status: 500 }
    );
  }
}
