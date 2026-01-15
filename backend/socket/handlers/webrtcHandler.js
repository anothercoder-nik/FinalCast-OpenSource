// find socket using userId
const getSocketByUserId = (io, userId) => {
  for (const socket of io.sockets.sockets.values()) {
    if (socket.userId === userId) return socket;
  }
  return null;
};

export const registerWebRTCHandlers = (io, socket) => {

  socket.on("webrtc-offer", ({ targetSocketId, offer }) => {
    if (!targetSocketId || !offer) return;

    const target = io.sockets.sockets.get(targetSocketId);
    if (!target) return;

    target.emit("webrtc-offer", {
      senderSocketId: socket.id,
      offer
    });
  });

  socket.on("webrtc-answer", ({ targetSocketId, answer }) => {
    if (!targetSocketId || !answer) return;

    const target = io.sockets.sockets.get(targetSocketId);
    if (!target) return;

    target.emit("webrtc-answer", {
      senderSocketId: socket.id,
      answer
    });
  });

  socket.on("webrtc-ice-candidate", ({ targetSocketId, candidate }) => {
    if (!targetSocketId || !candidate) return;

    const target = io.sockets.sockets.get(targetSocketId);
    if (!target) return;

    target.emit("webrtc-ice-candidate", {
      senderSocketId: socket.id,
      candidate
    });
  });

  socket.on("webrtc-connection-state", ({ targetSocketId, connectionState }) => {
    const target = io.sockets.sockets.get(targetSocketId);
    if (target) {
      target.emit("webrtc-connection-state", {
        senderSocketId: socket.id,
        state: connectionState
      });
    }

    if (socket.roomId) {
      socket.to(socket.roomId).emit("peer-connection-update", {
        userId: socket.userId,
        state: connectionState
      });
    }
  });

  socket.on("stream-state-change", ({ hasVideo, hasAudio }) => {
    if (!socket.roomId) return;

    socket.to(socket.roomId).emit("participant-stream-update", {
      userId: socket.userId,
      userName: socket.userName,
      hasVideo,
      hasAudio
    });
  });

  socket.on("request-reconnect", ({ targetUserId }) => {
    const target = getSocketByUserId(io, targetUserId);
    if (!target) return;

    target.emit("reconnect-request", {
      fromUserId: socket.userId,
      fromSocketId: socket.id,
      fromUserName: socket.userName
    });
  });

  socket.on("ping-connection", ({ targetSocketId }) => {
    const target = io.sockets.sockets.get(targetSocketId);

    socket.emit("ping-response", {
      targetSocketId,
      connected: !!target
    });
  });

};
