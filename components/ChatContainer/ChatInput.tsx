"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/axios";
import { getSocket } from "@/lib/socketClient";
import type { Message } from "@/types/chat";
import { Plus, X } from "lucide-react";
import Image from "next/image";

type FileType = "image" | "audio" | "document";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ChatInput({
  receiverId,
  setMessages,
}: {
  receiverId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [sending, setSending] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  /* ---------- CLEAN PREVIEW URL ---------- */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ---------- FILE SELECT ---------- */
  const handleFileSelect = (selectedFile: File, type: FileType) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("File must be under 5MB");
      return;
    }

    setFile(selectedFile);
    setFileType(type);
    setShowMenu(false);

    if (type === "image") {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  /* ---------- RESET ---------- */
  const resetInput = () => {
    setText("");
    setFile(null);
    setFileType(null);
    setPreview(null);
    setProgress(0);
  };

  /* ---------- SEND MESSAGE ---------- */
const sendMessage = async () => {
  if ((!text || !text.trim()) && !file) return;
  if (sending) return;

  setSending(true);

  try {
    const formData = new FormData();
    formData.append("receiverId", receiverId);

    if (text.trim()) formData.append("text", text);
    if (file && fileType) {
      formData.append("file", file);
      formData.append("fileType", fileType);
    }

    const res = await api.post<Message>("/api/messages", formData);

    // ✅ optimistic update
    setMessages((prev) => [...prev, res.data]);

    // ✅ emit AFTER save
    const socket = getSocket();

    if (socket.connected) {
      socket.emit("sendMessage", res.data);
    } else {
      socket.once("connect", () => {
        socket.emit("sendMessage", res.data);
      });
    }

    resetInput();
  } catch (err) {
    console.error("Send failed", err);
  } finally {
    setSending(false);
  }
};


  return (
    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 px-3 py-3 sm:px-5 sm:py-4 transition-colors duration-200 pb-safe">
      {/* UPLOAD PROGRESS */}
      {progress > 0 && progress < 100 && (
        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="mb-3 relative w-24 h-24 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-md animate-in">
          <Image
            src={preview}
            alt="preview"
            fill
            className="object-cover"
          />
          <button
            title="Close"
            onClick={resetInput}
            className="absolute top-1 right-1 bg-slate-900/80 hover:bg-slate-950 text-white rounded-full p-1 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* ATTACH */}
        <div className="relative">
          <button
            title="Menu"
            onClick={() => setShowMenu((v) => !v)}
            className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-150 cursor-pointer flex items-center justify-center"
          >
            <Plus size={20} />
          </button>

          {showMenu && (
            <div className="absolute bottom-14 left-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl w-44 z-20 py-1.5 overflow-hidden animate-in">
              <button
                onClick={() => {
                  imageInputRef.current?.click();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-200 transition-colors duration-150 cursor-pointer flex items-center gap-2"
              >
                <span>📷</span> Image
              </button>
              <button
                onClick={() => {
                  audioInputRef.current?.click();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-200 transition-colors duration-150 cursor-pointer flex items-center gap-2"
              >
                <span>🎵</span> Audio
              </button>
              <button
                onClick={() => {
                  docInputRef.current?.click();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-200 transition-colors duration-150 cursor-pointer flex items-center gap-2"
              >
                <span>📄</span> Document
              </button>
            </div>
          )}
        </div>

        {/* TEXT */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          disabled={sending}
          className="
            flex-1
            bg-slate-100 focus:bg-white dark:bg-slate-950 dark:focus:bg-slate-950
            text-slate-850 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            px-4 py-2.5
            text-sm sm:text-base
            rounded-xl
            border border-transparent dark:border-white/5
            outline-none
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200
          "
        />

        {/* SEND */}
        <button
          onClick={sendMessage}
          disabled={sending}
          className={`
            px-4 py-2.5 sm:px-5
            font-semibold text-sm sm:text-base
            rounded-xl text-white shadow-sm
            transition-all duration-150 active:scale-[0.97]
            ${
              sending
                ? "bg-slate-400 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer shadow-blue-500/10 hover:shadow-blue-500/25"
            }
          `}
        >
          Send
        </button>
      </div>

      {/* HIDDEN INPUTS */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) =>
          e.target.files &&
          handleFileSelect(e.target.files[0], "image")
        }
      />

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) =>
          e.target.files &&
          handleFileSelect(e.target.files[0], "audio")
        }
      />

      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        hidden
        onChange={(e) =>
          e.target.files &&
          handleFileSelect(e.target.files[0], "document")
        }
      />
    </div>
  );
}
