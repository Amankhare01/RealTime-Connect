"use client";

import type { User } from "@/types/chat";
import { Search, Filter } from "lucide-react";
import ProfileMenu from "@/components/Header/ProfileMenu";

type Props = {
  users: User[];
  contactsLoading?: boolean;
  onlineUsers: string[];
  unreadMap: Record<string, number>;
  onSelect: (user: User) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
};

export default function Sidebar({
  users,
  contactsLoading = false,
  onlineUsers,
  unreadMap,
  onSelect,
  searchValue = "",
  onSearch,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-bg-surface border-r border-border-subtle w-full md:w-[320px] flex-shrink-0">
      {/* Header & Search */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between text-text-primary">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Chat</h2>
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <ProfileMenu />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="text"
              placeholder="Search friends or contacts..."
              aria-label="Search friends or contacts"
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/80 text-sm text-text-primary placeholder-text-secondary rounded-xl py-2.5 pl-9 pr-4 border border-border-subtle focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
            />
          </div>
          <button
            title="Filter"
            aria-label="Filter conversations"
            className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-colors border border-border-subtle"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Recent</div>

      {/* Contact List / Skeletons / Empty State */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {contactsLoading ? (
          // 🔹 4-5 Skeleton Rows
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse"
            >
              {/* Avatar placeholder */}
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />

              {/* Stacked lines placeholder */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-10" />
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-36" />
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          // 🔹 Empty State
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-text-secondary">
            <p className="text-sm font-medium text-text-primary mb-1">No conversations found</p>
            <p className="text-xs text-text-secondary">
              {searchValue ? "No matching contacts found" : "Search for a user to start chatting"}
            </p>
          </div>
        ) : (
          // 🔹 Real Contact List
          users.map((user) => {
            const unread = unreadMap[user._id] || 0;
            const isOnline = onlineUsers.includes(user._id);

            return (
              <div
                key={user._id}
                onClick={() => onSelect(user)}
                className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group relative"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName || "User"}
                      className="w-11 h-11 rounded-full object-cover border border-border-subtle"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-inner text-sm">
                      {(user.fullName?.[0] || user.email?.[0] || "?").toUpperCase()}
                    </div>
                  )}

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-bg-surface" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user.fullName || user.email}
                    </p>
                    <span className="text-[10px] text-text-secondary">12:05 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-text-secondary truncate">
                      {user.email}
                    </p>
                    {/* Unread */}
                    {unread > 0 && (
                      <div className="ml-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {unread > 99 ? "99+" : unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

