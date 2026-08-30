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
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out");
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Failed to log out. Please try again.");
    }
  };

  /* ---------- LOADING STATE ---------- */
  if (!user) {
    return (
      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="relative z-50 shrink-0" ref={ref}>
      {/* AVATAR BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User profile menu"
        title={user.fullName || "User profile"}
        className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle bg-slate-200 dark:bg-slate-700 hover:ring-2 hover:ring-blue-500/40 transition"
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
          <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-semibold text-sm">
            {user.fullName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up z-50">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/40">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 ring-1 ring-border-subtle">
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
                  {user.fullName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-text-primary truncate">
                {user.fullName || "User"}
              </div>
              <div className="text-[11px] text-text-secondary truncate">
                {user.email}
              </div>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary text-sm transition-colors flex items-center gap-2"
            >
              <span>Profile Settings</span>
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-500 text-sm transition-colors flex items-center gap-2"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
