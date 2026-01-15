import React, { useEffect, useRef } from 'react';

const TrackPlayer = ({ tracks, currentTime, isPlaying }) => {
    // Refs to store audio instances: { [clipId]: HTMLAudioElement }
    const audioRefs = useRef({});

    useEffect(() => {
        // Cleanup function to pause all on unmount
        return () => {
            Object.values(audioRefs.current).forEach(audio => {
                audio.pause();
                audio.src = "";
            });
        };
    }, []);

    // Sync loop
    useEffect(() => {
        // We only manage the 'audio' track for now
        const audioClips = tracks.audio || [];

        // 1. Create/Update audio elements
        audioClips.forEach(clip => {
            if (!audioRefs.current[clip.id]) {
                const audio = new Audio(clip.url); // Assuming asset has .url
                // For mock assets without real URLs, we might need placeholders.
                // But the AssetSidebar Mocks need real URLs to work.
                // Let's assume we map the IDs to some public sounds or use the recording URL if valid.

                // HACK: for mock music, use some reliable CDNs or placeholders?
                // For now, let's trust the clip.url is set. If not, we can't play.
                if (!clip.url && clip.type === 'music') {
                    // Fallback for demo
                    audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                } else if (!clip.url && clip.type === 'sfx') {
                    audio.src = 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg';
                }

                audio.volume = 0.5; // Default mix volume
                audioRefs.current[clip.id] = audio;
            }
        });

        // 2. Sync Playback
        audioClips.forEach(clip => {
            const audio = audioRefs.current[clip.id];
            if (!audio) return;

            // Check if playhead is within clip range
            if (currentTime >= clip.start && currentTime < clip.end) {
                // Should be playing

                // Calculate seeking position relative to clip start
                const seekTime = currentTime - clip.start;

                // Sync check: only seek if drifted significantly (> 0.2s) to avoid glitching
                if (Math.abs(audio.currentTime - seekTime) > 0.2) {
                    audio.currentTime = seekTime;
                }

                if (isPlaying && audio.paused) {
                    audio.play().catch(e => console.warn("Audio play failed", e));
                } else if (!isPlaying && !audio.paused) {
                    audio.pause();
                }
            } else {
                // Should be stopped
                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            }
        });

        // 3. Cleanup removed clips
        Object.keys(audioRefs.current).forEach(clipId => {
            if (!audioClips.find(c => c.id.toString() === clipId)) {
                audioRefs.current[clipId].pause();
                delete audioRefs.current[clipId];
            }
        });

    }, [tracks, currentTime, isPlaying]);

    return null; // logic only component
};

export default TrackPlayer;
