"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import ChatContainer from "@/components/ChatContainer/ChatContainer";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/lib/socketClient";
import type { User, Message } from "@/types/chat";
import { useFCM } from "@/hooks/useFCM";
import { toast } from "react-toastify";

export default function ChatPage() {
  const { user, loading, fetchUser } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [lastMessageMap, setLastMessageMap] = useState<Record<string, string>>(
    {}
  );

  useFCM(user?._id);

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
    setContactsLoading(true);
    api
      .get("/api/contacts")
      .then((res) => {
        setUsers(res.data?.users || []);
        setLastMessageMap(res.data?.lastMessageMap || {});
      })
      .catch((err) => {
        console.error("Failed to load contacts", err);
      })
      .finally(() => {
        setContactsLoading(false);
      });
  }, []);

  /* ---------- SOCKET: ONLINE / OFFLINE ---------- */
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    const goOnline = () => {
      socket.emit("user-online", user._id);
    };

    socket.on("connect", goOnline);
    socket.on("online-users", setOnlineUsers);

    // emit immediately
    goOnline();

    return () => {
      socket.off("connect", goOnline);
      socket.off("online-users");
    };
  }, [user]);

  /* ---------- SOCKET: MESSAGES ---------- */
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

    socket.on("receiveMessage", onReceiveMessage);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
    };
  }, [user, activeUser]);

  /* ---------- SEARCH ---------- */
  const handleSearch = async (value: string) => {
    setSearchValue(value);

    if (!value.trim()) return;

    try {
      const res = await api.get(`/api/users/search?q=${value}`);
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error("Failed to search users", err);
    }
  };

  const usersWithChats = new Set(Object.keys(lastMessageMap));

  const visibleUsers = users
    .filter((u) => {
      const v = searchValue.trim().toLowerCase();

      // 🔹 No search → show only users with chats
      if (!v) {
        return usersWithChats.has(u._id);
      }

      // 🔹 Search active → search all users
      return (
        u.email?.toLowerCase().includes(v) ||
        u.fullName?.toLowerCase().includes(v) ||
        u._id?.toLowerCase().includes(v)
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
    setMessagesLoading(true);

    setUnreadMap((prev) => ({
      ...prev,
      [selectedUser._id]: 0,
    }));

    try {
      const res = await api.get<Message[]>(
        `/api/messages?receiverId=${selectedUser._id}`
      );

      setMessages(res.data || []);

      const lastMsg = res.data?.at(-1);
      if (lastMsg) {
        setLastMessageMap((prev) => ({
          ...prev,
          [selectedUser._id]: lastMsg.createdAt,
        }));
      }
    } catch (err) {
      console.error("Failed to load messages", err);
      toast.error("Failed to load messages. Please try again.");
    } finally {
      setMessagesLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[#0A0F1C] overflow-hidden text-white font-sans">
      
      {/* 1. SIDEBAR / CONTACTS */}
      <div
        className={`
          ${showChat ? "hidden" : "block"}
          md:block
          w-full md:w-auto
          flex-shrink-0
        `}
      >
        <Sidebar
          users={visibleUsers}
          contactsLoading={contactsLoading}
          onlineUsers={onlineUsers}
          unreadMap={unreadMap}
          onSelect={handleSelectUser}
          searchValue={searchValue}
          onSearch={handleSearch}
        />
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div
        className={`
          ${showChat ? "flex" : "hidden"}
          md:flex
          flex-1
          min-w-0
          bg-[#0A0F1C]
        `}
      >
        <ChatContainer
          activeUser={activeUser}
          messages={messages}
          messagesLoading={messagesLoading}
          setMessages={setMessages}
          onBack={() => {
            setShowChat(false);
            setActiveUser(null);
          }}
        />
      </div>

    </div>
  );
}
