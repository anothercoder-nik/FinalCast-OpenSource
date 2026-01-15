import aiService from "../../services/aiService.js";

const generateMessageId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const registerChatHandlers = (io, socket, activeSessions) => {
  // Send chat message
  socket.on("send-message", (data) => {
    const { roomId, message, userName, userId } = data || {};

    if (!roomId || !message || !message.trim() || !userName) {
      return;
    }

    const session = activeSessions.get(roomId);
    if (!session || session.sessionStatus !== "live") {
      socket.emit("error", { message: "Session not live" });
      return;
    }

    const msg = {
      id: generateMessageId(),
      message: message.trim(),
      userName,
      userId,
      timestamp: new Date()
    };

    io.to(roomId).emit("receive-message", msg);
  });

  // Participant mute / video updates
  socket.on("participant-status-update", (data) => {
    const { roomId, userId, status } = data || {};

    if (!roomId || !userId || !status) return;

    socket.to(roomId).emit("participant-status-changed", {
      userId,
      status,
      timestamp: new Date()
    });
  });

  // Host actions
  socket.on("host-action", (data) => {
    const { roomId, action, targetUserId } = data || {};
    const session = activeSessions.get(roomId);

    if (!session || session.hostId !== socket.userId) {
      socket.emit("error", { message: "Not allowed" });
      return;
    }

    io.to(roomId).emit("host-action-broadcast", {
      action,
      targetUserId,
      hostId: socket.userId,
      hostName: socket.userName,
      timestamp: new Date()
    });

    if (action === "kick") {
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (!roomSockets) return;

      for (const id of roomSockets) {
        const s = io.sockets.sockets.get(id);
        if (s && s.userId === targetUserId) {
          s.emit("kicked-from-session", {
            message: `Removed by ${socket.userName}`
          });
          s.leave(roomId);
          break;
        }
      }
    }
  });

  // Typing indicators
  socket.on("typing-start", ({ roomId }) => {
    if (!roomId) return;

    socket.to(roomId).emit("user-typing", {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: true
    });
  });

  socket.on("typing-stop", ({ roomId }) => {
    if (!roomId) return;

    socket.to(roomId).emit("user-typing", {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: false
    });
  });

  // AI context analysis
  socket.on("ai-analyze-context", async ({ context }) => {
    try {
      const suggestions = aiService.generateSuggestionsFromContext
        ? await aiService.generateSuggestionsFromContext(context || "")
        : await aiService.generateSuggestions();

      socket.emit("ai-suggestions", suggestions);
    } catch (err) {
      // silently fail
    }
  });

  // Manual AI trigger
  socket.on("ai-generate-ideas", async () => {
    try {
      const suggestions = await aiService.generateSuggestionsFromContext("");
      socket.emit("ai-suggestions", suggestions);
    } catch (err) {
      socket.emit("error", { message: "AI failed" });
    }
  });
};
