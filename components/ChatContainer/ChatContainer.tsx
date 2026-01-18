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
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <ChatHeader user={activeUser} onBack={onBack} />

      {/* Messages */}
<div className="flex-1 px-3 py-2 overflow-y-auto">
  {messages.length === 0 ? (
    <div className="text-center text-gray-400 mt-10">
      No messages yet
    </div>
  ) : (
    messages.map((msg) => (
      <MessageBubble key={msg._id} msg={msg} />
    ))
  )}
</div>


      {/* Input */}
      <ChatInput receiverId={activeUser._id} setMessages={setMessages} />
    </div>
  );
}
