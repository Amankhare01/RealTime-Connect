"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Message } from "@/types/chat";
import ImageModal from "@/components/common/ImageModal";
import Image from "next/image";

export default function MessageBubble({ msg }: { msg: Message }) {
  const user = useAuthStore((s) => s.user);
  const [showImage, setShowImage] = useState(false);

  const isOwn =
    msg.senderId === user?._id ||
    msg.senderId === (user as any)?.id;

  return (
    <>
<div
  className={`flex w-full mb-1 sm:mb-2 ${
    isOwn ? "justify-end" : "justify-start"
  }`}
>

        <div
          className={`
            max-w-[80%] sm:max-w-[75%]
            break-words overflow-hidden
            px-3 py-2 text-sm leading-relaxed
            rounded-2xl shadow-sm
            ${
              isOwn
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-neutral-800 text-white rounded-bl-md"
            }
          `}
        >
          {/* ---------- TEXT ---------- */}
          {msg.text && (
            <p className="whitespace-pre-wrap break-words">
              {msg.text}
            </p>
          )}

          {/* ---------- IMAGE ---------- */}
          {msg.fileType === "image" && msg.fileUrl ? (
            <button
              onClick={() => setShowImage(true)}
              className="mt-2 block max-w-full"
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
                  hover:opacity-90
                "
                unoptimized
              />
            </button>
          ) : null}

          {/* ---------- AUDIO ---------- */}
          {msg.fileType === "audio" && msg.fileUrl ? (
            <audio
              controls
              className="w-full mt-2 rounded-md"
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
                mt-2 flex items-center gap-2
                rounded-lg bg-black/20
                px-3 py-2 text-xs
                hover:bg-black/30 transition
                break-all
              "
            >
              <span>📄</span>
              <span className="underline">
                Open document
              </span>
            </a>
          ) : null}

          {/* ---------- TIMESTAMP ---------- */}
          {msg.createdAt && (
            <div className="mt-1 text-[10px] opacity-60 text-right select-none">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
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
