import React, { useState, useRef, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { getTranscript } from '../../services/transcriptService';
import { getSessionRecordings } from '../../api/session.api';
import { Button } from '../ui/button';
import { Play, Pause, Scissors, Undo, Redo, Download, Share2, Search } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import useEditPlayback from '../../hooks/useEditPlayback';
import Navbar from '../utils/Navbar';
import AssetSidebar from './AssetSidebar';
import MultiTrackTimeline from './MultiTrackTimeline';
import TrackPlayer from './TrackPlayer';
import { toast } from 'react-toastify';

// Transcript Editor Component (Kept inline for simplicity, same as before)
const TranscriptEditor = ({ transcript, cuts, onWordClick, currentTime, onToggleCut }) => {
    return (
        <div className="p-8 text-stone-300 font-mono text-base leading-loose select-text max-w-3xl mx-auto">
            {transcript.map((item, index) => {
                const isCut = cuts.some(cut => item.start >= cut.start && item.end <= cut.end);
                const isActive = currentTime >= item.start && currentTime <= item.end;

                return (
                    <span
                        key={index}
                        onClick={(e) => {
                            if (e.altKey) {
                                onToggleCut(item);
                            } else {
                                onWordClick(item.start);
                            }
                        }}
                        className={`
                        cursor-pointer px-1 py-0.5 rounded transition-all duration-150 relative
                        ${isActive ? 'bg-indigo-500/40 text-white shadow-sm ring-1 ring-indigo-500/50' : 'hover:bg-stone-800 text-stone-400'}
                        ${isCut ? 'bg-red-900/20 text-stone-700 line-through decoration-red-900/50 decoration-2 select-none' : ''}
                    `}
                        title="Click to seek, Alt+Click to cut/restore"
                    >
                        {item.word}{' '}
                    </span>
                );
            })}
        </div>
    );
};

// Smart Video Player Component
const SmartVideoPlayer = ({ isPlaying, currentTime, duration, onPlayPause, onSeek, mediaRef, src, onDurationChange, layout = 'grid', recordings = [] }) => {
    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Simulate multi-cam participants if we have more recordings, otherwise clone the source
    const participants = recordings.length > 0 ? recordings : [{ id: 'me', url: src, title: 'Host' }];
    // Ensure we have at least 2 for demo purposes if only 1
    const displayParticipants = participants.length === 1 ? [...participants, { id: 'guest', url: src, title: 'Guest' }] : participants;

    const renderLayout = () => {
        const videos = displayParticipants.slice(0, 4); // Limit to 4 for demo

        switch (layout) {
            case 'grid':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full h-full p-4">
                        {videos.map((p, i) => (
                            <div key={i} className="relative bg-stone-900 rounded-lg overflow-hidden border border-stone-800">
                                <video src={p.url} className="w-full h-full object-cover" muted={i > 0} ref={i === 0 ? mediaRef : null} />
                                <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-1 rounded text-white">{p.title}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'split':
                return (
                    <div className="flex gap-2 w-full h-full p-4">
                        {videos.slice(0, 2).map((p, i) => (
                            <div key={i} className="flex-1 relative bg-stone-900 rounded-lg overflow-hidden border border-stone-800">
                                <video src={p.url} className="w-full h-full object-cover" muted={i > 0} ref={i === 0 ? mediaRef : null} />
                                <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-1 rounded text-white">{p.title}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'active':
                return (
                    <div className="flex gap-2 w-full h-full p-4">
                        <div className="flex-[3] relative bg-stone-900 rounded-lg overflow-hidden border border-stone-800">
                            <video src={videos[0].url} className="w-full h-full object-cover" ref={mediaRef} />
                            <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-1 rounded text-white">{videos[0].title}</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            {videos.slice(1, 4).map((p, i) => (
                                <div key={i} className="flex-1 relative bg-stone-900 rounded-lg overflow-hidden border border-stone-800">
                                    <video src={p.url} className="w-full h-full object-cover" muted />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'pip':
                return (
                    <div className="relative w-full h-full bg-stone-900">
                        <video src={videos[0].url} className="w-full h-full object-cover" ref={mediaRef} />
                        <div className="absolute top-4 right-4 w-48 h-32 bg-stone-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl">
                            {videos[1] && <video src={videos[1].url} className="w-full h-full object-cover" muted />}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex-1 flex items-center justify-center relative bg-stone-950 overflow-hidden">
                        {src ? (
                            <video
                                ref={mediaRef}
                                src={src}
                                className="w-full h-full object-contain"
                                onClick={onPlayPause}
                                onLoadedMetadata={(e) => onDurationChange && onDurationChange(e.target.duration)}
                            />
                        ) : (
                            <div className="text-center text-stone-500">
                                <div className="w-16 h-16 rounded-full bg-stone-800 mb-4 flex items-center justify-center mx-auto">
                                    <Play className="w-6 h-6 ml-1 opacity-50" />
                                </div>
                                <p>No video source selected</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="aspect-video bg-black flex flex-col justify-between rounded-xl border border-stone-800 shadow-2xl overflow-hidden relative group ring-1 ring-white/10">
            {/* Render selected layout */}
            <div className="flex-1 relative bg-stone-950 overflow-hidden">
                {renderLayout()}
            </div>

            {/* Controls Overlay */}
            <div className="h-12 bg-stone-900/90 backdrop-blur border-t border-stone-800 flex items-center px-4 gap-4 z-10">
                <button
                    onClick={onPlayPause}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="text-xs font-mono text-stone-400">
                    {formatTime(currentTime)} <span className="text-stone-600">/</span> {formatTime(duration)}
                </div>

                <div className="flex-1 relative h-1 bg-stone-800 rounded-full cursor-pointer group"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        onSeek(percent * duration);
                    }}
                >
                    <div
                        className="absolute h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div
                        className="absolute h-3 w-3 bg-white rounded-full -top-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const EditorPage = () => {
    const { sessionId } = useParams({ from: '/editor/$sessionId' });
    const [transcript, setTranscript] = useState([]);
    const [cuts, setCuts] = useState([]);
    const [recordings, setRecordings] = useState([]); // Store fetched recordings
    const [layout, setLayout] = useState('grid'); // Default layout
    const [timelineTracks, setTimelineTracks] = useState({
        audio: [],
        visuals: [],
        videoCuts: [] // Synced with cuts state
    });

    // Custom hook handles the complex playback logic (skipping cuts)
    const {
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        seek,
        setDuration,
        mediaRef
    } = useEditPlayback(60, cuts); // 60s mock duration

    // Helper to format duration string
    const formatDuration = (seconds) => {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const loadData = async () => {
            // Mock fetch transcript
            try {
                const mockData = await getTranscript(sessionId);
                if (Array.isArray(mockData)) {
                    setTranscript(mockData);
                } else {
                    console.error("Transcript data is not an array:", mockData);
                    setTranscript([]);
                }
            } catch (error) {
                console.error("Failed to load transcript:", error);
                setTranscript([]);
            }
        };
        loadData();
    }, [sessionId]);

    // Sync 'cuts' state to timeline visualization
    useEffect(() => {
        setTimelineTracks(prev => ({ ...prev, videoCuts: cuts }));
    }, [cuts]);

    const handleWordClick = (time) => {
        seek(time);
    };

    const handleToggleCut = (wordItem) => {
        // Check if this word is already inside a cut
        const existingCutIndex = cuts.findIndex(c =>
            wordItem.start >= c.start && wordItem.end <= c.end
        );

        if (existingCutIndex !== -1) {
            // Remove cut (Restore)
            const newCuts = [...cuts];
            newCuts.splice(existingCutIndex, 1);
            setCuts(newCuts);
        } else {
            // Add new cut
            setCuts([...cuts, { start: wordItem.start, end: wordItem.end, id: Date.now() }]);
        }
    };


    // Fetch real recordings
    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const data = await getSessionRecordings(sessionId);
                if (data.success) {
                    // Map backend data to editor asset format
                    const mappedRecs = data.recordings.map(rec => ({
                        id: rec.id,
                        title: rec.displayName || rec.filename,
                        duration: formatDuration(rec.duration),
                        type: 'video',
                        url: rec.url
                    }));
                    setRecordings(mappedRecs);
                }
            } catch (err) {
                console.error("Failed to fetch recordings", err);
                toast.error("Could not load session recordings");
            }
        };
        if (sessionId) fetchRecordings();
    }, [sessionId]);


    const [selectedClipId, setSelectedClipId] = useState(null);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedClipId) {
                    // Try to find and remove from any track
                    ['audio', 'visuals'].forEach(trackType => {
                        setTimelineTracks(prev => {
                            if (prev[trackType].find(c => c.id === selectedClipId)) {
                                return {
                                    ...prev,
                                    [trackType]: prev[trackType].filter(c => c.id !== selectedClipId)
                                };
                            }
                            return prev;
                        });
                    });
                    setSelectedClipId(null);
                    toast.info("Clip deleted");
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedClipId]);


    const handleDropAsset = (trackId, asset) => {
        // Check if dropping a layout
        if (asset.type === 'layout') {
            setLayout(asset.id);
            toast.info(`Switched to ${asset.id} layout!`);
            return;
        }

        const newClip = {
            ...asset,
            id: Date.now() + Math.random(), // simple unique id
        };

        setTimelineTracks(prev => ({
            ...prev,
            [trackId]: [...prev[trackId], newClip]
        }));

        toast.success(`Added ${asset.title} to ${trackId} track`);
    };

    const handleRemoveClip = (trackId, clipId) => {
        setTimelineTracks(prev => ({
            ...prev,
            [trackId]: prev[trackId].filter(c => c.id !== clipId)
        }));
        if (selectedClipId === clipId) setSelectedClipId(null);
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        toast.info("Starting Cloud Render... This may take a minute.", { icon: "☁️" });

        try {
            // Prepare inputs for the backend
            // For this demo, we use the recordings as inputs
            // If we had a full timeline model, we'd map that here
            const inputs = recordings.map(rec => ({
                url: rec.url,
                type: 'video',
                id: rec.id
            }));

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/render`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    layout,
                    inputs,
                    duration
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Render Complete! Downloading...", { icon: "🎉" });
                // Trigger download
                const link = document.createElement('a');
                link.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${data.downloadUrl}`;
                link.download = `finalcast_render_${sessionId}.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error(data.message || "Render failed");
            }

        } catch (error) {
            console.error("Export error:", error);
            toast.error(`Export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Use the first recording as the main one for now
    const mainVideoSrc = recordings.length > 0 ? recordings[0].url : null;

    return (
        <div className="h-screen bg-stone-950 text-white flex flex-col overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="h-14 border-b border-stone-800 bg-stone-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white" onClick={() => window.history.back()}>
                        ← Back
                    </Button>
                    <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-stone-400 bg-clip-text text-transparent">
                        Magic Editor <span className="text-stone-600 mx-2">/</span> {sessionId}
                    </h1>
                    <span className="px-2 py-0.5 rounded bg-stone-800 text-xs text-stone-400 font-mono">
                        Session: {sessionId}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex mr-4 border-r border-stone-800 pr-4 gap-1">
                        <span className="text-xs text-stone-500 mr-2 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-red-900/50 border border-red-500 mr-1"></span>
                            {cuts.length} cuts active
                        </span>
                        <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white" title="Undo">
                            <Undo className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white" title="Redo">
                            <Redo className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" className="text-xs border-stone-700 hover:bg-stone-800 hover:text-white">
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Save EDL
                    </Button>
                    <Button
                        size="sm"
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                                Rendering...
                            </span>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5 mr-2" />
                                Export Video
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Main Content Area - Split Vertical */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Section: Sidebar | Preview | Transcript */}
                <div className="flex-1 flex min-h-0 border-b border-stone-800">
                    {/* 1. Asset Sidebar */}
                    <AssetSidebar recordings={recordings} />

                    {/* 2. Center: Video Preview (Drop Layouts Here) */}
                    <div
                        className="w-[40%] bg-stone-950 p-6 flex flex-col justify-center relative border-r border-stone-800 transition-colors"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const data = e.dataTransfer.getData('application/json');
                            if (data) {
                                try {
                                    const asset = JSON.parse(data);
                                    if (asset.type === 'layout') {
                                        handleDropAsset('layout', asset);
                                    }
                                } catch (err) { console.error(err) }
                            }
                        }}
                    >
                        <div className="max-w-2xl w-full mx-auto">
                            <SmartVideoPlayer
                                isPlaying={isPlaying}
                                currentTime={currentTime}
                                duration={duration}
                                onPlayPause={() => togglePlay()}
                                onSeek={(time) => seek(time)}
                                mediaRef={mediaRef}
                                src={mainVideoSrc}
                                onDurationChange={setDuration}
                                layout={layout}
                                recordings={recordings}
                            />
                        </div>
                    </div>

                    {/* 3. Right: Transcript Editor */}
                    <div className="flex-1 flex flex-col bg-stone-900 overflow-hidden">
                        <div className="p-3 border-b border-stone-800 bg-stone-900 flex justify-between items-center text-xs text-stone-400 shrink-0">
                            <span>Transcript</span>
                            <span className="bg-stone-800 px-2 py-1 rounded text-stone-500">Alt + Click to Cut words</span>
                        </div>
                        <ScrollArea className="flex-1">
                            <TranscriptEditor
                                transcript={transcript}
                                cuts={cuts}
                                currentTime={currentTime}
                                onWordClick={(time) => seek(time)}
                                onToggleCut={handleToggleCut}
                            />
                        </ScrollArea>
                    </div>
                </div>

                {/* Bottom Section: Timeline */}
                <MultiTrackTimeline
                    duration={duration}
                    currentTime={currentTime}
                    onSeek={seek}
                    tracks={timelineTracks}
                    onDropAsset={handleDropAsset}
                    onRemoveClip={handleRemoveClip}
                    selectedClipId={selectedClipId}
                    onSelectClip={setSelectedClipId}
                />
                <TrackPlayer
                    tracks={timelineTracks}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                />
            </div>
        </div>
    );
};

export default EditorPage;
