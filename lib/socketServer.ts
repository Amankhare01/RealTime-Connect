import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

declare global {
  // eslint-disable-next-line no-var
  var io: IOServer | undefined;
}

export function getSocketServer(server: HTTPServer) {
  if (!global.io) {
    global.io = new IOServer(server, {
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    });

    global.io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // 🔥 sender emits -> server broadcasts
      socket.on("sendMessage", (message) => {
        socket.broadcast.emit("receiveMessage", message);
      });

      // 🔥 user online tracking (optional)
      socket.on("user-online", (userId: string) => {
        (socket as any).userId = userId;

        const onlineUsers = Array.from(
          global.io!.sockets.sockets.values()
        )
          .map((s: any) => s.userId)
          .filter(Boolean);

        global.io!.emit("online-users", onlineUsers);
      });

      socket.on("disconnect", () => {
        const onlineUsers = Array.from(
          global.io!.sockets.sockets.values()
        )
          .map((s: any) => s.userId)
          .filter(Boolean);

        global.io!.emit("online-users", onlineUsers);
        console.log("Socket disconnected:", socket.id);
      });
    });
  }

  return global.io;
}
