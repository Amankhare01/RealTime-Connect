"use client";

import { MessageSquare } from "lucide-react";
import ProfileMenu from "@/components/Header/ProfileMenu";

export default function LeftRail() {
  return (
    <div className="w-16 md:w-[72px] h-full bg-bg-surface border-r border-border-subtle flex flex-col items-center py-6 flex-shrink-0">
      {/* Nav Icons */}
      <div className="flex flex-col gap-6 w-full items-center mt-4">
        <button
          title="Messages"
          aria-label="Messages"
          className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-border-subtle"
        >
          <MessageSquare size={22} fill="currentColor" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-md" />
        </button>
      </div>

      {/* Profile at bottom */}
      <div className="mt-auto">
        <ProfileMenu />
      </div>
    </div>
  );
}
