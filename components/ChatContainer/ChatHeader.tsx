"use client";

import { ArrowLeft, Phone, Video, MoreVertical, CheckSquare } from "lucide-react";
import type { User } from "@/types/chat";

export default function ChatHeader({
  user,
  onBack,
  onToggleSelectMode,
}: {
  user: User;
  onBack?: () => void;
  onToggleSelectMode?: () => void;
}) {
  return (
    <div className="h-[72px] border-b border-border-subtle bg-bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile back */}
        {onBack && (
          <button
            title="Back"
            aria-label="Go back to conversation list"
            onClick={onBack}
            className="md:hidden text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.fullName || "User"}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-border-subtle"
            />
          ) : (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-inner">
              {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-bg-surface" />
        </div>

        <div>
          <div className="text-text-primary font-semibold text-base sm:text-lg leading-tight">
            {user.fullName || user.email}
          </div>
          <div className="text-xs sm:text-sm text-text-secondary">{user.email}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {onToggleSelectMode && (
          <button
            title="Select messages"
            aria-label="Toggle select messages mode"
            onClick={onToggleSelectMode}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <CheckSquare size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
