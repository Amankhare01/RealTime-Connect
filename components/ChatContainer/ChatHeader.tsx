"use client";

import { ArrowLeft, CheckSquare } from "lucide-react";
import type { User } from "@/types/chat";

export default function ChatHeader({
  user,
  onBack,
  isSelectMode = false,
  onToggleSelectMode,
}: {
  user: User;
  onBack?: () => void;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
}) {
  return (
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0">
          {user.fullName[0].toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="text-slate-900 dark:text-slate-100 font-semibold text-sm sm:text-base leading-tight truncate">
            {user.fullName}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-none truncate">
            {user.email}
          </div>
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
  );
}
