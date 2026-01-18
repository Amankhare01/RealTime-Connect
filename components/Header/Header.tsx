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

  // ⛔ Wait until auth is resolved
  if (loading) return null;

  return (
    <header
      className="
        h-14
        bg-gray-800
        border-b border-gray-700
        flex items-center
        px-3
        gap-3
      "
    >
      {/* LEFT */}
      <div className="text-white font-semibold shrink-0">
        Chat
      </div>

      {/* CENTER SEARCH */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-auto">
        <SearchBox onSearch={onSearch} />
      </div>

      {/* RIGHT PROFILE */}
      {user && (
        <div className="shrink-0 flex items-center">
          <ProfileMenu />
        </div>
      )}
    </header>
  );
}
