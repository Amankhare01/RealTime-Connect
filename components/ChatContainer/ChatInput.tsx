import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "@/lib/axios";
import { getSocket } from "@/lib/socketClient";
import { useAuthStore } from "@/store/authStore";
import type { Message } from "@/types/chat";
import { Plus, X, Loader2, AlertCircle, RefreshCw, Check } from "lucide-react";
import Image from "next/image";

type FileType = "image" | "audio" | "document";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ChatInput({
  receiverId,
  setMessages,
  editingMessage,
  onCancelEdit,
}: {
  receiverId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Sync editing message
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      setFile(null);
      setFileType(null);
      setPreview(null);
      setUploadError(null);
    }
  }, [editingMessage]);

  /* ---------- CLEAN PREVIEW URL ---------- */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ---------- TYPING EMITTER ---------- */
  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      const socket = getSocket();
      if (socket.connected) {
        socket.emit("stop-typing", { receiverId });
      }
    }
  }, [receiverId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    setUploadError(null);

    const socket = getSocket();
    if (!socket.connected) return;

    if (!isTypingRef.current && val.trim().length > 0) {
      isTypingRef.current = true;
      socket.emit("typing", { receiverId });
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  /* ---------- FILE SELECT ---------- */
  const handleFileSelect = (selectedFile: File, type: FileType) => {
    setUploadError(null);
    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError("File size must be under 5MB");
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
    setUploadError(null);
    stopTyping();
  };

  /* ---------- SEND OR EDIT MESSAGE ---------- */
  const sendMessage = async () => {
    if ((!text || !text.trim()) && !file) return;
    if (sending) return;

    setUploadError(null);
    stopTyping();

    // Handling message editing
    if (editingMessage) {
      setSending(true);
      try {
        const res = await api.put<Message>(`/api/messages/${editingMessage._id}`, {
          text: text.trim(),
        });

        // Update local message list
        setMessages((prev) =>
          prev.map((msg) => (msg._id === editingMessage._id ? res.data : msg))
        );

        // Emit update over socket
        const socket = getSocket();
        if (socket.connected) {
          socket.emit("messageUpdate", {
            messageId: editingMessage._id,
            text: res.data.text,
            isEdited: true,
            receiverId,
          });
        }

        resetInput();
        if (onCancelEdit) onCancelEdit();
      } catch (err) {
        console.error("Edit failed", err);
        setUploadError("Failed to edit message. Please try again.");
      } finally {
        setSending(false);
      }
      return;
    }

    // Optimistic message creation
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      senderId: user?._id || "",
      receiverId,
      text: text.trim() || undefined,
      fileType: fileType || undefined,
      fileUrl: preview || undefined,
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    // Optimistic update to UI
    setMessages((prev) => [...prev, tempMessage]);
    setSending(true);

    try {
      const formData = new FormData();
      formData.append("receiverId", receiverId);

      if (text.trim()) formData.append("text", text.trim());
      if (file && fileType) {
        formData.append("file", file);
        formData.append("fileType", fileType);
      }

      const res = await api.post<Message>("/api/messages", formData);

      // Reconcile optimistic message with server response
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? res.data : msg))
      );

      // Emit socket event to receiver
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
      // Remove failed optimistic message and show error state with retry option
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setUploadError("Failed to send message. Please click retry.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 px-3 py-3 sm:px-5 sm:py-4 transition-colors duration-200 pb-safe">
      {/* EDITING BANNER */}
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl px-3 py-1.5 text-xs text-blue-700 dark:text-blue-300 animate-in">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold">Editing message:</span>
            <span className="truncate italic max-w-xs">{editingMessage.text}</span>
          </div>
          <button
            onClick={() => {
              resetInput();
              if (onCancelEdit) onCancelEdit();
            }}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* UPLOAD ERROR BANNER */}
      {uploadError && (
        <div className="mb-2 flex items-center justify-between bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl px-3 py-1.5 text-xs text-red-600 dark:text-red-400 animate-in">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} />
            <span>{uploadError}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={sendMessage}
              className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 rounded-lg font-semibold cursor-pointer"
            >
              <RefreshCw size={11} /> Retry
            </button>
            <button
              onClick={() => setUploadError(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
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
        {/* ATTACH (Hidden in edit mode) */}
        {!editingMessage && (
          <div className="relative">
            <button
              title="Attach File"
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
        )}

        {/* TEXT INPUT */}
        <input
          value={text}
          onChange={handleTextChange}
          onBlur={stopTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
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

        {/* SEND / SAVE BUTTON */}
        <button
          onClick={sendMessage}
          disabled={sending || (!text.trim() && !file)}
          className={`
            px-4 py-2.5 sm:px-5
            font-semibold text-sm sm:text-base
            rounded-xl text-white shadow-sm
            transition-all duration-150 active:scale-[0.97] flex items-center gap-1.5
            ${
              sending || (!text.trim() && !file)
                ? "bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer shadow-blue-500/10 hover:shadow-blue-500/25"
            }
          `}
        >
          {sending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="hidden sm:inline">{editingMessage ? "Saving..." : "Sending..."}</span>
            </>
          ) : editingMessage ? (
            <>
              <Check size={16} />
              <span>Save</span>
            </>
          ) : (
            <span>Send</span>
          )}
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

