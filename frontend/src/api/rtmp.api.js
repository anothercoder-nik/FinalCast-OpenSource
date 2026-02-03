import api from '../utils/axios.js';

export const startRTMPStream = async (config) => {
  const response = await api.post('/api/youtube/start-stream', {
    ...config,
    inputMode: config.inputMode || 'webm',
    videoConfig: {
      width: 1280,
      height: 720,
      framerate: 30,
      videoBitrate: '2500k',
      audioBitrate: '128k',
      ...(config.videoConfig || {})
    }
  });
  return response.data;
};

export const stopRTMPStream = async (sessionId) => {
  const response = await api.post('/api/youtube/stop-stream', { sessionId });
  return response.data;
};

export const getRTMPStreamStatus = async (sessionId) => {
  const response = await api.get(`/api/youtube/stream-status/${sessionId}`);
  return response.data;
};

export const getActiveRTMPStreams = async () => {
  const response = await api.get('/api/youtube/active-streams');
  return response.data;
};
