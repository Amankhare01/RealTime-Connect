"use client";

import type { User } from "@/types/chat";

type Props = {
  users: User[];
  onlineUsers: string[];
  unreadMap: Record<string, number>;
  onSelect: (user: User) => void;
  activeUserId?: string | null;
};

export default function Sidebar({
  users,
  onlineUsers,
  unreadMap,
  onSelect,
  activeUserId,
}: Props) {
  return (
    <div className="h-full overflow-y-auto bg-slate-100/40 dark:bg-slate-950/30 py-2 transition-colors duration-200">
      {users.length === 0 ? (
        <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8 px-4">
          No conversations found
        </div>
      ) : (
        users.map((user, index) => {
          const unread = unreadMap[user._id] || 0;
          const isOnline = onlineUsers.includes(user._id);
          const isActive = activeUserId === user._id;

          return (
            <div key={user._id} className="px-2">
              {/* CONTACT ITEM */}
              <div
                onClick={() => onSelect(user)}
                className={`
                  flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50/90 dark:bg-blue-950/30 text-blue-700 dark:text-blue-350 font-semibold border-l-4 border-blue-600 dark:border-blue-500 rounded-r-xl rounded-l-none"
                      : "hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`
                    w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm
                    bg-gradient-to-r from-blue-600 to-indigo-600
                  `}>
                    {(user.fullName?.[0] || user.email?.[0] || "?").toUpperCase()}
                  </div>

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-50 dark:border-[#0b1220] transition-colors duration-200" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isActive ? "text-blue-950 dark:text-blue-300 font-bold" : "text-slate-900 dark:text-slate-100"}`}>
                    {user.fullName || user.email}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                {/* Unread */}
                {unread > 0 && (
                  <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-xs flex items-center justify-center font-bold shadow-sm">
                    {unread > 99 ? "99+" : unread}
                  </div>
                )}
              </div>

              {/* 🔹 DIVIDER */}
              {index !== users.length - 1 && (
                <div className="my-1.5 h-px bg-slate-200/70 dark:bg-slate-800/30 mx-3" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
