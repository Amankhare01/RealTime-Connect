"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signup = async () => {
    if (!fullName || !email || !password) {
      toast.warn("Please fill all fields");
      return;
    }

    try {
      await api.post("/api/auth/signup", {
        fullName,
        email,
        password,
      });

      toast.success("Account created successfully");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg w-96 flex flex-col gap-4">
        <h2 className="text-white text-xl font-semibold">Signup</h2>

        <input
          className="p-2 rounded bg-gray-700 text-white"
          placeholder="Full name"
          onChange={(e) => setFullName(e.target.value)}
        />

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
          onClick={signup}
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Signup
        </button>

        {/* Link to Login */}
        <p className="text-gray-400 text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
