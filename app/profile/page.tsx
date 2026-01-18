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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1220] via-[#0f1b2d] to-[#0b1220] px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl p-6">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Profile
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your account details
          </p>
        </div>

        {/* AVATAR */}
        <div className="relative flex justify-center">
          <div className="relative w-32 h-32">
            {/* Skeleton loader */}
            {loading && (
              <div className="absolute inset-0 rounded-full bg-gray-700 animate-pulse" />
            )}

            <Image
              src={preview || user.profilePic || "/default.png"}
              alt="Profile"
              fill
              className={`rounded-full object-cover ring-4 ring-blue-600/40 ${
                loading ? "opacity-50" : ""
              }`}
            />

            <button
            title="Profile Image"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg disabled:opacity-50"
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
        <div className="mt-6 space-y-4 text-center">

          {/* NAME */}
          {isEditing ? (
            <input
            title="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-white text-center outline-none"
            />
          ) : (
            <p className="text-lg font-semibold text-white">
              {user.fullName}
            </p>
          )}

          {/* EMAIL */}
          {isEditing ? (
            <input
            title="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-center outline-none"
            />
          ) : (
            <p className="text-sm text-gray-400">
              {user.email}
            </p>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-3 pt-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Check size={16} /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                <Pencil size={16} /> Edit Profile
              </button>
            )}
          </div>

          {/* USER ID */}
          <div className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-400 break-all">
            User ID:{" "}
            <span className="text-blue-400 font-medium">
              {user._id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
