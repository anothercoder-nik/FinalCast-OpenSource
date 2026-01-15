import * as sessionDAO from "../DAO/session.dao.js";

export const createSessionService = async (sessionData, hostId) => {
  return sessionDAO.createSessionDAO({
    ...sessionData,
    host: hostId
  });
};

export const getUserSessionsService = async (userId) => {
  return sessionDAO.findUserSessions(userId);
};

export const joinSessionService = async (sessionId, userId) => {
  const session = await sessionDAO.findSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  if (session.status === "ended") {
    throw new Error("This session has ended and cannot be joined");
  }

  if (session.status === "cancelled") {
    throw new Error("This session has been cancelled");
  }

  if (session.host._id.toString() === userId.toString()) {
    throw new Error("Host cannot join their own session");
  }

  const activeCount = session.participants.filter(p => p.isActive).length;
  if (activeCount >= session.maxParticipants) {
    throw new Error("Session is full");
  }

  const alreadyJoined = session.participants.some(
    p => p.user._id.toString() === userId.toString() && p.isActive
  );

  if (alreadyJoined) {
    throw new Error("Already joined");
  }

  session.participants.push({ user: userId });
  return session.save();
};

export const joinSessionByRoomIdService = async (roomId, userId) => {
  const session = await sessionDAO.findSessionByRoomId(roomId);
  if (!session) throw new Error("Session not found");

  if (session.status === "ended") {
    throw new Error("This session has ended and cannot be joined");
  }

  if (session.status === "cancelled") {
    throw new Error("This session has been cancelled");
  }

  if (session.host._id.toString() === userId.toString()) {
    throw new Error("Host cannot join their own session");
  }

  const activeCount = session.participants.filter(
    p => p.isActive && p.user._id.toString() !== session.host._id.toString()
  ).length;

  if (activeCount >= session.maxParticipants - 1) {
    throw new Error("Session is full");
  }

  const alreadyJoined = session.participants.some(
    p => p.user._id.toString() === userId.toString() && p.isActive
  );

  if (alreadyJoined) {
    throw new Error("Already joined");
  }

  session.participants.push({ user: userId });
  return session.save();
};

export const leaveSessionService = async (sessionId, userId) => {
  const session = await sessionDAO.findSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  if (session.host._id.toString() === userId.toString()) {
    session.status = "ended";
    session.endedAt = new Date();

    if (session.startedAt) {
      session.duration = Math.floor(
        (session.endedAt - session.startedAt) / 60000
      );
    }

    session.participants.forEach(p => {
      if (p.isActive) {
        p.isActive = false;
        p.leftAt = new Date();
      }
    });

    await session.save();
    return { message: "Session ended - host left", isHost: true };
  }

  const participant = session.participants.find(
    p => p.user._id.toString() === userId.toString() && p.isActive
  );

  if (!participant) {
    throw new Error("You are not an active participant");
  }

  participant.isActive = false;
  participant.leftAt = new Date();
  await session.save();

  return { message: "Left the session", isHost: false };
};

export const updateSessionStatusService = async (sessionId, status, hostId) => {
  if (!["scheduled", "live", "ended", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }

  const session = await sessionDAO.findSessionByIdAndHost(sessionId, hostId);
  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  const update = { status };

  if (status === "live") {
    update.startedAt = new Date();
  }

  if (status === "ended") {
    update.endedAt = new Date();
    if (session.startedAt) {
      update.duration = Math.floor(
        (update.endedAt - session.startedAt) / 60000
      );
    }
  }

  return sessionDAO.updateSessionById(sessionId, update);
};

export const getSessionParticipantsService = async (sessionId, userId) => {
  const session = await sessionDAO.findSessionForParticipants(sessionId);
  if (!session) throw new Error("Session not found");

  const isHost = session.host._id.toString() === userId.toString();
  const isParticipant = session.participants.some(
    p => p.user._id.toString() === userId.toString()
  );

  if (!isHost && !isParticipant) {
    throw new Error("Not authorized to view participants");
  }

  return {
    session: {
      _id: session._id,
      title: session.title,
      host: session.host,
      participants: session.participants,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.duration,
      scheduledAt: session.scheduledAt,
      maxParticipants: session.maxParticipants
    },
    isHost
  };
};

export const updateParticipantRoleService = async (
  sessionId,
  participantId,
  role,
  hostId
) => {
  if (!["participant", "moderator"].includes(role)) {
    throw new Error("Invalid role");
  }

  const session = await sessionDAO.findSessionByIdAndHost(sessionId, hostId);
  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  const participant = session.participants.find(
    p => p.user.toString() === participantId && p.isActive
  );

  if (!participant) {
    throw new Error("Participant not found");
  }

  participant.role = role;
  await session.save();

  return {
    message: `Participant role updated to ${role}`,
    participant
  };
};

export const removeParticipantService = async (
  sessionId,
  participantId,
  hostId
) => {
  const session = await sessionDAO.findSessionByIdAndHost(sessionId, hostId);
  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  const participant = session.participants.find(
    p => p.user.toString() === participantId && p.isActive
  );

  if (!participant) {
    throw new Error("Participant not found");
  }

  participant.isActive = false;
  participant.leftAt = new Date();
  await session.save();

  return { message: "Participant removed from session" };
};

export const deleteSessionService = async (sessionId, hostId) => {
  const session = await sessionDAO.findSessionByIdAndHost(sessionId, hostId);
  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  await sessionDAO.deleteSessionById(sessionId);
  return { message: "Session deleted successfully" };
};

export const getSessionByRoomIdService = async (roomId) => {
  const session = await sessionDAO.findSessionByRoomId(roomId);
  if (!session) throw new Error("Session not found");

  return session;
};

export const endSessionService = async (sessionId, hostId) => {
  const session = await sessionDAO.findSessionByIdAndHost(sessionId, hostId);
  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  session.status = "ended";
  session.endedAt = new Date();

  if (session.startedAt) {
    session.duration = Math.floor(
      (session.endedAt - session.startedAt) / 60000
    );
  }

  session.participants.forEach(p => {
    if (p.isActive) {
      p.isActive = false;
      p.leftAt = new Date();
    }
  });

  await session.save();
  return { message: "Session ended successfully" };
};
