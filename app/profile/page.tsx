"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Check,
  X,
  Pencil,
  Bell,
  ArrowLeft,
  Copy,
  CheckCheck,
  Mail,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useFCM } from "@/hooks/useFCM";
import { api } from "@/lib/axios";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const { permission, requestPermission } = useFCM(user?._id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white">
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <span className="text-gray-400 text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  /* ---------- IMAGE UPDATE ---------- */
  const handleImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warn("Image must be smaller than 5MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("profilepic", file);

    try {
      const res = await api.put("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      toast.success("Profile photo updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      setPreview(null);
    }
  };

  /* ---------- SAVE NAME / EMAIL ---------- */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProfile) return;

    if (!fullName.trim() || !email.trim()) {
      toast.warn("Full name and email cannot be empty");
      return;
    }

    setSavingProfile(true);

    try {
      const res = await api.put("/api/profile", {
        fullName: fullName.trim(),
        email: email.trim(),
      });
      setUser(res.data.user);
      setIsEditing(false);
      toast.success("Profile details updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setIsEditing(false);
  };

  /* ---------- COPY USER ID ---------- */
  const handleCopyId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(user._id);
    setCopiedId(true);
    toast.success("User ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      router.replace("/login");
    } catch (err) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4 sm:p-6 text-white font-sans">
      <div className="w-full max-w-xl flex flex-col gap-6 animate-fade-in-up">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161D2F] border border-white/5 text-sm text-gray-300 hover:text-white hover:bg-[#1E273E] transition shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
              aria-label="Logout"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Profile Card Container */}
        <div className="bg-[#111624] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
          
          {/* Decorative Top Cover Banner */}
          <div className="h-32 sm:h-36 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -bottom-6 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Card Body */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-18 mb-6 gap-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto sm:mx-0">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#111624] bg-[#1A2235] shadow-2xl relative ring-2 ring-blue-500/30">
                  {preview || user.profilePic ? (
                    <Image
                      src={(preview || user.profilePic) as string}
                      alt={user.fullName || "User profile"}
                      fill
                      className={`object-cover ${uploadingImage ? "opacity-40" : ""}`}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-3xl shadow-inner">
                      {(user.fullName?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                  )}

                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Upload Trigger Button */}
                <button
                  type="button"
                  title="Upload profile picture"
                  aria-label="Upload profile picture"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full shadow-lg border-2 border-[#111624] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpdate}
                />
              </div>

              {/* Edit Toggle Action */}
              <div className="flex justify-center sm:justify-end">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                  >
                    <Pencil size={15} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2235] hover:bg-[#222c44] border border-white/5 text-gray-300 text-xs font-semibold transition"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Identity Details */}
            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {user.fullName || "Unnamed User"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-400">
                      <Sparkles size={11} /> Verified
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Mail size={14} className="text-gray-500" />
                    <span>{user.email}</span>
                  </p>
                </div>

                {/* Information Tiles */}
                <div className="grid grid-cols-1 gap-3.5">
                  {/* User ID Card */}
                  <div className="p-4 rounded-2xl bg-[#161D2F] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-400">Account User ID</div>
                        <div className="text-xs font-mono text-blue-400 mt-0.5 break-all">
                          {user._id}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyId}
                      title="Copy User ID"
                      aria-label="Copy User ID"
                      className="p-2.5 rounded-xl hover:bg-[#1E273E] text-gray-400 hover:text-white transition shrink-0 ml-2"
                    >
                      {copiedId ? (
                        <CheckCheck size={18} className="text-emerald-400" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>

                  {/* Notification Settings Tile */}
                  <div className="p-4 rounded-2xl bg-[#161D2F] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
                        <Bell size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Push Notifications</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {permission === "granted"
                            ? "Active — Receiving real-time alerts"
                            : permission === "denied"
                            ? "Blocked in browser settings"
                            : "Enable notifications for message alerts"}
                        </div>
                      </div>
                    </div>

                    <div>
                      {permission === "granted" ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Enabled
                        </span>
                      ) : permission === "denied" ? (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-xs">
                          Disabled
                        </span>
                      ) : (
                        <button
                          onClick={requestPermission}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                        >
                          Turn On
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="p-4 rounded-2xl bg-[#161D2F] border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Security & Privacy</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Your data is encrypted end-to-end and stored securely.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Editable Form Mode */
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Edit Account Details</h3>
                  <p className="text-xs text-gray-400 mb-4">Update your display name and email address</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-300">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      aria-label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      aria-label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0D1424] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={savingProfile}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingProfile && <Loader2 size={16} className="animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

