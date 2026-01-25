import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for WebRTC operations
export const initializeWebRTC = createAsyncThunk(
  'webrtc/initialize',
  async ({ roomId, userId, userName }, { rejectWithValue }) => {
    try {
      console.log('🚀 Initializing WebRTC for room:', roomId);
      return { roomId, userId, userName, timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addRemoteStream = createAsyncThunk(
  'webrtc/addRemoteStream',
  async ({ socketId, stream, participant }, { rejectWithValue }) => {
    try {
      console.log('📥 Adding remote stream from:', socketId);
      return { socketId, participant, timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeRemoteStream = createAsyncThunk(
  'webrtc/removeRemoteStream',
  async ({ socketId }, { rejectWithValue }) => {
    try {
      console.log('📤 Removing remote stream:', socketId);
      return { socketId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Connection state
  isInitialized: false,
  isConnecting: false,
  error: null,
  
  // Media state
  localStream: null,
  remoteStreams: {}, // socketId -> { stream, participant, timestamp }
  
  // Media controls
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  
  // Connection quality
  connectionStates: {}, // socketId -> { state, quality, stats }
  
  // Room info
  roomId: null,
  participants: [], // Online participants with WebRTC connections
  
  // Permissions
  mediaPermissions: {
    audio: false,
    video: false,
    granted: false,
    error: null
  }
};

const webrtcSlice = createSlice({
  name: 'webrtc',
  initialState,
  reducers: {
    // Media permissions
    setMediaPermissions: (state, action) => {
      state.mediaPermissions = { ...state.mediaPermissions, ...action.payload };
    },
    
    // Local stream management
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    
    // Media controls
    toggleAudio: (state) => {
      state.isAudioEnabled = !state.isAudioEnabled;
    },
    
    toggleVideo: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    
    setScreenSharing: (state, action) => {
      state.isScreenSharing = action.payload;
    },
    
    // Remote streams management
    updateRemoteStream: (state, action) => {
      const { socketId, updates } = action.payload;
      if (state.remoteStreams[socketId]) {
        state.remoteStreams[socketId] = {
          ...state.remoteStreams[socketId],
          ...updates
        };
      }
    },
    
    // Connection quality
    updateConnectionState: (state, action) => {
      const { socketId, connectionState, quality, stats } = action.payload;
      state.connectionStates[socketId] = {
        state: connectionState,
        quality: quality || 'unknown',
        stats: stats || null,
        lastUpdated: Date.now()
      };
    },
    
    // Participants
    updateParticipants: (state, action) => {
      state.participants = action.payload;
    },
    
    // Room management
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Cleanup
    resetWebRTC: (state) => {
      return {
        ...initialState,
        mediaPermissions: state.mediaPermissions // Keep permissions
      };
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Initialize WebRTC
      .addCase(initializeWebRTC.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(initializeWebRTC.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isInitialized = true;
        state.roomId = action.payload.roomId;
        state.error = null;
      })
      .addCase(initializeWebRTC.rejected, (state, action) => {
        state.isConnecting = false;
        state.isInitialized = false;
        state.error = action.payload;
      })
      
      // Add remote stream
      .addCase(addRemoteStream.fulfilled, (state, action) => {
        const { socketId, participant, timestamp } = action.payload;
        state.remoteStreams[socketId] = {
          participant,
          timestamp,
          connected: true
        };
      })
      
      // Remove remote stream
      .addCase(removeRemoteStream.fulfilled, (state, action) => {
        const { socketId } = action.payload;
        delete state.remoteStreams[socketId];
        delete state.connectionStates[socketId];
      });
  }
});

export const {
  setMediaPermissions,
  setLocalStream,
  toggleAudio,
  toggleVideo,
  setScreenSharing,
  updateRemoteStream,
  updateConnectionState,
  updateParticipants,
  setRoomId,
  setError,
  clearError,
  resetWebRTC
} = webrtcSlice.actions;

// Selectors
export const selectWebRTC = (state) => state.webrtc;
export const selectLocalStream = (state) => state.webrtc.localStream;
export const selectRemoteStreams = (state) => state.webrtc.remoteStreams;
export const selectMediaPermissions = (state) => state.webrtc.mediaPermissions;
export const selectConnectionStates = (state) => state.webrtc.connectionStates;
export const selectIsWebRTCInitialized = (state) => state.webrtc.isInitialized;
export const selectIsVideoEnabled = (state) => state.webrtc.isVideoEnabled;
export const selectIsAudioEnabled = (state) => state.webrtc.isAudioEnabled;

export default webrtcSlice.reducer;
