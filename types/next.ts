import { Server as IOServer } from "socket.io";
import { NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import { Socket } from "net";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};
