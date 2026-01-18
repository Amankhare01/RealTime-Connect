"use client";

import type { User } from "@/types/chat";

export default function Sidebar({
  users,
  onlineUsers = [],
  unreadMap = {},
  onSelect,
}: {
  users: User[];
  onlineUsers?: string[];
  unreadMap?: Record<string, number>;
  onSelect: (user: User) => void;
}) {

  return (
    <div
      className="
        flex flex-col
        h-screen md:h-full
        bg-gray-800
        border-r border-gray-700
      "
    >
      {/* HEADER (FIXED HEIGHT) */}
      <div className="px-4 py-3 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-white font-semibold text-sm uppercase">
          Contacts
        </h3>
      </div>

      {/* CONTACT LIST (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {users.map((user) => {
          const isOnline = onlineUsers.includes(user._id);

          return (
            <div
              key={user._id}
              onClick={() => onSelect(user)}
              className="
                flex items-center gap-3
                px-4 py-3
                hover:bg-gray-700
                cursor-pointer
              "
            >
              {/* AVATAR */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user.fullName[0]}
                </div>

                {/* ONLINE DOT */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800
                    ${isOnline ? "bg-green-600" : "bg-gray-700"}`}
                />
              </div>

              {/* USER INFO */}
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {user.fullName}
                </div>
                <div className="text-xs text-gray-400">
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
