"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Message } from "@/types/chat";
import ImageModal from "@/components/common/ImageModal";
import Image from "next/image";
import { Check, CheckCheck, Smile, Pencil } from "lucide-react";

export default function MessageBubble({
  msg,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onReact,
  onStartEdit,
}: {
  msg: Message;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
  onStartEdit?: (msg: Message) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [showImage, setShowImage] = useState(false);
  const [showMobileReactions, setShowMobileReactions] = useState(false);

  const isOwn =
    msg.senderId === user?._id ||
    msg.senderId === (user as any)?.id;

  const currentUserId = user?._id || "";

  // Render reaction pill list
  const reactionValues = msg.reactions ? Object.values(msg.reactions) : [];
  const reactionCounts = reactionValues.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div
        className={`group relative flex w-full items-center gap-2 sm:gap-3 mb-2 sm:mb-3 transition-all duration-200 ${
          isOwn ? "justify-end" : "justify-start"
        } ${isSelectMode ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (isSelectMode && onToggleSelect) {
            onToggleSelect(msg._id);
          }
        }}
      >
        {/* CHECKBOX FOR SELECT MODE */}
        {isSelectMode && (
          <div
            className={`flex items-center shrink-0 justify-center w-6 h-6 rounded-full border-2 transition-all duration-150 ${
              isSelected
                ? "bg-blue-600 border-blue-600 text-white scale-105"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            }`}
          >
            {isSelected && (
              <span className="text-[10px] font-bold">✓</span>
            )}
          </div>
        )}

        {/* MESSAGE BUBBLE CONTAINER */}
        <div className={`relative ${isOwn ? "order-1" : "order-2"}`}>
          {/* FLOATING HOVER / MOBILE REACTION BAR */}
          {!isSelectMode && onReact && (
            <div
              className={`
                transition-all duration-200
                absolute -top-9 z-20 flex gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1 shadow-md origin-bottom
                ${showMobileReactions ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100 scale-90 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto"}
                ${isOwn ? "right-0" : "left-0"}
              `}
            >
              {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => {
                const hasReacted = msg.reactions?.[currentUserId] === emoji;
                return (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMobileReactions(false);
                      onReact(msg._id, emoji);
                    }}
                    className={`hover:scale-125 active:scale-95 transition-transform text-sm cursor-pointer p-0.5 rounded-full ${
                      hasReacted ? "bg-blue-50 dark:bg-blue-950/40" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}

              {/* Edit button for message sender */}
              {isOwn && msg.text && onStartEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMobileReactions(false);
                    onStartEdit(msg);
                  }}
                  title="Edit message"
                  className="hover:scale-110 active:scale-95 text-slate-500 hover:text-blue-600 transition-transform p-0.5 ml-1 border-l border-slate-200 dark:border-slate-700 pl-1.5 cursor-pointer"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}

          {/* MAIN MESSAGE CARD */}
          <div
            className={`
              max-w-[280px] sm:max-w-md
              break-words overflow-hidden
              px-3.5 py-2.5 text-sm leading-relaxed
              shadow-sm transition-all duration-200
              ${
                isOwn
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-[0_2px_12px_rgba(59,130,246,0.15)]"
                  : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/5 rounded-2xl rounded-tl-sm shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
              }
              ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950" : ""}
            `}
          >
            {/* ---------- TEXT ---------- */}
            {msg.text && (
              <p className="whitespace-pre-wrap break-words text-sm sm:text-base font-normal">
                {msg.text}
              </p>
            )}

            {/* ---------- IMAGE ---------- */}
            {msg.fileType === "image" && msg.fileUrl ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImage(true);
                }}
                className="mt-2 block max-w-full overflow-hidden rounded-xl border border-black/5 dark:border-white/5 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <Image
                  src={msg.fileUrl}
                  alt="Chat image"
                  width={240}
                  height={240}
                  className="
                    max-w-full h-auto
                    object-cover
                    hover:opacity-95
                    transition-opacity
                  "
                  unoptimized
                />
              </button>
            ) : null}

            {/* ---------- AUDIO ---------- */}
            {msg.fileType === "audio" && msg.fileUrl ? (
              <audio
                controls
                className="w-full mt-2 rounded-xl max-w-[240px] text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <source src={msg.fileUrl} />
              </audio>
            ) : null}

            {/* ---------- DOCUMENT ---------- */}
            {msg.fileType === "document" && msg.fileUrl ? (
              <a
                href={msg.fileUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`
                  mt-2 flex items-center gap-2.5
                  rounded-xl px-3.5 py-2.5 text-xs font-semibold
                  transition-all duration-150
                  break-all shadow-sm border
                  ${
                    isOwn
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/10"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-950/90 text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-white/5"
                  }
                `}
              >
                <span className="text-base">📄</span>
                <span className="underline truncate">
                  View Document
                </span>
              </a>
            ) : null}

            {/* ---------- METADATA FOOTER (TIMESTAMP, EDITED, READ STATUS) ---------- */}
            <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] select-none font-medium tracking-wide ${
              isOwn ? "text-white/75" : "text-slate-400 dark:text-slate-500"
            }`}>
              {msg.isEdited && (
                <span className="italic opacity-80 text-[9px] mr-0.5">(edited)</span>
              )}
              {msg.createdAt && (
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}

              {/* READ RECEIPTS */}
              {isOwn && (
                <span className="inline-flex items-center ml-0.5" title={`Status: ${msg.status || "sent"}`}>
                  {msg.status === "read" ? (
                    <CheckCheck size={13} className="text-cyan-300 dark:text-cyan-400 stroke-[2.5]" />
                  ) : msg.status === "delivered" ? (
                    <CheckCheck size={13} className="text-white/70 stroke-[2]" />
                  ) : (
                    <Check size={13} className="text-white/70 stroke-[2]" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* ---------- EMOJI REACTION PILLS ---------- */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
              {Object.entries(reactionCounts).map(([emoji, count]) => {
                const hasReacted = msg.reactions?.[currentUserId] === emoji;
                return (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact?.(msg._id, emoji);
                    }}
                    className={`
                      flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs shadow-sm transition-transform active:scale-95 cursor-pointer
                      ${
                        hasReacted
                          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-400"
                      }
                    `}
                  >
                    <span>{emoji}</span>
                    <span className="text-[9px]">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* MOBILE REACTION TRIGGER BUTTON (visible only on touch screens / small viewports without select mode) */}
        {!isSelectMode && onReact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileReactions((v) => !v);
            }}
            title="React"
            className="sm:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Smile size={14} />
          </button>
        )}
      </div>

      {/* ---------- IMAGE MODAL ---------- */}
      {showImage && msg.fileUrl ? (
        <ImageModal
          src={msg.fileUrl}
          onClose={() => setShowImage(false)}
        />
      ) : null}
    </>
  );
}


