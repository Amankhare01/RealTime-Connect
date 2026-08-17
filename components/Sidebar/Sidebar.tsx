"use client";

import { useState } from "react";
import type { User } from "@/types/chat";
import Image from "next/image";
import ImageModal from "@/components/common/ImageModal";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <>
      <div className="h-full overflow-y-auto bg-slate-100/40 dark:bg-slate-950/30 py-2 transition-colors duration-200">
        {users.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8 px-4">
            No conversations found
          </div>
        ) : (
          users.map((user, index) => {
            const unread = unreadMap[user._id] || 0;
            const isOnline = onlineUsers.some(
              (id) => String(id) === String(user._id)
            );
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
                    <button
                      type="button"
                      onClick={(e) => {
                        if (user.profilePic) {
                          e.stopPropagation();
                          setPreviewImage(user.profilePic);
                        }
                      }}
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center overflow-hidden text-white font-semibold text-sm shadow-sm
                        ${
                          user.profilePic
                            ? "cursor-pointer hover:ring-2 hover:ring-blue-500 hover:scale-105 active:scale-95 transition-all duration-150 bg-slate-200 dark:bg-slate-800"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600"
                        }
                      `}
                    >
                      {user.profilePic ? (
                        <Image
                          src={user.profilePic}
                          alt={user.fullName || user.email}
                          width={44}
                          height={44}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        (user.fullName?.[0] || user.email?.[0] || "?").toUpperCase()
                      )}
                    </button>

                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-colors duration-200 pointer-events-none z-10" />
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

      {/* FULLSCREEN IMAGE PREVIEW MODAL */}
      {previewImage && (
        <ImageModal
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}

