"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import ChatContainer from "@/components/ChatContainer/ChatContainer";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/lib/socketClient";
import type { User, Message } from "@/types/chat";

export default function ChatPage() {
  const { user, loading, fetchUser } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [lastMessageMap, setLastMessageMap] = useState<Record<string, string>>(
    {}
  );
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  /* ---------- INIT SOCKET SERVER ---------- */
  useEffect(() => {
    fetch("/api/socket");
  }, []);

  /* ---------- AUTH ---------- */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /* ---------- LOAD CONTACTS ---------- */
  useEffect(() => {
    api.get("/api/contacts").then((res) => {
      setUsers(res.data.users);
      setLastMessageMap(res.data.lastMessageMap);
    }).catch((err) => {
      console.error("Failed to load contacts:", err);
    });
  }, []);

  /* ---------- RESET TYPING WHEN ACTIVE USER CHANGES ---------- */
  useEffect(() => {
    setIsPartnerTyping(false);
  }, [activeUser]);

  /* ---------- SOCKET: ONLINE / OFFLINE ---------- */
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    const handleOnlineUsers = (usersList: string[]) => {
      if (Array.isArray(usersList)) {
        setOnlineUsers(usersList.map(String));
      }
    };

    const goOnline = () => {
      socket.emit("user-online", String(user._id));
      socket.emit("get-online-users");
    };

    socket.on("online-users", handleOnlineUsers);
    socket.on("connect", goOnline);

    if (socket.connected) {
      goOnline();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", goOnline);
      socket.off("online-users", handleOnlineUsers);
    };
  }, [user]);

  /* ---------- SOCKET: MESSAGES & REALTIME EVENTS ---------- */
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    const onReceiveMessage = (message: Message) => {
      // 🔥 Update recent chat timestamp
      setLastMessageMap((prev) => ({
        ...prev,
        [message.senderId]: message.createdAt,
      }));

      // 🔥 If this chat is open → append
      if (
        activeUser &&
        (message.senderId === activeUser._id ||
          message.receiverId === activeUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      } else {
        // 🔥 Otherwise mark unread
        setUnreadMap((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));
      }
    };

    const onReceiveReaction = ({ messageId, reactions }: { messageId: string; reactions: Record<string, string> }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    };

    const onReceiveDelete = ({ messageIds }: { messageIds: string[] }) => {
      setMessages((prev) => prev.filter((msg) => !messageIds.includes(msg._id)));
    };

    const onMessageUpdate = ({ messageId, text, isEdited }: { messageId: string; text: string; isEdited: boolean }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text, isEdited } : msg
        )
      );
    };

    const onUserTyping = ({ senderId }: { senderId: string }) => {
      if (activeUser && activeUser._id === senderId) {
        setIsPartnerTyping(true);
      }
    };

    const onUserStopTyping = ({ senderId }: { senderId: string }) => {
      if (activeUser && activeUser._id === senderId) {
        setIsPartnerTyping(false);
      }
    };

    const onMessagesRead = ({ messageIds }: { messageIds?: string[] }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          !messageIds || messageIds.includes(msg._id)
            ? { ...msg, status: "read" }
            : msg
        )
      );
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("messageReaction", onReceiveReaction);
    socket.on("receiveMessageReaction", onReceiveReaction);
    socket.on("messageDelete", onReceiveDelete);
    socket.on("receiveMessageDelete", onReceiveDelete);
    socket.on("messageUpdate", onMessageUpdate);
    socket.on("userTyping", onUserTyping);
    socket.on("userStopTyping", onUserStopTyping);
    socket.on("messagesRead", onMessagesRead);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("messageReaction", onReceiveReaction);
      socket.off("receiveMessageReaction", onReceiveReaction);
      socket.off("messageDelete", onReceiveDelete);
      socket.off("receiveMessageDelete", onReceiveDelete);
      socket.off("messageUpdate", onMessageUpdate);
      socket.off("userTyping", onUserTyping);
      socket.off("userStopTyping", onUserStopTyping);
      socket.off("messagesRead", onMessagesRead);
    };
  }, [user, activeUser]);

  /* ---------- SELECT USER ---------- */
  const handleSelectUser = async (selectedUser: User) => {
    setActiveUser(selectedUser);
    setShowChat(true);

    setUnreadMap((prev) => ({
      ...prev,
      [selectedUser._id]: 0,
    }));

    const res = await api.get<Message[]>(
      `/api/messages?receiverId=${selectedUser._id}`
    );

    setMessages(res.data);

    const lastMsg = res.data.at(-1);
    if (lastMsg) {
      setLastMessageMap((prev) => ({
        ...prev,
        [selectedUser._id]: lastMsg.createdAt,
      }));
    }
  };

  /* ---------- SELECT USER FROM SEARCH DROPDOWN ---------- */
  const handleSelectUserFromSearch = async (selectedUser: User) => {
    setUsers((prev) =>
      prev.some((u) => u._id === selectedUser._id)
        ? prev
        : [selectedUser, ...prev]
    );
    await handleSelectUser(selectedUser);
  };

  const visibleUsers = [...users].sort((a, b) => {
    const tA = lastMessageMap[a._id]
      ? new Date(lastMessageMap[a._id]).getTime()
      : 0;
    const tB = lastMessageMap[b._id]
      ? new Date(lastMessageMap[b._id]).getTime()
      : 0;
    return tB - tA;
  });

  const isActiveUserOnline = activeUser
    ? onlineUsers.some((id) => String(id) === String(activeUser._id))
    : false;

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-[#0b1220] overflow-hidden transition-colors duration-200">
      <Header onSelectUser={handleSelectUserFromSearch} />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto bg-white dark:bg-transparent md:border-x border-slate-300 dark:border-slate-800/60 shadow-sm">
        {/* SIDEBAR */}
        <div
          className={`
            ${showChat ? "hidden" : "block"}
            md:block
            w-full
            md:w-80
            lg:w-96
            flex-shrink-0
            border-r border-slate-300 dark:border-slate-800/60
            h-full
          `}
        >
          <Sidebar
            users={visibleUsers}
            onlineUsers={onlineUsers}
            unreadMap={unreadMap}
            onSelect={handleSelectUser}
            activeUserId={activeUser?._id}
          />
        </div>

        {/* CHAT */}
        <div
          className={`
            ${showChat ? "flex" : "hidden"}
            md:flex
            flex-1
            min-w-0
            h-full
            bg-white dark:bg-slate-950/10
          `}
        >
          <ChatContainer
            activeUser={activeUser}
            messages={messages}
            setMessages={setMessages}
            contacts={users}
            isTyping={isPartnerTyping}
            isOnline={isActiveUserOnline}
            onBack={() => {
              setShowChat(false);
              setActiveUser(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
