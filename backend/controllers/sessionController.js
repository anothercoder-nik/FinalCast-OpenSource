import wrapAsync from "../utils/trycatchwrapper.js";
import * as sessionService from "../services/session.service.js";

export const createSession = wrapAsync(async (req, res) => {
  const session = await sessionService.createSessionService(
    req.body,
    req.user._id
  );

  res.status(201).json(session);
});

export const getAllSessions = wrapAsync(async (req, res) => {
  const sessions = await sessionService.getUserSessionsService(req.user._id);
  res.json(sessions);
});

export const joinSession = wrapAsync(async (req, res) => {
  const session = await sessionService.joinSessionService(
    req.params.id,
    req.user._id
  );
  res.json(session);
});

export const joinSessionByRoomId = wrapAsync(async (req, res) => {
  const session = await sessionService.joinSessionByRoomIdService(
    req.params.roomId,
    req.user._id
  );
  res.json(session);
});

export const leaveSession = wrapAsync(async (req, res) => {
  const result = await sessionService.leaveSessionService(
    req.params.id,
    req.user._id
  );
  res.json(result);
});

export const updateSession = wrapAsync(async (req, res) => {
  const session = await sessionService.updateSessionStatusService(
    req.params.id,
    req.body.status,
    req.user._id
  );
  res.json(session);
});

export const getSessionParticipants = wrapAsync(async (req, res) => {
  const result = await sessionService.getSessionParticipantsService(
    req.params.id,
    req.user._id
  );
  res.json(result);
});

export const updateParticipantRole = wrapAsync(async (req, res) => {
  const { participantId, role } = req.body;

  const result = await sessionService.updateParticipantRoleService(
    req.params.id,
    participantId,
    role,
    req.user._id
  );

  res.json(result);
});

export const removeParticipant = wrapAsync(async (req, res) => {
  const result = await sessionService.removeParticipantService(
    req.params.id,
    req.body.participantId,
    req.user._id
  );

  res.json(result);
});

export const deleteSession = wrapAsync(async (req, res) => {
  const result = await sessionService.deleteSessionService(
    req.params.id,
    req.user._id
  );

  res.json(result);
});

export const getSessionByRoomId = wrapAsync(async (req, res) => {
  const session = await sessionService.getSessionByRoomIdService(
    req.params.roomId
  );
  res.json(session);
});
