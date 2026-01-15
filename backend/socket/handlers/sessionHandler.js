import Session from "../../models/session.model.js";

const getParticipantsInRoom = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];

  const users = [];
  for (const id of room) {
    const s = io.sockets.sockets.get(id);
    if (s?.userId) {
      users.push({
        userId: s.userId,
        userName: s.userName,
        socketId: s.id,
        isHost: !!s.isHost
      });
    }
  }
  return users;
};

const leaveSession = (socket, io, activeSessions) => {
  const { roomId, userId, userName, isHost } = socket;
  if (!roomId) return;

  const session = activeSessions.get(roomId);

  if (isHost) {
    io.to(roomId).emit("session-ended", {
      roomId,
      endedBy: userName,
      reason: "host_left"
    });
    activeSessions.delete(roomId);
    return;
  }

  session?.participants.delete(userId);

  socket.to(roomId).emit("user-left", {
    userId,
    userName,
    socketId: socket.id
  });
};

export const registerSessionHandlers = (io, socket, activeSessions) => {
  socket.on("start-session", async ({ roomId, userId, userName, sessionId }) => {
    const session = await Session.findOne({
      $or: [{ _id: sessionId }, { roomId }],
      host: userId
    });

    if (!session) {
      socket.emit("error", { message: "Only host can start session" });
      return;
    }

    session.status = "live";
    session.startedAt = new Date();
    await session.save();

    activeSessions.set(roomId, {
      hostId: userId,
      sessionId: session._id,
      participants: new Set([userId]),
      sessionStatus: "live",
      startedAt: new Date()
    });

    socket.join(roomId);
    Object.assign(socket, { roomId, userId, userName, isHost: true });

    const participants = getParticipantsInRoom(io, roomId);

    io.to(roomId).emit("session-started", {
      roomId,
      hostName: userName
    });

    socket.emit("session-start-success", {
      roomId,
      participants
    });
  });

  socket.on("join-live-session", async ({ roomId, userId, userName, sessionId }) => {
    const active = activeSessions.get(roomId);
    if (!active || active.sessionStatus !== "live") {
      socket.emit("error", { message: "Session not live" });
      return;
    }

    const session = await Session.findById(sessionId || active.sessionId);
    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    socket.join(roomId);
    Object.assign(socket, { roomId, userId, userName, isHost: false });

    active.participants.add(userId);

    socket.to(roomId).emit("user-joined", {
      userId,
      userName,
      socketId: socket.id
    });

    const participants = getParticipantsInRoom(io, roomId);

    socket.emit("join-success", {
      roomId,
      participants,
      hostName: participants.find(p => p.isHost)?.userName
    });

    io.to(roomId).emit("room-stats", {
      participantCount: participants.length
    });
  });

  socket.on("end-session", async ({ roomId, userId, sessionId }) => {
    const active = activeSessions.get(roomId);
    if (!active || active.hostId !== userId) {
      socket.emit("error", { message: "Only host can end session" });
      return;
    }

    const endTime = new Date();
    const duration =
      active.startedAt
        ? Math.floor((endTime - active.startedAt) / 60000)
        : 0;

    const session = await Session.findById(sessionId || active.sessionId);
    if (session) {
      session.status = "ended";
      session.endedAt = endTime;
      session.duration = duration;
      await session.save();
    }

    io.to(roomId).emit("session-ended", {
      roomId,
      duration,
      reason: "host_ended"
    });

    activeSessions.delete(roomId);
  });

  socket.on("leave-session", () => {
    leaveSession(socket, io, activeSessions);
  });

  socket.on("disconnect", () => {
    if (!socket.roomId) return;

    const active = activeSessions.get(socket.roomId);

    if (active?.hostId === socket.userId) {
      io.to(socket.roomId).emit("session-ended", {
        roomId: socket.roomId,
        reason: "host_disconnect"
      });
      activeSessions.delete(socket.roomId);
    } else {
      leaveSession(socket, io, activeSessions);
    }
  });
};
