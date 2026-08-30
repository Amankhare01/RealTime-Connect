"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import Link from "next/link";
import { Mail, Lock, Search, Users, MessageCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      toast.warn("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      setUser(res.data.user);
      toast.success("Login successful");
      router.push("/chat");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1424] flex items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col gap-10 pr-8 relative">
          {/* Background decorative elements */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div>

            
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight mb-4 text-white">
              Connect.<br />
              <span className="text-blue-500">Discover.</span><br />
              Stay in touch.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Search and connect with your friends or contacts using email or ID. Build your network, share moments, and stay connected.
            </p>
          </div>

          <div className="flex flex-col gap-8 relative z-10 mt-8">
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#1A2235] flex items-center justify-center text-blue-500 shrink-0 border border-white/5">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Create Account</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Quick and easy sign up in just a few steps.</p>
              </div>
            </div>
            
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#1A2235] flex items-center justify-center text-blue-500 shrink-0 border border-white/5">
                <Search size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Search & Connect</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Find friends by email or unique ID.</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#1A2235] flex items-center justify-center text-blue-500 shrink-0 border border-white/5">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">Stay Updated</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Message, share and stay connected in real-time.</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 text-xs mt-auto pt-10">
            <ShieldCheck size={16} />
            <span>Your privacy is important to us. We never share your data.</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#161D2F] p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back 👋</h2>
            <p className="text-gray-400 text-sm mb-8">Login to continue to Netify</p>

            <form onSubmit={login} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Email or ID</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    placeholder="Enter your email or ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <div className="flex justify-end mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    Forgot password?
                  </Link>
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
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="flex flex-col items-center gap-3 mt-6 pt-4 border-t border-white/5">
              <p className="text-gray-400 text-sm text-center">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold">
                  Create account
                </Link>
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Need assistance?</span>
                <Link
                  href="/contact"
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                >
                  Contact Support / Us &rarr;
                </Link>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center justify-center gap-2 text-gray-600 text-xs mt-4">
            <ShieldCheck size={16} />
            <span>Privacy is important. We never share data.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
