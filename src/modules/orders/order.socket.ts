import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

/**
 * Initializes Socket.IO on the given HTTP server
 */
export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // replace with your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
