"use client";

import { Camera, Check, X, Pencil } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/axios";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  if (!user) return null;

  /* ---------- IMAGE UPDATE ---------- */
  const handleImageUpdate = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append("profilepic", file);

    try {
      const res = await api.put("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
    } finally {
      setLoading(false);
      setPreview(null);
    }
  };

  /* ---------- SAVE NAME / EMAIL ---------- */
  const handleSaveProfile = async () => {
    setLoading(true);

    try {
      const res = await api.put("/api/profile", {
        fullName,
        email,
      });
      setUser(res.data.user);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base dark:bg-gradient-to-br dark:from-[#0b1120] dark:via-[#0f1b2d] dark:to-[#0b1120] px-4 transition-colors duration-200 py-8">
      <div className="relative w-full max-w-md rounded-2xl bg-bg-surface dark:bg-bg-surface/40 border border-border-subtle shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 sm:p-8 backdrop-blur-xl animate-in">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-border-subtle text-text-secondary bg-bg-surface/80 dark:bg-slate-950/20 hover:bg-bg-base dark:hover:bg-slate-800 transition-all duration-150 shadow-sm cursor-pointer"
        >
          ← Back
        </button>

        {/* HEADER */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1.5 font-medium">
            Manage your personal account details
          </p>
        </div>

        {/* AVATAR */}
        <div className="relative flex justify-center mb-6">
          <div className="relative w-32 h-32">
            {/* Skeleton loader */}
            {loading && (
              <div className="absolute inset-0 rounded-full bg-bg-base animate-pulse z-10" />
            )}

            <Image
              src={preview || user.profilePic || "/default.png"}
              alt="Profile"
              fill
              className={`rounded-full object-cover ring-4 ring-accent-primary/20 dark:ring-accent-primary/40 shadow-md ${
                loading ? "opacity-50" : ""
              }`}
            />

            <button
              title="Profile Image"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Camera size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpdate}
            />
          </div>
        </div>

        {/* INFO */}
        <div className="space-y-5 text-center">

          {/* NAME */}
          <div className="flex flex-col gap-1">
            {isEditing && <label className="text-[11px] text-left text-text-secondary font-bold tracking-wider uppercase ml-1">Full Name</label>}
            {isEditing ? (
              <input
                title="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-2.5 text-text-primary text-center text-sm sm:text-base"
              />
            ) : (
              <p className="text-xl font-bold text-text-primary leading-tight">
                {user.fullName}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            {isEditing && <label className="text-[11px] text-left text-text-secondary font-bold tracking-wider uppercase ml-1">Email Address</label>}
            {isEditing ? (
              <input
                title="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-2.5 text-text-primary text-center text-sm sm:text-base"
              />
            ) : (
              <p className="text-sm text-text-secondary mt-0.5 font-semibold">
                {user.email}
              </p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-3 pt-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-sm shadow-green-500/10"
                >
                  <Check size={16} /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm"
                >
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-accent-primary hover:bg-blue-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm shadow-blue-500/15"
              >
                <Pencil size={15} /> Edit Profile
              </button>
            )}
          </div>

          {/* USER ID */}
          <div className="bg-bg-base/60 dark:bg-slate-950/60 border border-border-subtle/50 rounded-xl px-4 py-3 text-[11px] text-text-secondary break-all transition-colors duration-200 mt-4 leading-normal">
            User ID:{" "}
            <span className="text-accent-link font-bold ml-1 font-mono">
              {user._id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
