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
};
