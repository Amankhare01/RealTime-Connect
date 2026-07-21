"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const { theme, toggleTheme } = useTheme();

  const login = async () => {
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
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Login failed");
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

      {/* LOGIN CARD */}
      <div className="bg-bg-surface dark:bg-bg-surface/40 backdrop-blur-xl border border-border-subtle p-8 rounded-2xl w-full max-w-md flex flex-col gap-6 shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] animate-slide-left">
        <div className="flex flex-col gap-1.5 text-center opacity-0 animate-fade-in-up delay-100">
          <h2 className="text-text-primary text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-text-secondary text-sm">Please enter your details to sign in</p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            className="input-field w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-secondary/60 text-sm sm:text-base opacity-0 animate-fade-in-up delay-150"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            className="input-field w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-secondary/60 text-sm sm:text-base opacity-0 animate-fade-in-up delay-200"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            disabled={loading}
          />
        </div>

        <button
          onClick={login}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] opacity-0 animate-fade-in-up delay-250 ${
            loading
              ? "bg-slate-400 dark:bg-slate-700/50 cursor-not-allowed opacity-65"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-750 hover:to-indigo-700 cursor-pointer shadow-blue-500/10 hover:shadow-blue-500/25"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-text-secondary text-sm text-center opacity-0 animate-fade-in-up delay-300">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-accent-link font-semibold hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
