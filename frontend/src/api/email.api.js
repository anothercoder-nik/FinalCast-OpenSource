import api from '../utils/axios.js';

export const sendRoomInvitation = async (data) => {
  const response = await api.post('/api/email/send-invitation', data);
  return response.data;
};

export const sendBulkInvitations = async (data) => {
  const response = await api.post('/api/email/send-bulk-invitations', data);
  return response.data;
};

// Quick health check for email service
export const testEmailService = async () => {
  const response = await api.get('/api/email/test');
  return response.data;
};
