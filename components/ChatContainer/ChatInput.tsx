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
    if ((!text.trim() && !file) || sending) return;

    try {
      setSending(true);

      const formData = new FormData();
      formData.append("receiverId", receiverId);
      if (text) formData.append("text", text);
      if (file && fileType) {
        formData.append("file", file);
        formData.append("fileType", fileType);
      }

      const res = await api.post<Message>(
        "/api/messages",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(
                Math.round((e.loaded * 100) / e.total)
              );
            }
          },
        }
      );

      setMessages((prev) => [...prev, res.data]);

      const socket = getSocket();
      socket.emit("sendMessage", res.data);

      resetInput();
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
<div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-2 py-1.5 sm:px-3 sm:py-3">
      {/* UPLOAD PROGRESS */}
      {progress > 0 && progress < 100 && (
        <div className="h-1 bg-gray-700 rounded mb-2">
          <div
            className="h-1 bg-blue-600 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="mb-2 relative w-32">
          <Image
            src={preview}
            alt="preview"
            width={128}
            height={128}
            className="rounded-lg object-cover"
          />
          <button
          title="Close"
            onClick={resetInput}
            className="absolute -top-2 -right-2 bg-black rounded-full p-1"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

<div className="flex items-center gap-1.5 sm:gap-2">
        {/* ATTACH */}
        <div className="relative">
          <button
          title="Menu"
            onClick={() => setShowMenu((v) => !v)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-700 text-white">
            <Plus />
          </button>

          {showMenu && (
            <div className="absolute bottom-12 left-0 bg-gray-900 border border-gray-700 rounded-lg shadow-lg w-40 z-10">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white"
              >
                📷 Image
              </button>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white"
              >
                🎵 Audio
              </button>
              <button
                onClick={() => docInputRef.current?.click()}
                className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white"
              >
                📄 Document
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
  bg-gray-700
  text-white
  px-3 py-1.5
  sm:px-4 sm:py-2
  text-sm sm:text-base
  rounded-full
  outline-none
  focus:ring-2
  focus:ring-blue-500
"
        />

        {/* SEND */}
        <button
          onClick={sendMessage}
          disabled={sending}
          className="
  bg-blue-600 hover:bg-blue-700
  px-3 py-1.5
  sm:px-4 sm:py-2
  text-sm sm:text-base
  rounded-full
  text-white
"
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
