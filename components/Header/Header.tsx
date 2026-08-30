"use client";

import SearchBox from "./SearchBox";
import ProfileMenu from "./ProfileMenu";
import { useAuthStore } from "@/store/authStore";

export default function Header({
  onSearch,
}: {
  onSearch: (value: string) => void;
}) {
  const { user, loading } = useAuthStore();

  // Skeleton state while auth resolves (avoids layout shift)
  if (loading) {
    return (
      <header className="h-16 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 gap-3 shrink-0">
        {/* Brand placeholder */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
          <div className="w-20 h-5 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse hidden sm:block" />
        </div>

        {/* Search placeholder */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-auto">
          <div className="w-full h-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Profile placeholder */}
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
      </header>
    );
  }

  return (
    <header className="h-16 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 gap-3 shrink-0">
      {/* Brand logo & mark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/25 border border-white/10">
          C
        </div>
        <span className="font-bold text-lg text-text-primary tracking-tight hidden sm:inline-block">
          Connect
        </span>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-auto">
        <SearchBox onSearch={onSearch} />
      </div>

      {/* Right Profile */}
      {user && (
        <div className="shrink-0 flex items-center">
          <ProfileMenu />
        </div>
      )}
    </header>
  );
}
