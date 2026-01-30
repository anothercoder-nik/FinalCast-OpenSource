import YouTubeStreamingService from "../../services/youtube.service.js";

export const registerStreamHandlers = (io, socket) => {
  socket.on("youtube-video-chunk", ({ sessionId, chunk }) => {
    if (!sessionId || !chunk) {
      socket.emit("youtube-stream-error", {
        message: "Invalid stream data"
      });
      return;
    }

    try {
      const buffer =
        chunk instanceof Buffer
          ? chunk
          : Buffer.from(chunk.buffer || chunk);

      const sent = YouTubeStreamingService.sendVideoData(sessionId, buffer);

      if (!sent) {
        socket.emit("youtube-stream-error", {
          message: "Stream write failed"
        });
      }
    } catch (err) {
      socket.emit("youtube-stream-error", {
        message: "Video chunk error"
      });
    }
  });

  // Broadcast YouTube stream status to participants
  socket.on("get-youtube-stream-status", ({ sessionId }) => {
    if (!sessionId) {
      socket.emit("youtube-stream-error", {
        message: "Session ID required"
      });
      return;
    }

    const status = YouTubeStreamingService.getStatus(sessionId);
    io.to(sessionId).emit("youtube-stream-status", status);
  });

  // Handle stream status updates and broadcast to room
  socket.on("update-youtube-stream-status", ({ sessionId, status }) => {
    if (!sessionId || !status) {
      socket.emit("youtube-stream-error", {
        message: "Session ID and status required"
      });
      return;
    }

    // Broadcast status update to all participants in the session
    io.to(sessionId).emit("youtube-stream-status-update", {
      sessionId,
      status,
      timestamp: Date.now()
    });
  });
};
