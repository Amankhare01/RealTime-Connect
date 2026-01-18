"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";

export default function ProfileMenu() {
  const { user, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* ---------- CLOSE ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- LOGOUT ---------- */
  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
    toast.success("Logged out");
    router.replace("/login");
  };

  /* ---------- LOADING STATE ---------- */
  if (!user) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-600 animate-pulse" />
    );
  }

  return (
    <div className="relative z-50 shrink-0" ref={ref}>
      {/* AVATAR BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-gray-700"
      >
        {user.profilePic ? (
          <Image
            src={user.profilePic}
            alt="Profile"
            width={36}
            height={36}
            className="object-cover w-full h-full"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-semibold">
            {user.fullName[0].toUpperCase()}
          </div>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
              {user.profilePic ? (
                <Image
                  src={user.profilePic}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-sm font-semibold">
                  {user.fullName[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-300 truncate">
              {user.email}
            </div>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm"
          >
            Profile
          </button>

          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 hover:bg-red-600 text-white text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
