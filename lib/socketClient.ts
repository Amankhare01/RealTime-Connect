import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
    
    socket = io(socketUrl, {
      // Use standard '/socket.io' for external server, '/api/socket' for local Next.js API route
      path: socketUrl ? "/socket.io" : "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      withCredentials: true,
    });
  }
  return socket;
}