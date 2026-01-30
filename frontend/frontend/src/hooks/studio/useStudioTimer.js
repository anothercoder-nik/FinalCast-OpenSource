import { useState, useEffect } from 'react';

export const useStudioTimer = (sessionStatus) => {
  const [sessionTime, setSessionTime] = useState('00:00:00');

  useEffect(() => {
    if (sessionStatus !== 'live') return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      setSessionTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStatus]);

  return sessionTime;
};
