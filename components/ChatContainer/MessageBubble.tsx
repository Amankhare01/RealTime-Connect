"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Message } from "@/types/chat";
import ImageModal from "@/components/common/ImageModal";
import Image from "next/image";
import { Smile, Forward, Trash2 } from "lucide-react";

export default function MessageBubble({
  msg,
  onReact,
  onForward,
  onDelete,
}: {
  msg: Message;
  onReact?: (emoji: string) => void;
  onForward?: () => void;
  onDelete?: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [showImage, setShowImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwn =
    msg.senderId === user?._id ||
    msg.senderId === (user as any)?.id;

  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  return (
    <>
      <div
        className={`flex w-full mb-3 sm:mb-4 group relative ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        {/* ACTION BUTTONS (Hover) */}
        <div
          className={`
            absolute -top-3 z-10 hidden group-hover:flex items-center gap-1
            bg-bg-surface border border-border-subtle rounded-full px-1.5 py-0.5 shadow-md
            ${isOwn ? "right-2" : "left-2"}
          `}
        >
          {onReact && (
            <div className="relative">
              <button
                title="React"
                aria-label="React to message"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Smile size={14} />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full mb-1 left-0 bg-bg-surface border border-border-subtle rounded-2xl shadow-xl p-1.5 flex gap-1 z-20">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="hover:scale-125 transition-transform text-base p-1"
                      aria-label={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {onForward && (
            <button
              title="Forward"
              aria-label="Forward message"
              onClick={onForward}
              className="p-1 text-text-secondary hover:text-text-primary rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Forward size={14} />
            </button>
          )}

          {onDelete && isOwn && (
            <button
              title="Delete"
              aria-label="Delete message"
              onClick={onDelete}
              className="p-1 text-text-secondary hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div
          className={`
            max-w-[85%] sm:max-w-[70%]
            break-words overflow-hidden
            px-3.5 py-2 text-[14.5px] leading-relaxed
            shadow-sm
            ${
              isOwn
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-blue-500/10"
                : "bg-slate-100 dark:bg-slate-800/90 text-text-primary rounded-2xl rounded-tl-sm border border-border-subtle"
            }
          `}
        >
          {/* ---------- IMAGE ---------- */}
          {msg.fileType === "image" && msg.fileUrl ? (
            <button
              onClick={() => setShowImage(true)}
              className="mt-0.5 mb-2 block max-w-full"
              aria-label="View full image"
            >
              <Image
                src={msg.fileUrl}
                alt="Chat image"
                width={240}
                height={240}
                className="
                  rounded-xl
                  max-w-full h-auto
                  object-cover
                  cursor-pointer
                  hover:opacity-90 transition-opacity
                "
                unoptimized
              />
            </button>
          ) : null}

          {/* ---------- AUDIO ---------- */}
          {msg.fileType === "audio" && msg.fileUrl ? (
            <audio
              controls
              className="w-full mt-1 rounded-md mb-2"
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
              className="
                mt-0.5 mb-2 flex items-center gap-2
                rounded-lg bg-black/10 dark:bg-black/30
                px-3 py-2 text-sm
                hover:bg-black/20 dark:hover:bg-black/40 transition
                break-all
              "
            >
              <span>📄</span>
              <span className="underline">
                Open document
              </span>
            </a>
          ) : null}

          {/* ---------- TEXT & TIMESTAMP (Flex-wrap to prevent overlap) ---------- */}
          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-0.5">
            {msg.text && (
              <div className="whitespace-pre-wrap break-words min-w-0 flex-1">
                {msg.text}
              </div>
            )}

            {msg.createdAt && (
              <div
                className={`text-[10px] font-medium tracking-wide flex items-center gap-1 shrink-0 self-end ml-auto ${
                  isOwn ? "text-blue-100" : "text-text-secondary"
                }`}
              >
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isOwn && (
                  <span className="opacity-90 font-mono text-[9px]">✓✓</span>
                )}
              </div>
            )}
          </div>
        </div>
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
