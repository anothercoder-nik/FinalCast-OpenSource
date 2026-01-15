// ... existing imports
import api from '../utils/axios.js';

export const createSession = async (sessionData) => {
  const response = await api.post('/api/sessions', sessionData);
  return response.data;
};

export const getSessions = async () => {
  const response = await api.get('/api/sessions');
  return response.data;
};

export const getSessionByRoomId = async (roomId) => {
  const response = await api.get(`/api/sessions/room/${roomId}`);
  return response.data;
};

export const getSessionById = async (sessionId) => {
  const response = await api.get(`/api/sessions/${sessionId}`);
  return response.data;
};

export const joinSession = async (sessionId) => {
  const response = await api.post(`/api/sessions/${sessionId}/join`);
  return response.data;
};

export const joinSessionByRoomId = async (roomId) => {
  const response = await api.post(`/api/sessions/room/${roomId}/join`);
  return response.data;
};

export const leaveSession = async (sessionId) => {
  const response = await api.post(`/api/sessions/${sessionId}/leave`);
  return response.data;
};

export const updateSessionStatus = async (sessionId, status) => {
  const response = await api.patch(`/api/sessions/${sessionId}/status`, { status });
  return response.data;
};

export const getSessionParticipants = async (sessionId) => {
  const response = await api.get(`/api/sessions/${sessionId}/participants`);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/api/sessions/${sessionId}`);
  return response.data;
};

// Fixed endpoint to match recording.routes.js
export const getSessionRecordings = async (sessionId) => {
  const response = await api.get(`/api/session/${sessionId}/videos`);
  return response.data; // Expected { recordings: [...] }
};

export const getParticipantRecordings = async (participantId) => {
  const response = await api.get(`/api/recordings/${participantId}`);
  return response.data;
};

export const generateDownloadUrl = async (recordingId) => {
  // Note: Backend route for this might be missing or different.
  // Keeping as is for now, but be aware.
  const response = await api.get(`/api/download/${recordingId}`);
  return response.data;
};
