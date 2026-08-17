"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";
import type { User, Message } from "@/types/chat";
import { api } from "@/lib/axios";
import { getSocket } from "@/lib/socketClient";
import { Trash2, Share2, X, Loader2 } from "lucide-react";
import Image from "next/image";


export default function ChatContainer({
  activeUser,
  messages,
  setMessages,
  onBack,
  contacts = [],
  isTyping = false,
  isOnline = false,
}: {
  activeUser: User | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onBack?: () => void;
  contacts?: User[];
  isTyping?: boolean;
  isOnline?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Selection states
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForwardModal, setShowForwardModal] = useState(false);

  // Editing state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Pagination states
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const shouldScrollToBottom = useRef(true);

  // ✅ Auto scroll on new message or user change
  useEffect(() => {
    if (shouldScrollToBottom.current) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
    shouldScrollToBottom.current = true;
  }, [messages]);

  // Reset selection states & pagination when active user changes
  useEffect(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
    setShowForwardModal(false);
    setEditingMessage(null);
    setHasMore(true);
    setLoadingOlder(false);
    shouldScrollToBottom.current = true;
  }, [activeUser]);

  // Load older messages (infinite scroll)
  const loadOlderMessages = useCallback(async () => {
    if (!activeUser || !hasMore || loadingOlder || messages.length === 0) return;

    const oldestMsg = messages[0];
    if (!oldestMsg?.createdAt) return;

    setLoadingOlder(true);
    const scrollElem = scrollContainerRef.current;
    const prevScrollHeight = scrollElem ? scrollElem.scrollHeight : 0;
    const prevScrollTop = scrollElem ? scrollElem.scrollTop : 0;

    try {
      const res = await api.get<Message[]>(
        `/api/messages?receiverId=${activeUser._id}&limit=30&before=${encodeURIComponent(
          oldestMsg.createdAt
        )}`
      );

      if (res.data.length < 30) {
        setHasMore(false);
      }

      if (res.data.length > 0) {
        shouldScrollToBottom.current = false;
        setMessages((prev) => [...res.data, ...prev]);

        // Maintain scroll position after DOM update
        requestAnimationFrame(() => {
          if (scrollElem) {
            scrollElem.scrollTop =
              scrollElem.scrollHeight - prevScrollHeight + prevScrollTop;
          }
        });
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [activeUser, hasMore, loadingOlder, messages, setMessages]);

  // Handle scroll for loading older messages
  const handleScroll = () => {
    const elem = scrollContainerRef.current;
    if (!elem) return;

    if (elem.scrollTop <= 40 && hasMore && !loadingOlder) {
      loadOlderMessages();
    }
  };

  if (!activeUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm px-6 py-12 text-center bg-[#f4f6fc] dark:bg-slate-950/10">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-white/5 shadow-sm">
          💬
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-300 text-base">Start a Conversation</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">Select a contact from the sidebar list to view messages and send attachments.</p>
      </div>
    );
  }

  // Toggle select mode
  const handleToggleSelectMode = () => {
    setIsSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  // Toggle selection of a single message
  const handleToggleSelectMessage = (messageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  // React to a message
  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const res = await api.put("/api/messages/reaction", {
        messageId,
        emoji,
      });

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, reactions: res.data.reactions }
            : msg
        )
      );

      // Emit socket event
      const socket = getSocket();
      if (socket.connected) {
        socket.emit("messageReaction", {
          messageId,
          reactions: res.data.reactions,
          receiverId: activeUser._id,
        });
      }
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  // Delete selected messages
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);

    try {
      await api.delete(`/api/messages?messageIds=${idsArray.join(",")}`);

      // Filter locally
      setMessages((prev) => prev.filter((msg) => !selectedIds.has(msg._id)));

      // Emit socket event
      const socket = getSocket();
      if (socket.connected) {
        socket.emit("messageDelete", {
          messageIds: idsArray,
          receiverId: activeUser._id,
        });
      }

      // Exit select mode
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch (err) {
      console.error("Failed to delete messages:", err);
    }
  };

  // Forward selected messages
  const handleForwardSelected = async (targetContactId: string) => {
    if (selectedIds.size === 0) return;
    const messagesToForward = messages.filter((msg) => selectedIds.has(msg._id));

    try {
      for (const msg of messagesToForward) {
        const formData = new FormData();
        formData.append("receiverId", targetContactId);
        if (msg.text) formData.append("text", msg.text);
        if (msg.fileUrl) formData.append("fileUrl", msg.fileUrl);
        if (msg.fileType) formData.append("fileType", msg.fileType);

        const res = await api.post<Message>("/api/messages", formData);

        // Emit socket event for the other user to see immediately
        const socket = getSocket();
        if (socket.connected) {
          socket.emit("sendMessage", res.data);
        }
      }

      // Reset selection mode
      setSelectedIds(new Set());
      setIsSelectMode(false);
      setShowForwardModal(false);
    } catch (err) {
      console.error("Failed to forward messages:", err);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-white dark:bg-slate-950/20 overflow-hidden transition-colors duration-200 relative">
      {/* HEADER */}
      <div className="shrink-0 z-10">
        <ChatHeader
          user={activeUser}
          onBack={onBack}
          isSelectMode={isSelectMode}
          onToggleSelectMode={handleToggleSelectMode}
          isTyping={isTyping}
          isOnline={isOnline}
        />
      </div>

      {/* MESSAGES SCROLL CONTAINER */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 bg-[#f4f6fc] dark:bg-slate-950/30"
      >
        {/* Loading older messages indicator */}
        {loadingOlder && (
          <div className="flex items-center justify-center py-2 text-slate-400 text-xs gap-1.5 animate-in">
            <Loader2 size={14} className="animate-spin text-blue-500" />
            <span>Loading older messages...</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm mt-12 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 py-4 px-6 rounded-2xl max-w-xs mx-auto shadow-sm animate-in">
            👋 No messages yet. Say hello to start the chat!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                isSelectMode={isSelectMode}
                isSelected={selectedIds.has(msg._id)}
                onToggleSelect={handleToggleSelectMessage}
                onReact={handleReact}
                onStartEdit={(msgToEdit) => setEditingMessage(msgToEdit)}
              />
            ))}

            {/* 🔻 Scroll anchor */}
            <div ref={bottomRef} className="pt-2" />
          </div>
        )}
      </div>

      {/* FOOTER INPUT OR SELECTION BAR */}
      <div className="shrink-0 z-10">
        {isSelectMode ? (
          <div className="bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800/80 px-4 py-3 sm:px-6 flex items-center justify-between transition-colors duration-200 pb-safe animate-in">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectMode}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer"
              >
                <X size={18} />
              </button>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                {selectedIds.size} Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowForwardModal(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <Share2 size={14} />
                <span>Forward</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          <ChatInput
            receiverId={activeUser._id}
            setMessages={setMessages}
            editingMessage={editingMessage}
            onCancelEdit={() => setEditingMessage(null)}
          />
        )}
      </div>

      {/* FORWARD MODAL SELECTOR */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-text-primary">Forward To...</h3>
              <button
                onClick={() => setShowForwardModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 py-1 pr-1">
              {contacts.filter((u) => u._id !== activeUser._id).length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">
                  No other contacts available to forward to.
                </div>
              ) : (
                contacts
                  .filter((u) => u._id !== activeUser._id)
                  .map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleForwardSelected(u._id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left cursor-pointer transition-colors duration-150"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-slate-200 dark:bg-slate-800">
                        {u.profilePic ? (
                          <Image
                            src={u.profilePic}
                            alt={u.fullName || u.email}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          (u.fullName?.[0] || u.email?.[0] || "?").toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-text-primary truncate">
                          {u.fullName}
                        </div>
                        <div className="text-[10px] text-text-secondary truncate">
                          {u.email}
                        </div>
                      </div>
                    </button>

                  ))
              )}
            </div>

            <button
              onClick={() => setShowForwardModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors duration-150 cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

