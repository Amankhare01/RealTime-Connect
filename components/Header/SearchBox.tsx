"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/axios";
import type { User } from "@/types/chat";
import Image from "next/image";
import { Search, X, Loader2, User as UserIcon } from "lucide-react";

export default function SearchBox({
  onSelectUser,
}: {
  onSelectUser: (user: User) => void;
}) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get<{ users: User[] }>(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`
        );
        setResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (user: User) => {
    onSelectUser(user);
    setValue("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setValue("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* SEARCH INPUT */}
      <div className="relative flex items-center">
        <Search
          size={16}
          className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none"
        />

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            if (value.trim()) setIsOpen(true);
          }}
          placeholder="Search by email or user ID"
          className="
            w-full
            bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-950/40 dark:hover:bg-slate-950/60
            text-slate-850 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            pl-10
            pr-10
            py-2
            rounded-xl
            border border-slate-200 dark:border-white/5
            outline-none
            focus:bg-white dark:focus:bg-slate-950
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200
            text-sm
          "
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* SEARCH DROPDOWN */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-xs">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span>Searching users...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 px-4 text-center text-slate-400 dark:text-slate-500 text-xs">
              No users found matching &ldquo;{value}&rdquo;
            </div>
          ) : (
            <div className="p-1.5 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Users ({results.length})
              </div>

              {results.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition-colors cursor-pointer group"
                >
                  {/* AVATAR */}
                  <div className="relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shrink-0 shadow-sm bg-slate-200 dark:bg-slate-800">
                    {user.profilePic ? (
                      <Image
                        src={user.profilePic}
                        alt={user.fullName || user.email}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      (user.fullName?.[0] || user.email?.[0] || "?").toUpperCase()
                    )}
                  </div>

                  {/* USER INFO */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user.fullName || user.email}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

