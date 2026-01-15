import Session from "../models/session.model.js";

export const createSessionDAO = async (sessionData) => {
  const session = new Session(sessionData);
  return await session.save();
};

export const findSessionById = async (id) => {
  return await Session.findById(id)
    .populate('host', 'name email avatar')
    .populate('participants.user', 'name email avatar');
};

export const findSessionByRoomId = async (roomId) => {
  return await Session.findOne({ roomId })
    .populate('host', 'name email avatar')
    .populate('participants.user', 'name email avatar');
};

export const findUserSessions = async (userId) => {
  return await Session.find({
    $or: [
      { host: userId },
      { "participants.user": userId }
    ]
  })
  .populate('host', 'name email avatar')
  .populate('participants.user', 'name email avatar')
  .sort({ createdAt: -1 });
};

export const findSessionByIdAndHost = async (id, hostId) => {
  return await Session.findOne({ _id: id, host: hostId });
};

export const updateSessionById = async (id, updateData) => {
  return await Session.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteSessionById = async (id) => {
  return await Session.findByIdAndDelete(id);
};

export const findSessionForParticipants = async (id) => {
  return await Session.findById(id)
    .populate('participants.user', 'name email avatar')
    .populate('host', 'name email avatar');
};
