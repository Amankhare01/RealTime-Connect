"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();

  // Resend OTP countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      toast.warn("Please enter your registered email address");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      toast.success(res.data?.message || "Verification code sent to your email!");
      setStep(2);
      setCountdown(60); // 60 seconds cooldown for resend
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;

    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      toast.success(res.data?.message || "New verification code sent!");
      setCountdown(60);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!otp.trim() || !newPassword || !confirmPassword) {
      toast.warn("Please fill in all fields");
      return;
    }

    if (otp.trim().length !== 6) {
      toast.warn("Please enter the 6-digit OTP");
      return;
    }

    if (newPassword.length < 6) {
      toast.warn("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warn("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/reset-password", {
        email,
        otp: otp.trim(),
        newPassword,
      });

      toast.success(res.data?.message || "Password reset successful!");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1424] flex items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-xl flex flex-col gap-6 animate-fade-in-up">
        
        {/* Top Branding / Back Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            aria-label="Back to login"
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>

          <Link href="/contact" className="text-xs text-blue-400 hover:underline">
            Need help? Contact Us
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-[#161D2F] p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative">
          
          {/* Header Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/25 border border-white/10">
            {step === 3 ? (
              <CheckCircle2 size={28} />
            ) : (
              <KeyRound size={26} />
            )}
          </div>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Forgot password? 🔒
              </h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Enter the email address associated with your account and we'll send a 6-digit OTP code to reset your password.
              </p>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      aria-label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 mt-2 rounded-xl text-white font-semibold transition shadow-lg
                    ${loading
                      ? "bg-blue-600/50 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25"}`}
                >
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Verify OTP & Reset 🔑
              </h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                We sent a 6-digit code to <strong className="text-blue-400">{email}</strong>. Enter the code and set your new password.
              </p>

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                {/* OTP Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || loading}
                      className="text-xs text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit OTP"
                      aria-label="6-digit OTP code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white tracking-widest text-lg font-mono focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Minimum 6 characters"
                      aria-label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    />
                    <button
                      type="button"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter your new password"
                      aria-label="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3.5 rounded-xl border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition"
                  >
                    Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-2/3 py-3.5 rounded-xl text-white font-semibold transition shadow-lg
                      ${loading
                        ? "bg-blue-600/50 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25"}`}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Success State */}
          {step === 3 && (
            <div className="text-center py-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Password Reset Complete! 🎉
              </h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                Your account password has been updated successfully. You can now log in using your new credentials.
              </p>

              <button
                onClick={() => router.push("/login")}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition"
              >
                Proceed to Login
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-8 pt-6 border-t border-white/5">
            <ShieldCheck size={16} />
            <span>Secure 256-bit encrypted authentication</span>
          </div>

        </div>
      </div>
    </div>
  );
}
