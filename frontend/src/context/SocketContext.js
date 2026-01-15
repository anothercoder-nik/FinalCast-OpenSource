import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { getApiUrl } from '../utils/config.js';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const currentUser = useSelector(state => state?.auth?.user);
  const socketRef = useRef(null);
  const eventListeners = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (currentUser && !socketRef.current) {
      console.log('🔌 Initializing socket connection...');
      
      const newSocket = io(getApiUrl(), {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Connected to server');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          toast.error('Server disconnected');
        } else {
          toast.warning('Connection lost - attempting to reconnect...');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('🚨 Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        toast.error('Connection failed: ' + error.message);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Reconnected to server');
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('🚨 Reconnection failed:', error);
        toast.error('Reconnection failed');
      });

      newSocket.on('error', (error) => {
        console.error('🚨 Socket error:', error);
        toast.error('Socket error: ' + error.message);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection...');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [currentUser]);

  // Session management functions
  const startSession = (sessionData) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('🚀 Starting session:', sessionData);
    socket.emit('start-session', sessionData);
  };

  const joinLiveSession = (sessionData) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('🤝 Joining live session:', sessionData);
    socket.emit('join-live-session', sessionData);
  };

  const endSession = (sessionData) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('🛑 Ending session:', sessionData);
    socket.emit('end-session', sessionData);
  };

  const leaveSession = (sessionData = {}) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('🚪 Leaving session:', sessionData);
    socket.emit('leave-session', sessionData);
  };

  const sendMessage = (messageData) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('💬 Sending message:', messageData);
    socket.emit('send-message', messageData);
  };

  const sendHostAction = (actionData) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }
    
    console.log('👑 Sending host action:', actionData);
    socket.emit('host-action', actionData);
  };

  const sendTypingStart = (roomId) => {
    if (!socket || !isConnected) return;
    socket.emit('typing-start', { roomId });
  };

  const sendTypingStop = (roomId) => {
    if (!socket || !isConnected) return;
    socket.emit('typing-stop', { roomId });
  };

  // Event listener management
  const addEventListener = (event, callback) => {
    if (!socket) return;
    
    // Store the callback for cleanup
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set());
    }
    eventListeners.current.get(event).add(callback);
    
    socket.on(event, callback);
    console.log(`📡 Added listener for: ${event}`);
  };

  const removeEventListener = (event, callback) => {
    if (!socket) return;
    
    socket.off(event, callback);
    
    // Remove from stored callbacks
    if (eventListeners.current.has(event)) {
      eventListeners.current.get(event).delete(callback);
    }
    
    console.log(`📡 Removed listener for: ${event}`);
  };

  const removeAllEventListeners = (event) => {
    if (!socket) return;
    
    socket.removeAllListeners(event);
    eventListeners.current.delete(event);
    console.log(`📡 Removed all listeners for: ${event}`);
  };

  // WebRTC signaling helpers
  const sendWebRTCOffer = (data) => {
    if (!socket || !isConnected) return;
    socket.emit('webrtc-offer', data);
  };

  const sendWebRTCAnswer = (data) => {
    if (!socket || !isConnected) return;
    socket.emit('webrtc-answer', data);
  };

  const sendWebRTCIceCandidate = (data) => {
    if (!socket || !isConnected) return;
    socket.emit('webrtc-ice-candidate', data);
  };

  const contextValue = {
    // Socket instance and state
    socket,
    isConnected,
    connectionError,
    
    // Session management
    startSession,
    joinLiveSession,
    endSession,
    leaveSession,
    
    // Messaging
    sendMessage,
    sendHostAction,
    sendTypingStart,
    sendTypingStop,
    
    // Event management
    addEventListener,
    removeEventListener,
    removeAllEventListeners,
    
    // WebRTC signaling
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendWebRTCIceCandidate,
    
    // Utility
    emit: (event, data) => socket?.emit(event, data),
    on: (event, callback) => socket?.on(event, callback),
    off: (event, callback) => socket?.off(event, callback)
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;