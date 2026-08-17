"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import ImageModal from "@/components/common/ImageModal";

export default function ProfileMenu() {
  const { user, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <>
      <div className="relative z-50 shrink-0" ref={ref}>
        {/* AVATAR BUTTON */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 hover:scale-[1.03] active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-sm"
        >
          {user.profilePic ? (
            <Image
              src={user.profilePic}
              alt="Profile"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm">
              {user.fullName[0].toUpperCase()}
            </div>
          )}
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-200 animate-in">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (user.profilePic) {
                    setPreviewImage(user.profilePic);
                    setOpen(false);
                  }
                }}
                className={`w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ${
                  user.profilePic ? "cursor-pointer hover:ring-2 hover:ring-blue-500" : ""
                }`}
              >
                {user.profilePic ? (
                  <Image
                    src={user.profilePic}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold">
                    {user.fullName[0].toUpperCase()}
                  </div>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/profile");
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors duration-150 cursor-pointer"
              >
                Profile Settings
              </button>

              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-sm font-semibold border-t border-slate-100 dark:border-slate-800 transition-colors duration-150 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <ImageModal
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}

