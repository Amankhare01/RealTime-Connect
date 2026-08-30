import { Server as IOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/next";
import { verifyJwt } from "@/lib/verifyJwt";

export const config = {
  api: {
    bodyParser: false,
  },
};

const onlineUsers = new Set<string>();
const userSocketMap = new Map<string, Set<string>>();

function getTokenFromHandshake(socket: any): string | null {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    return socket.handshake.auth.token;
  }
  const cookieHeader = socket.handshake.headers?.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c: string) => c.trim());
    const jwtCookie = cookies.find((c: string) => c.startsWith("jwt="));
    if (jwtCookie) {
      return decodeURIComponent(jwtCookie.substring(4));
    }
  }
  return null;
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const allowedOrigin =
      process.env.ALLOWED_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "*";

    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: allowedOrigin,
        credentials: true,
      },
    });

    // JWT Authentication middleware for socket connections
    io.use((socket, next) => {
      try {
        const token = getTokenFromHandshake(socket);
        if (!token) {
          return next(new Error("Authentication error: Missing token"));
        }

        const decoded = verifyJwt(token) as { id: string };
        if (!decoded?.id) {
          return next(new Error("Authentication error: Invalid token"));
        }

        // Store verified user ID on the socket
        socket.data.userId = decoded.id;
        next();
      } catch (err) {
        return next(new Error("Authentication error: Verification failed"));
      }
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      const userId: string = socket.data.userId;
      if (!userId) {
        socket.disconnect();
        return;
      }

      console.log("🔌 Authenticated connection:", socket.id, "User:", userId);

      // Join user room for targeted messages
      socket.join(userId);

      // Add to online users
      const strUserId = String(userId);
      if (!userSocketMap.has(strUserId)) {
        userSocketMap.set(strUserId, new Set());
      }
      userSocketMap.get(strUserId)!.add(socket.id);
      onlineUsers.add(strUserId);

      // Broadcast to all and immediately send to the newly connected socket
      const currentOnline = Array.from(onlineUsers);
      socket.emit("online-users", currentOnline);
      io.emit("online-users", currentOnline);

      // Handle user-online ping / request
      socket.on("user-online", (clientUserId?: string) => {
        const targetId = String(clientUserId || userId);
        if (targetId) {
          onlineUsers.add(targetId);
          if (!userSocketMap.has(targetId)) {
            userSocketMap.set(targetId, new Set());
          }
          userSocketMap.get(targetId)!.add(socket.id);
        }
        io.emit("online-users", Array.from(onlineUsers));
      });

      // Handle explicit get-online-users request
      socket.on("get-online-users", () => {
        socket.emit("online-users", Array.from(onlineUsers));
      });


      // Handle sendMessage event
      socket.on("sendMessage", (message: any) => {
        if (message?.receiverId) {
          io.to(message.receiverId).emit("receiveMessage", message);
        }
      });

      // Handle messageReaction event
      socket.on("messageReaction", (data: any) => {
        if (data?.receiverId) {
          io.to(data.receiverId).emit("receiveMessageReaction", data);
          io.to(data.receiverId).emit("messageReaction", data);
        }
      });

      // Handle messageDelete event
      socket.on("messageDelete", (data: any) => {
        if (data?.receiverId) {
          io.to(data.receiverId).emit("receiveMessageDelete", data);
          io.to(data.receiverId).emit("messageDelete", data);
        }
      });

      // Handle typing events
      socket.on("typing", ({ receiverId }: { receiverId: string }) => {
        if (receiverId) {
          io.to(receiverId).emit("userTyping", { senderId: userId });
        }
      });

      socket.on("stop-typing", ({ receiverId }: { receiverId: string }) => {
        if (receiverId) {
          io.to(receiverId).emit("userStopTyping", { senderId: userId });
        }
      });

      // Handle message edit/update event
      socket.on("messageUpdate", (data: any) => {
        if (data?.receiverId) {
          io.to(data.receiverId).emit("messageUpdate", data);
        }
      });

      // Handle read receipts
      socket.on("messageRead", (data: any) => {
        if (data?.senderId) {
          io.to(data.senderId).emit("messagesRead", {
            readerId: userId,
            messageIds: data.messageIds,
          });
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        const userSockets = userSocketMap.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            userSocketMap.delete(userId);
            onlineUsers.delete(userId);
          }
        }
        io.emit("online-users", Array.from(onlineUsers));
      });
    });
  }

  res.end();
}

