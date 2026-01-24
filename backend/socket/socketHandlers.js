import { registerSessionHandlers } from "./handlers/sessionHandler.js";
import { registerWebRTCHandlers } from "./handlers/webrtcHandler.js";
import { registerChatHandlers } from "./handlers/chatHandler.js";
import { registerStreamHandlers } from "./handlers/streamHandler.js";
import memoryManager from "../services/memoryManager.service.js";

export const setupSocketHandlers = (io) => {
  const activeSessions = new Map();
  const socketConnections = new Map();

  // Cleanup stale sessions periodically
  const cleanupInterval = memoryManager.trackInterval(
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of activeSessions.entries()) {
        if (now - session.lastActivity > 30 * 60 * 1000) { // 30 minutes
          console.log(`Cleaning up stale session: ${sessionId}`);
          activeSessions.delete(sessionId);
        }
      }
    }, 5 * 60 * 1000) // Check every 5 minutes
  );

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    // Track socket connection
    memoryManager.trackConnection(socket.id, socket);
    socketConnections.set(socket.id, {
      connectedAt: Date.now(),
      lastActivity: Date.now()
    });

    // Update activity on any event
    const originalEmit = socket.emit;
    socket.emit = function(...args) {
      memoryManager.updateConnectionActivity(socket.id);
      const conn = socketConnections.get(socket.id);
      if (conn) conn.lastActivity = Date.now();
      return originalEmit.apply(this, args);
    };

    registerSessionHandlers(io, socket, activeSessions);
    registerWebRTCHandlers(io, socket);
    registerChatHandlers(io, socket, activeSessions);
    registerStreamHandlers(io, socket);

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    socket.on("disconnect", (reason) => {
      console.log("User disconnected:", socket.id, "Reason:", reason);
      
      // Cleanup socket resources
      memoryManager.removeConnection(socket.id);
      socketConnections.delete(socket.id);
      
      // Remove from all sessions
      for (const [sessionId, session] of activeSessions.entries()) {
        if (session.participants && session.participants.has(socket.id)) {
          session.participants.delete(socket.id);
          socket.to(sessionId).emit('participant-left', {
            socketId: socket.id,
            participantCount: session.participants.size
          });
        }
      }
      
      // Remove all listeners to prevent memory leaks
      socket.removeAllListeners();
    });
  });
  
  // Add cleanup task for graceful shutdown
  memoryManager.addCleanupTask(async () => {
    console.log('Cleaning up socket connections...');
    for (const [socketId] of socketConnections) {
      memoryManager.removeConnection(socketId);
    }
    activeSessions.clear();
    socketConnections.clear();
  });
};
