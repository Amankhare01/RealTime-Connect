import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: ["https://your-vercel-app.vercel.app"],
    credentials: true,
  },
});

const onlineUsers = new Set<string>();

io.on("connection", (socket) => {
  socket.on("user-online", (userId: string) => {
    onlineUsers.add(userId);
    io.emit("online-users", Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((id) => {
      if (socket.handshake.auth?.userId === id) {
        onlineUsers.delete(id);
      }
    });
    io.emit("online-users", Array.from(onlineUsers));
  });
});

server.listen(4000, () => {
  console.log("Socket server running on :4000");
});
