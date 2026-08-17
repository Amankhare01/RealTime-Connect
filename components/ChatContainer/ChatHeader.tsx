"use client";

import { useState } from "react";
import { ArrowLeft, CheckSquare } from "lucide-react";
import type { User } from "@/types/chat";
import Image from "next/image";
import ImageModal from "@/components/common/ImageModal";

export default function ChatHeader({
  user,
  onBack,
  isSelectMode = false,
  onToggleSelectMode,
  isTyping = false,
  isOnline = false,
}: {
  user: User;
  onBack?: () => void;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
  isTyping?: boolean;
  isOnline?: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="h-16 bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850/60 px-4 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile back */}
          {onBack && (
            <button
              title="Back"
              onClick={onBack}
              className="md:hidden p-2 -ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-150 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                if (user.profilePic) setShowPreview(true);
              }}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center overflow-hidden text-white font-semibold text-sm shadow-sm
                ${
                  user.profilePic
                    ? "cursor-pointer hover:ring-2 hover:ring-blue-500 hover:scale-105 active:scale-95 transition-all duration-150 bg-slate-200 dark:bg-slate-800"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 cursor-default"
                }
              `}
            >
              {user.profilePic ? (
                <Image
                  src={user.profilePic}
                  alt={user.fullName || user.email}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                (user.fullName?.[0] || user.email?.[0] || "?").toUpperCase()
              )}
            </button>

            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-colors duration-200 pointer-events-none z-10" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-slate-900 dark:text-slate-100 font-semibold text-sm sm:text-base leading-tight truncate">
              {user.fullName}
            </div>
            {isTyping ? (
              <div className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5 leading-none flex items-center gap-1 animate-pulse">
                <span>typing...</span>
              </div>
            ) : isOnline ? (
              <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 leading-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </div>
            ) : (
              <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-none truncate">
                {user.email}
              </div>
            )}
          </div>
        </div>


        {/* SELECT MODE TOGGLE BUTTON */}
        {onToggleSelectMode && (
          <button
            onClick={onToggleSelectMode}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-sm
              ${
                isSelectMode
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-350 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  : "bg-white dark:bg-slate-950/20 border-slate-200 dark:border-white/10 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }
            `}
          >
            <CheckSquare size={14} />
            <span className="hidden sm:inline">{isSelectMode ? "Cancel Select" : "Select"}</span>
          </button>
        )}
      </div>

      {/* FULLSCREEN IMAGE PREVIEW MODAL */}
      {showPreview && user.profilePic && (
        <ImageModal
          src={user.profilePic}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

