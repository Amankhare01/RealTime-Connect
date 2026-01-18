"use client";

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
  if (!activeUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
        Select a user to start chatting
      </div>
    );
  }

  return (
<div className="flex-1 overflow-y-auto overscroll-contain">

      {/* Header */}
      <ChatHeader user={activeUser} onBack={onBack} />

      {/* Messages */}
      <div
        className="
          flex-1
          overflow-y-auto
          px-2
          py-1
          sm:px-3
          sm:py-2
        "
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            No messages yet
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {messages.map((msg) => (
              <MessageBubble key={msg._id} msg={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
<ChatInput
  receiverId={activeUser._id}
  setMessages={setMessages}
/>

    </div>
  );
}
