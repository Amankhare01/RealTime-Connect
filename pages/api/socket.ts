import { Server as IOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const onlineUsers = new Set<string>();

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("🔌 Connected:", socket.id);

      socket.on("user-online", (userId: string) => {
        onlineUsers.add(userId);
        io.emit("online-users", Array.from(onlineUsers));
      });

      socket.on("disconnect", () => {
        onlineUsers.forEach((id) => {
          if (id === socket.id) {
            onlineUsers.delete(id);
          }
        });
        io.emit("online-users", Array.from(onlineUsers));
      });
    });
  }

  res.end();
}
