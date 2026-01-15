import { useState, useEffect } from 'react';
import { getSessionByRoomId } from '../../api/session.api';

export const useStudioData = (roomId, currentUser) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [settings, setSettings] = useState({
    allowChat: true,
    allowScreenShare: true,
    maxParticipants: 10
  });

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!roomId?.trim() || !currentUser) return;

      try {
        setLoading(true);
        setError(null);
        const sessionData = await getSessionByRoomId(roomId.trim());
        setSession(sessionData);

        const userIsHost = sessionData?.host?._id === currentUser?._id;
        setIsHost(userIsHost);

        if (sessionData.settings) {
          setSettings(sessionData.settings);
        }

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [roomId, currentUser]);

  return { session, setSession, loading, error, isHost, settings, setSettings };
};
