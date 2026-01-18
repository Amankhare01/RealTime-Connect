"use client";

import { ArrowLeft } from "lucide-react";
import type { User } from "@/types/chat";

export default function ChatHeader({
  user,
  onBack,
}: {
  user: User;
  onBack?: () => void;
}) {
  return (
    <div className="h-14 border-b border-gray-700 px-4 flex items-center gap-3">
      
      {/* Mobile back */}
      {onBack && (
        <button
        title="Back"
          onClick={onBack}
          className="md:hidden text-gray-300"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
        {user.fullName[0].toUpperCase()}
      </div>

      <div>
        <div className="text-white font-medium">{user.fullName}</div>
        <div className="text-xs text-gray-400">{user.email}</div>
      </div>
    </div>
  );
}
