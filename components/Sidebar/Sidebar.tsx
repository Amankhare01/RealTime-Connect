"use client";

import type { User } from "@/types/chat";

type Props = {
  users: User[];
  onlineUsers: string[];
  unreadMap: Record<string, number>;
  onSelect: (user: User) => void;
};

export default function Sidebar({
  users,
  onlineUsers,
  unreadMap,
  onSelect,
}: Props) {
  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      {users.map((user, index) => {
        const unread = unreadMap[user._id] || 0;
        const isOnline = onlineUsers.includes(user._id);

        return (
          <div key={user._id}>
            {/* CONTACT ITEM */}
            <div
              onClick={() => onSelect(user)}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-800"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {(user.fullName?.[0] || user.email?.[0] || "?").toUpperCase()}
                </div>

                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {user.fullName || user.email}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>

              {/* Unread */}
              {unread > 0 && (
                <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                  {unread > 99 ? "99+" : unread}
                </div>
              )}
            </div>

            {/* 🔹 DIVIDER */}
            {index !== users.length - 1 && (
              <div className="mx-3 h-px bg-white/10" />
            )}
          </div>
        );
      })}
    </div>
  );
}

