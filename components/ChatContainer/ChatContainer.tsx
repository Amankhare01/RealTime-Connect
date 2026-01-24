"use client";

import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";
import type { User, Message } from "@/types/chat";

export default function ChatContainer({
  activeUser,
  messages,
  setMessages,
  onBack,
}: {
  activeUser: User | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onBack?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auto scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!activeUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-gray-900 overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0">
        <ChatHeader user={activeUser} onBack={onBack} />
      </div>

      {/* MESSAGES */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 sm:px-3 sm:py-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            No messages yet
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {messages.map((msg) => (
              <MessageBubble key={msg._id} msg={msg} />
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
