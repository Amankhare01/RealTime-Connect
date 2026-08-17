"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const signup = async () => {
    if (loading) return;

    if (!fullName || !email || !password) {
      toast.warn("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/signup", {
        fullName,
        email,
        password,
      });

      toast.success("Account created successfully");
      router.push("/login");
    } catch (err: any) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-[12vh] sm:pt-[15vh] bg-bg-base text-text-primary transition-colors duration-200 px-4">
      {/* FLOATING THEME TOGGLE */}
      <button
        onClick={toggleTheme}
        title="Toggle Theme"
        className="fixed top-6 right-6 p-2.5 rounded-xl bg-bg-surface/80 dark:bg-bg-surface/30 border border-border-subtle text-text-primary shadow-sm hover:shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* SIGNUP CARD */}
      <div className="bg-bg-surface dark:bg-bg-surface/40 backdrop-blur-xl border border-border-subtle p-8 rounded-2xl w-full max-w-md flex flex-col gap-6 shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] animate-slide-right">
        <div className="flex flex-col gap-1.5 text-center opacity-0 animate-fade-in-up delay-100">
          <h2 className="text-text-primary text-2xl font-bold tracking-tight">Create Account</h2>
          <p className="text-text-secondary text-sm">Join us and start chatting today</p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            className="input-field w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-secondary/60 text-sm sm:text-base opacity-0 animate-fade-in-up delay-150"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />

          <input
            className="input-field w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-secondary/60 text-sm sm:text-base opacity-0 animate-fade-in-up delay-200"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            className="input-field w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-secondary/60 text-sm sm:text-base opacity-0 animate-fade-in-up delay-250"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signup()}
            disabled={loading}
          />
        </div>

        <button
          onClick={signup}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] opacity-0 animate-fade-in-up delay-300 ${
            loading
              ? "bg-slate-400 dark:bg-slate-700/50 cursor-not-allowed opacity-65"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer"
          }`}
        >
          {loading ? "Creating Account..." : "Signup"}
        </button>

        <p className="text-text-secondary text-sm text-center opacity-0 animate-fade-in-up delay-300">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-link font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
