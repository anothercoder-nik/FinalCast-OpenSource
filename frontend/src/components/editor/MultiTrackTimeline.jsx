import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Video, Layers, Trash2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const TrackHeader = ({ icon: Icon, label, color }) => (
    <div className={`w-36 flex-shrink-0 flex items-center gap-2 px-3 border-r border-stone-800 ${color} bg-black/20`}>
        <Icon className="w-4 h-4 opacity-70" />
        <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
    </div>
);

const TimelineClip = ({ clip, totalDuration, onRemove, isSelected, onSelect }) => {
    const leftPercent = (clip.start / totalDuration) * 100;
    const widthPercent = ((clip.duration || (clip.end - clip.start)) / totalDuration) * 100;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onSelect(clip.id);
            }}
            className={`absolute h-full rounded-md border group cursor-pointer overflow-hidden transition-all
                ${isSelected ? 'ring-2 ring-white z-10 shadow-lg' : 'border-white/10 opacity-90 hover:opacity-100'}
                ${clip.type === 'music' ? 'bg-indigo-500/40 border-indigo-500/50' :
                    clip.type === 'sfx' ? 'bg-emerald-500/40 border-emerald-500/50' :
                        'bg-purple-500/40 border-purple-500/50'
                }`}
            style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
            title={`${clip.title} (${clip.start.toFixed(1)}s)`}
        >
            <div className="px-2 h-full flex items-center">
                <span className="text-[10px] font-medium truncate text-white/90">{clip.title}</span>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(clip.id); }}
                className="absolute top-0 right-0 h-full px-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 text-red-400"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
};

const MultiTrackTimeline = ({ duration, currentTime, onSeek, tracks, onDropAsset, onRemoveClip, selectedClipId, onSelectClip }) => {
    const timelineRef = useRef(null);

    const handleTimelineClick = (e) => {
        if (!timelineRef.current) return;
        // Deselect if clicking empty space (handled by e.stopPropagation on clips)
        if (onSelectClip) onSelectClip(null);

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;
        onSeek(Math.max(0, Math.min(newTime, duration)));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e, trackId) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const asset = JSON.parse(data);

            // Calculate drop time
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const dropTime = percentage * duration;

            // Parse duration string "MM:SS" to seconds roughly for mock
            let assetDur = 5; // default 5s
            if (asset.duration && asset.duration.includes(':')) {
                const [m, s] = asset.duration.split(':').map(Number);
                assetDur = (m * 60) + s;
            }

            onDropAsset(trackId, {
                ...asset,
                start: dropTime,
                end: dropTime + assetDur,
                duration: assetDur
            });

        } catch (err) {
            console.error("Failed to parse dropped asset", err);
        }
    };

    return (
        <div className="h-64 bg-stone-900 border-t border-stone-800 flex flex-col">
            {/* Time Ruler */}
            <div className="h-8 border-b border-stone-800 flex bg-stone-950">
                <div className="w-36 flex-shrink-0 border-r border-stone-800 bg-stone-950 flex items-center justify-center">
                    <span className="text-[10px] text-stone-500 font-mono">00:00:00</span>
                </div>
                <div
                    className="flex-1 relative cursor-pointer group"
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                >
                    {/* Simple Ruler Ticks */}
                    <div className="absolute inset-0 flex justify-between px-2">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-full w-px bg-stone-800 relative">
                                <span className="absolute top-1 left-1 text-[9px] text-stone-600">{Math.floor((duration / 10) * i)}s</span>
                            </div>
                        ))}
                    </div>

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 rounded-sm shadow-md" />
                        <div className="absolute top-0 h-full w-[1px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    </div>
                </div>
            </div>

            {/* Tracks Area */}
            <ScrollArea className="flex-1 bg-stone-900">
                <div className="flex flex-col min-w-[800px]">

                    {/* Video Track (Locked) */}
                    <div className="h-20 flex border-b border-stone-800 bg-stone-900/50">
                        <TrackHeader icon={Video} label="Main Video" color="text-blue-400" />
                        <div className="flex-1 relative bg-stone-950/30 m-1 rounded border border-blue-900/20 overflow-hidden">
                            {/* Simulated Waveform/Strip */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <div className="w-full h-1/2 bg-blue-500/20" />
                            </div>
                            {/* Cuts Visualization */}
                            {tracks.videoCuts?.map((cut, i) => (
                                <div
                                    key={i}
                                    className="absolute h-full bg-red-900/40 border-l border-r border-red-500/20 hatch-pattern"
                                    style={{
                                        left: `${(cut.start / duration) * 100}%`,
                                        width: `${((cut.end - cut.start) / duration) * 100}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Audio Track */}
                    <div
                        className="h-16 flex border-b border-stone-800 bg-stone-900/50 hover:bg-stone-900 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'audio')}
                    >
                        <TrackHeader icon={Volume2} label="Audio / SFX" color="text-indigo-400" />
                        <div className="flex-1 relative m-1 rounded bg-stone-950/30 border border-white/5 transition-colors hover:border-indigo-500/30">
                            {tracks.audio.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs text-stone-600">Drag effects/music here</span>
                                </div>
                            )}
                            {tracks.audio.map(clip => (
                                <TimelineClip
                                    key={clip.id}
                                    clip={clip}
                                    totalDuration={duration}
                                    onRemove={(id) => onRemoveClip('audio', id)}
                                    isSelected={selectedClipId === clip.id}
                                    onSelect={onSelectClip}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Visuals/Overlay Track */}
                    <div
                        className="h-16 flex border-b border-stone-800 bg-stone-900/50 hover:bg-stone-900 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'visuals')}
                    >
                        <TrackHeader icon={Layers} label="Overlays" color="text-purple-400" />
                        <div className="flex-1 relative m-1 rounded bg-stone-950/30 border border-white/5 transition-colors hover:border-purple-500/30">
                            {tracks.visuals.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs text-stone-600">Drag templates here</span>
                                </div>
                            )}
                            {tracks.visuals.map(clip => (
                                <TimelineClip
                                    key={clip.id}
                                    clip={clip}
                                    totalDuration={duration}
                                    onRemove={(id) => onRemoveClip('visuals', id)}
                                    isSelected={selectedClipId === clip.id}
                                    onSelect={onSelectClip}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

export default MultiTrackTimeline;
