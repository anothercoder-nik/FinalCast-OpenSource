import { registerSessionHandlers } from "./handlers/sessionHandler.js";
import { registerWebRTCHandlers } from "./handlers/webrtcHandler.js";
import { registerChatHandlers } from "./handlers/chatHandler.js";
import { registerStreamHandlers } from "./handlers/streamHandler.js";

export const setupSocketHandlers = (io) => {
  const activeSessions = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    registerSessionHandlers(io, socket, activeSessions);
    registerWebRTCHandlers(io, socket);
    registerChatHandlers(io, socket, activeSessions);
    registerStreamHandlers(io, socket);

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
