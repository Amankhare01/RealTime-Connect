"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/axios";
import { getSocket } from "@/lib/socketClient";
import type { Message } from "@/types/chat";
import { Plus, X, Send, Smile, Paperclip, Image as ImageIcon, Music, FileText } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

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
      toast.warn("File must be under 5MB");
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
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sticky bottom-0 bg-bg-base px-2 py-1.5 sm:px-4 sm:py-3 z-10 pb-4">
      {/* UPLOAD PROGRESS */}
      {progress > 0 && progress < 100 && (
        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded mb-2 overflow-hidden">
          <div
            className="h-1 bg-blue-600 rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="mb-2 relative w-28 sm:w-32 animate-fade-in-up">
          <Image
            src={preview}
            alt="preview"
            width={128}
            height={128}
            className="rounded-2xl object-cover border border-border-subtle shadow-md"
          />
          <button
            title="Close"
            aria-label="Remove attached image"
            onClick={resetInput}
            className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 shadow-md hover:bg-slate-800 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 bg-bg-surface px-3 sm:px-4 py-2 rounded-2xl border border-border-subtle shadow-lg">
        {/* ATTACH (+) */}
        <div className="relative shrink-0">
          <button
            title="Attach file"
            aria-label="Attach file"
            onClick={() => setShowMenu((v) => !v)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-secondary hover:text-text-primary transition-colors border border-border-subtle"
          >
            <Plus size={18} />
          </button>

          {showMenu && (
            <div className="absolute bottom-14 left-0 bg-bg-surface border border-border-subtle rounded-2xl shadow-xl w-48 z-20 overflow-hidden animate-fade-in-up">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary flex items-center gap-3 transition-colors text-sm"
                aria-label="Attach image"
              >
                <ImageIcon size={18} className="text-blue-500" /> Image
              </button>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary flex items-center gap-3 transition-colors text-sm"
                aria-label="Attach audio"
              >
                <Music size={18} className="text-purple-500" /> Audio
              </button>
              <button
                onClick={() => docInputRef.current?.click()}
                className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary flex items-center gap-3 transition-colors text-sm"
                aria-label="Attach document"
              >
                <FileText size={18} className="text-emerald-500" /> Document
              </button>
            </div>
          )}
        </div>

        {/* TEXT */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          aria-label="Message text"
          disabled={sending}
          className="
            flex-1
            bg-transparent
            text-text-primary
            px-2 py-1.5
            text-sm sm:text-[15px]
            outline-none
            placeholder-text-secondary
          "
        />

        {/* EXTRA ICONS */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            title="Emoji"
            aria-label="Choose emoji"
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Smile size={18} />
          </button>
          <button
            title="Attach image"
            aria-label="Attach image"
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => imageInputRef.current?.click()}
          >
            <Paperclip size={18} />
          </button>

          {/* SEND */}
          <button
            onClick={sendMessage}
            disabled={sending || (!text.trim() && !file)}
            title="Send"
            aria-label="Send message"
            className="
              ml-1
              bg-blue-600 hover:bg-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              px-3.5 sm:px-4 py-2
              text-sm font-medium
              rounded-xl
              text-white
              flex items-center gap-1.5
              transition-colors
              shadow-sm shadow-blue-500/25
            "
          >
            <Send size={15} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

      {/* HIDDEN INPUTS */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        aria-label="Upload image input"
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
        aria-label="Upload audio input"
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
        aria-label="Upload document input"
        onChange={(e) =>
          e.target.files &&
          handleFileSelect(e.target.files[0], "document")
        }
      />
    </div>
  );
}
