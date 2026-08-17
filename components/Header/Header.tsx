"use client";

import SearchBox from "./SearchBox";
import ProfileMenu from "./ProfileMenu";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import type { User } from "@/types/chat";

export default function Header({
  onSelectUser,
}: {
  onSelectUser: (user: User) => void;
}) {
  const { user, loading } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  // ⛔ Wait until auth is resolved
  if (loading) return null;

  return (
    <header
      className="
        h-16
        bg-white dark:bg-slate-900/60
        border-b border-slate-300 dark:border-slate-800/80
        backdrop-blur-md
        flex items-center
        justify-between
        px-4 sm:px-6
        gap-4
        transition-all duration-200
        z-40
      "
    >
      {/* LEFT */}
      <div className="text-slate-900 dark:text-white font-bold text-lg tracking-tight shrink-0">
        Connect
      </div>

      {/* CENTER SEARCH */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-auto">
        <SearchBox onSelectUser={onSelectUser} />
      </div>

      {/* RIGHT PROFILE & THEME TOGGLE */}
      <div className="shrink-0 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div className="flex items-center">
            <ProfileMenu />
          </div>
        )}
      </div>
    </header>
  );
}

