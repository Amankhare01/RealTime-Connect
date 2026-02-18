"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 👈 NEW
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const login = async () => {
    if (loading) return; // 👈 extra safety

    if (!email || !password) {
      toast.warn("Please fill all fields");
      return;
    }

    setLoading(true); // 👈 disable button

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
      setLoading(false); // 👈 re-enable button
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg w-96 flex flex-col gap-4">
        <h2 className="text-white text-xl font-semibold">Login</h2>

        <input
          className="p-2 rounded bg-gray-700 text-white"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="p-2 rounded bg-gray-700 text-white"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className={`py-2 rounded text-white transition
            ${loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-gray-400 text-sm text-center">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
