import api from '../utils/axios.js';

export const getRecordings = async (participantId) => {
  const response = await api.get(`/api/recordings/${participantId}`);
  return response.data;
};

export const downloadRecording = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
