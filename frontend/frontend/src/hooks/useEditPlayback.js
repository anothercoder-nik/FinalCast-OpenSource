import { useState, useRef, useEffect, useCallback } from 'react';

const useEditPlayback = (initialDuration = 60, cuts = []) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(initialDuration);
    
    // The media element (video/audio) that drives the clock
    const mediaRef = useRef(null);
    const playLoopRef = useRef(null);

    const updatePlayback = useCallback(() => {
        if (!mediaRef.current) return;

        const now = mediaRef.current.currentTime;

        // Skip Logic
        // Find if current time is inside any cut interval [start, end)
        const cut = cuts.find(c => now >= c.start && now < c.end);
        
        if (cut) {
            // Jump!
            mediaRef.current.currentTime = cut.end + 0.01; // small buffer
            setCurrentTime(cut.end);
        } else {
            setCurrentTime(now);
        }

        if (!mediaRef.current.paused && !mediaRef.current.ended) {
            playLoopRef.current = requestAnimationFrame(updatePlayback);
        } else {
            setIsPlaying(false);
        }
    }, [cuts]);

    // Handle Play/Pause
    const togglePlay = useCallback(async () => {
        if (!mediaRef.current) return;
        
        if (mediaRef.current.paused) {
            try {
                await mediaRef.current.play();
                setIsPlaying(true);
                playLoopRef.current = requestAnimationFrame(updatePlayback);
            } catch (err) {
                console.error("Playback failed", err);
            }
        } else {
            mediaRef.current.pause();
            setIsPlaying(false);
            cancelAnimationFrame(playLoopRef.current);
        }
    }, [updatePlayback]);

    // Cleanup loop on unmount
    useEffect(() => {
        return () => cancelAnimationFrame(playLoopRef.current);
    }, []);

    const seek = (time) => {
        if (mediaRef.current) {
            mediaRef.current.currentTime = Math.max(0, Math.min(time, duration));
            setCurrentTime(mediaRef.current.currentTime);
        }
    };

    return {
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        seek,
        setDuration,
        setIsPlaying,
        mediaRef // Expose this ref to be attached to <video>
    };
};

export default useEditPlayback;
