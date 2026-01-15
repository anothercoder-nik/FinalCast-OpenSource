/**
 * Debounced Video Stream Manager
 * Prevents rapid video element updates that cause AbortError
 */

import { useCallback, useRef } from 'react';

export const useVideoStreamManager = () => {
  const pendingUpdates = useRef(new Map());
  const updateTimeouts = useRef(new Map());

  const updateVideoStream = useCallback((videoElement, stream, userId, delay = 100) => {
    if (!videoElement || !stream) return;

    // Clear any pending update for this user
    const existingTimeout = updateTimeouts.current.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Store the pending update
    pendingUpdates.current.set(userId, { videoElement, stream });

    // Debounce the actual update
    const timeout = setTimeout(() => {
      const pendingUpdate = pendingUpdates.current.get(userId);
      if (!pendingUpdate) return;

      const { videoElement: el, stream: str } = pendingUpdate;
      
      // Only update if the source actually changed
      if (el.srcObject !== str) {
        console.log(`📺 Debounced video update for ${userId}`);
        el.srcObject = str;
        
        // Play video safely
        el.play().catch(error => {
          if (error.name !== 'AbortError') {
            console.warn(`Video play failed for ${userId}:`, error.message);
          }
        });
      }

      // Cleanup
      pendingUpdates.current.delete(userId);
      updateTimeouts.current.delete(userId);
    }, delay);

    updateTimeouts.current.set(userId, timeout);
  }, []);

  const cleanup = useCallback(() => {
    // Clear all pending timeouts
    for (const timeout of updateTimeouts.current.values()) {
      clearTimeout(timeout);
    }
    
    pendingUpdates.current.clear();
    updateTimeouts.current.clear();
  }, []);

  return { updateVideoStream, cleanup };
};
