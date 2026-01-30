import api from '../utils/axios.js';

export const startYouTubeStream = async (config) => {
  const response = await api.post('/api/youtube/start-stream', {
    ...config,
    inputMode: config.inputMode || 'webm',
    videoConfig: {
      width: 1280,
      height: 720,
      framerate: 30,
      videoBitrate: '2500k',
      audioBitrate: '128k'
    }
  });
  return response.data;
};

export const stopYouTubeStream = async (sessionId) => {
  const response = await api.post('/api/youtube/stop-stream', { sessionId });
  return response.data;
};

export const getYouTubeStreamStatus = async (sessionId) => {
  const response = await api.get(`/api/youtube/stream-status/${sessionId}`);
  return response.data;
};

export const getActiveYouTubeStreams = async () => {
  const response = await api.get('/api/youtube/active-streams');
  return response.data;
};
