import { useEffect } from 'react';

export const useStudioSocketListeners = ({
  isConnected,
  isHost,
  currentUser,
  navigate,
  addEventListener,
  removeEventListener,
  // State Setters
  setSessionStatus,
  setMessages,
  setOnlineParticipants,
  setIsJoined,
  setJoinError,
  setTypingUsers,
  // Actions
  cleanupWebRTC
}) => {
  useEffect(() => {
    if (!isConnected) return;

    const handleSessionStarted = (data) => {
      setSessionStatus('live');
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'System',
        message: `Session started by ${data.hostName}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system'
      }]);
    };

    const handleSessionEnded = (data) => {
      setSessionStatus('ended');
      setOnlineParticipants([]);
      cleanupWebRTC();
      setTimeout(() => {
        alert(data.message || 'Session has ended');
        navigate({ to: '/studios' });
      }, 1000);
    };

    const handleReceiveMessage = (messageData) => {
      setMessages(prev => [...prev, {
        id: messageData.id,
        user: messageData.userName,
        userId: messageData.userId,
        message: messageData.message,
        timestamp: messageData.timestamp,
        type: 'user'
      }]);
    };

    const handleJoinSuccess = (data) => {
      setIsJoined(true);
      setJoinError(null);
      if (isHost && data.participants) {
        setOnlineParticipants(data.participants);
      }
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
      setJoinError(error.message);
    };

    // Typing handlers
    const handleUserTyping = (data) => {
      const { userName, isTyping, userId } = data;
      // Don't show own typing status
      if (userId === currentUser?._id) return;

      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(userName) ? prev : [...prev, userName];
        } else {
          return prev.filter(name => name !== userName);
        }
      });
    };

    addEventListener('session-started', handleSessionStarted);
    addEventListener('session-ended', handleSessionEnded);
    addEventListener('receive-message', handleReceiveMessage);
    addEventListener('join-success', handleJoinSuccess);
    addEventListener('error', handleError);
    addEventListener('user-typing', handleUserTyping);

    return () => {
      removeEventListener('session-started', handleSessionStarted);
      removeEventListener('session-ended', handleSessionEnded);
      removeEventListener('receive-message', handleReceiveMessage);
      removeEventListener('join-success', handleJoinSuccess);
      removeEventListener('error', handleError);
      removeEventListener('user-typing', handleUserTyping);
    };
  }, [isConnected, isHost, navigate, addEventListener, removeEventListener, cleanupWebRTC]);
};
