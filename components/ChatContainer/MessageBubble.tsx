"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Message } from "@/types/chat";
import ImageModal from "@/components/common/ImageModal";
import Image from "next/image";

export default function MessageBubble({ msg }: { msg: Message }) {
  const user = useAuthStore((s) => s.user);
  const [showImage, setShowImage] = useState(false);

  const isOwn = msg.senderId === user?._id;

  return (
    <>
      <div
        className={`flex items-end gap-2 mb-2 ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`
            relative max-w-[78%] px-4 py-2 text-sm leading-relaxed
            rounded-3xl shadow-sm transition-all
            ${
              isOwn
                ? "bg-gradient-to-br from-blue-800 to-blue-800 text-white rounded-br-md"
                : "bg-neutral-800 text-white rounded-bl-md"
            }
          `}
        >
          {/* TEXT */}
          {msg.text && (
            <p className="whitespace-pre-wrap break-words">
              {msg.text}
            </p>
          )}

          {/* IMAGE */}
          {msg.fileType === "image" && msg.fileUrl && (
            <div className="mt-2 overflow-hidden rounded-xl">
              <Image
                src={msg.fileUrl}
                alt="chat image"
                width={120}
                height={50}
                onClick={() => setShowImage(true)}
                className="cursor-pointer object-cover hover:scale-[1.02] transition-transform"
              />
            </div>
          )}

          {/* AUDIO */}
          {msg.fileType === "audio" && msg.fileUrl && (
            <audio
              controls
              className="w-full mt-2 rounded-md"
            >
              <source src={msg.fileUrl} />
            </audio>
          )}

          {/* DOCUMENT */}
          {msg.fileType === "document" && msg.fileUrl && (
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-xs hover:bg-black/30 transition"
            >
              <span>📄</span>
              <span className="underline">Open document</span>
            </a>
          )}

          {/* TIMESTAMP (optional) */}
          {msg.createdAt && (
            <div className="mt-1 text-[10px] opacity-60 text-right">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {showImage && msg.fileUrl && (
        <ImageModal
          src={msg.fileUrl}
          onClose={() => setShowImage(false)}
        />
      )}
    </>
  );
}
