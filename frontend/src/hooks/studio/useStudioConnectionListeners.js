import { useEffect } from 'react';

export const useStudioConnectionListeners = ({
  isConnected,
  addEventListener,
  removeEventListener,
  setOnlineParticipants,
  setMessages,
  currentUser,
  localStream,
  isInitialized,
  connectToUser
}) => {
  // Handle WebRTC connections when users join
  useEffect(() => {
    if (!isConnected) return;

    const handleUserJoined = (data) => {
      setOnlineParticipants(prev => {
        const exists = prev.some(p => p.userId === data.userId);
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });

      if (data.shouldConnect && currentUser && data.userId !== currentUser._id && localStream && isInitialized && connectToUser) {
        connectToUser(data.userId);
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'System',
        message: `${data.userName} joined the session`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system'
      }]);
    };

    const handleCurrentParticipants = (participants) => {
      setOnlineParticipants(participants);
      if (isInitialized && connectToUser) {
        participants.forEach((participant, index) => {
          if (currentUser && participant.userId !== currentUser._id) {
            setTimeout(() => {
              connectToUser(participant.userId);
            }, index * 100);
          }
        });
      }
    };

    addEventListener('user-joined', handleUserJoined);
    addEventListener('current-participants', handleCurrentParticipants);

    return () => {
      removeEventListener('user-joined', handleUserJoined);
      removeEventListener('current-participants', handleCurrentParticipants);
    };
  }, [isConnected, currentUser, localStream, isInitialized, connectToUser, addEventListener, removeEventListener]);
};
