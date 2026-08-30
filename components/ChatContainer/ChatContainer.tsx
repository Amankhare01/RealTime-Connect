"use client";

import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";
import type { User, Message } from "@/types/chat";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-toastify";

export default function ChatContainer({
  activeUser,
  messages,
  messagesLoading = false,
  setMessages,
  onBack,
}: {
  activeUser: User | null;
  messages: Message[];
  messagesLoading?: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onBack?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auto scroll on new message
  useEffect(() => {
    if (!messagesLoading) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, messagesLoading]);

  // Handlers with error toasts for silent failures
  const handleDeleteSelected = async (messageIds: string[]) => {
    try {
      await api.delete("/api/messages", { data: { messageIds } });
      setMessages((prev) => prev.filter((m) => !messageIds.includes(m._id)));
      toast.success("Messages deleted");
    } catch (err) {
      console.error("Failed to delete messages", err);
      toast.error("Failed to delete messages. Please try again.");
    }
  };

  const handleForwardSelected = async (targetUserId: string, messageIds: string[]) => {
    try {
      await api.post("/api/messages/forward", { targetUserId, messageIds });
      toast.success("Messages forwarded");
    } catch (err) {
      console.error("Failed to forward messages", err);
      toast.error("Failed to forward messages. Please try again.");
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await api.post(`/api/messages/${messageId}/react`, { emoji });
    } catch (err) {
      console.error("Failed to add reaction", err);
      toast.error("Failed to add reaction. Please try again.");
    }
  };

  const loadOlderMessages = async (beforeTimestamp?: string) => {
    if (!activeUser) return;
    try {
      const url = beforeTimestamp
        ? `/api/messages?receiverId=${activeUser._id}&before=${beforeTimestamp}`
        : `/api/messages?receiverId=${activeUser._id}`;
      const res = await api.get<Message[]>(url);
      setMessages((prev) => [...(res.data || []), ...prev]);
    } catch (err) {
      console.error("Failed to load older messages", err);
      toast.error("Failed to load older messages. Please try again.");
    }
  };

  if (!activeUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-secondary text-sm px-4 text-center bg-bg-base">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-border-subtle flex items-center justify-center text-2xl mb-3 shadow-sm">
          💬
        </div>
        <p className="font-semibold text-text-primary text-base mb-1">Select a conversation</p>
        <p className="text-xs text-text-secondary max-w-xs">
          Choose a contact from the list or search to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-bg-base overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0">
        <ChatHeader user={activeUser} onBack={onBack} />
      </div>

      {/* MESSAGES */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3">
        {messagesLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-text-secondary">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="text-sm font-medium">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary py-16">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-border-subtle flex items-center justify-center text-xl mb-2">
              👋
            </div>
            <p className="text-sm font-medium text-text-primary">No messages yet</p>
            <p className="text-xs text-text-secondary mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                onReact={(emoji) => handleReact(msg._id, emoji)}
                onForward={() => handleForwardSelected(activeUser._id, [msg._id])}
                onDelete={() => handleDeleteSelected([msg._id])}
              />
            ))}

            {/* 🔻 Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="shrink-0">
        <ChatInput
          receiverId={activeUser._id}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
}
