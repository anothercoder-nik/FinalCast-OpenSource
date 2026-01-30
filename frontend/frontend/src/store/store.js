import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authslice.js';
import webrtcReducer from './slice/webRTCSlice.js'; // Add this import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    webrtc: webrtcReducer, // Add WebRTC reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types that contain non-serializable data (MediaStreams)
        ignoredActions: [
          'webrtc/setLocalStream',
          'webrtc/addRemoteStream',
          'webrtc/updateRemoteStream'
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.stream'],
        // Ignore these paths in the state (MediaStream objects can't be serialized)
        ignoredPaths: ['webrtc.localStream', 'webrtc.remoteStreams']
      }
    })
});

export default store;
