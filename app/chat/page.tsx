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
  const [searchValue, setSearchValue] = useState("");

  // 🔥 unread + recent chat tracking
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [lastMessageMap, setLastMessageMap] =
    useState<Record<string, string>>({});

  const socket = getSocket();

  /* ---------- AUTH ---------- */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /* ---------- LOAD USERS ---------- */
  useEffect(() => {
    api.get<User[]>("/api/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  useEffect(() => {
  api.get("/api/contacts").then((res) => {
    setUsers(res.data.users);
    setLastMessageMap(res.data.lastMessageMap);
  });
}, []);


  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!user) return;

    socket.emit("user-online", user._id);

    socket.on("online-users", (ids: string[]) => {
      setOnlineUsers(ids);
    });

    socket.on("receiveMessage", (message: Message) => {
      // recent chat
      setLastMessageMap((prev) => ({
        ...prev,
        [message.senderId]: message.createdAt,
      }));

      // message handling
      if (message.senderId === activeUser?._id) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreadMap((prev) => ({
          ...prev,
          [message.senderId]:
            (prev[message.senderId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("online-users");
      socket.off("receiveMessage");
    };
  }, [user, socket, activeUser]);

  if (loading || !user) return null;

  /* ---------- SEARCH ---------- */
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  /* ---------- USERS WITH CHAT ---------- */
  const usersWithChats = new Set(Object.keys(lastMessageMap));

  /* ---------- FINAL CONTACT LIST ---------- */
  const visibleUsers = [...users]
    .filter((u) => {
      const isSearching = searchValue.trim().length > 0;
      const hasChat = usersWithChats.has(u._id);

      if (!isSearching) return hasChat;

      const v = searchValue.toLowerCase();
      return (
        u.email.toLowerCase().includes(v) ||
        u._id.toLowerCase().includes(v)
      );
    })
    .sort((a, b) => {
      const tA = lastMessageMap[a._id]
        ? new Date(lastMessageMap[a._id]).getTime()
        : 0;
      const tB = lastMessageMap[b._id]
        ? new Date(lastMessageMap[b._id]).getTime()
        : 0;
      return tB - tA;
    });

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

  const handleBackToContacts = () => {
    setShowChat(false);
    setActiveUser(null);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-900 overflow-hidden">
      <Header onSearch={handleSearch} />

      <div className="flex flex-1 overflow-hidden">
        {/* CONTACT LIST */}
        <div
          className={`${showChat ? "hidden" : "block"} md:block w-full md:w-72`}
        >
          <Sidebar
            users={visibleUsers}
            onlineUsers={onlineUsers}
            unreadMap={unreadMap}
            onSelect={handleSelectUser}
          />
        </div>

        {/* CHAT */}
        <div className={`${showChat ? "flex" : "hidden"} md:flex flex-1`}>
          <ChatContainer
            activeUser={activeUser}
            messages={messages}
            setMessages={setMessages}
            onBack={handleBackToContacts}
          />
        </div>
      </div>
    </div>
  );
}
