import React, { memo } from 'react';
import {
    Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
    Square, Circle, Maximize, Minimize, MessageCircle, MoreHorizontal, Play, PhoneOff, Phone, Youtube
} from 'lucide-react';
import { Button } from '../../ui/button';

const ControlBar = ({
    isFullScreen,
    onToggleFullScreen,
    onLeaveSession,
    onStartSession,
    isHost,
    isJoined,
    onJoinSession,
    joinError,
    sessionStatus,
    isConnected,
    isMuted,
    isVideoOff,
    isScreenSharing,
    onToggleAudio,
    onToggleVideo,
    onToggleScreenShare,
    mediaError,
    isRecording,
    onToggleRecording,
    recordingError,
    chunkCount,
    isUploading,
    isSidebarCollapsed,
    onToggleSidebar,
    isYouTubeStreaming,
    onToggleYouTubeStream
}) => {
    return (
        <div className="bg-stone-900 border-t border-stone-800 px-6 py-4 shadow-2xl relative z-20 shrink-0">
            <div className="flex items-center justify-between max-w-7xl mx-auto">

                {/* Left Section: Media Controls */}
                <div className="flex items-center gap-3">
                    {/* Microphone */}
                    <div className="relative group">
                        <Button
                            onClick={onToggleAudio}
                            variant={isMuted ? "destructive" : "secondary"}
                            size="icon"
                            className={`w-12 h-12 rounded-full ${isMuted ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30" : "bg-stone-800 text-white hover:bg-stone-700 border-stone-700"} border transition-all duration-200`}
                            disabled={!isJoined}
                        >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-stone-700">
                            {isMuted ? "Unmute" : "Mute"}
                        </span>
                    </div>

                    {/* Video */}
                    <div className="relative group">
                        <Button
                            onClick={onToggleVideo}
                            variant={isVideoOff ? "destructive" : "secondary"}
                            size="icon"
                            className={`w-12 h-12 rounded-full ${isVideoOff ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30" : "bg-stone-800 text-white hover:bg-stone-700 border-stone-700"} border transition-all duration-200`}
                            disabled={!isJoined}
                        >
                            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </Button>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-stone-700">
                            {isVideoOff ? "Start Video" : "Stop Video"}
                        </span>
                    </div>

                    {/* Screen Share */}
                    <div className="relative group">
                        <Button
                            onClick={onToggleScreenShare}
                            variant={isScreenSharing ? "default" : "secondary"}
                            size="icon"
                            className={`w-12 h-12 rounded-full ${isScreenSharing ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-500" : "bg-stone-800 text-white hover:bg-stone-700 border-stone-700"} border transition-all duration-200`}
                            disabled={!isJoined}
                        >
                            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </Button>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-stone-700 w-max">
                            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                        </span>
                    </div>

                    {/* Recording */}
                    <div className="relative group">
                        <Button
                            onClick={onToggleRecording}
                            variant="outline"
                            size="icon"
                            className={`w-12 h-12 rounded-full border-2 ${isRecording
                                ? "bg-red-950/30 border-red-500 text-red-500 animate-pulse hover:bg-red-900/40"
                                : "bg-stone-800 border-stone-700 text-white hover:bg-stone-700 hover:border-red-500/50 hover:text-red-400"
                                } transition-all duration-200`}
                            disabled={!isJoined || isUploading}
                        >
                            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Circle className="w-4 h-4 fill-current" />}
                        </Button>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-stone-700 w-max">
                            {isRecording ? "Stop Recording" : "Start Checking"}
                        </span>
                    </div>

                    {/* YouTube Streaming */}
                    {isHost && (
                        <div className="relative group">
                            <Button
                                onClick={onToggleYouTubeStream}
                                variant="outline"
                                size="icon"
                                className={`w-12 h-12 rounded-full border-2 ${isYouTubeStreaming
                                    ? "bg-red-950/30 border-red-500 text-red-500 animate-pulse hover:bg-red-900/40"
                                    : "bg-stone-800 border-stone-700 text-white hover:bg-stone-700 hover:border-red-500/50 hover:text-red-400"
                                    } transition-all duration-200`}
                                disabled={!isJoined}
                            >
                                <Youtube className="w-4 h-4" />
                            </Button>
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-stone-700 w-max">
                                {isYouTubeStreaming ? "Stop YouTube Stream" : "Go Live on YouTube"}
                            </span>
                        </div>
                    )}

                    {/* Status Indicators (Errors) */}
                    {(mediaError || recordingError) && (
                        <div className="flex flex-col ml-2">
                            {mediaError && <span className="text-[10px] text-red-400 max-w-[150px] truncate" title={mediaError.message}>Media: {mediaError.message}</span>}
                            {recordingError && <span className="text-[10px] text-red-400 max-w-[150px] truncate" title={recordingError}>Rec: {recordingError}</span>}
                        </div>
                    )}
                </div>

                {/* Center/Right Section: Session Actions */}
                <div className="flex items-center gap-3">

                    {/* Host Start Session */}
                    {isHost && sessionStatus === 'scheduled' && (
                        <Button
                            onClick={onStartSession}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                            disabled={!isConnected}
                        >
                            <Play className="w-4 h-4 mr-2 fill-current" />
                            Start Session
                        </Button>
                    )}

                    {/* Join/Leave Button */}
                    {isJoined ? (
                        <Button
                            onClick={onLeaveSession}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 pl-4 pr-5"
                        >
                            <PhoneOff className="w-4 h-4 mr-2" />
                            {isHost ? 'End Session' : 'Leave'}
                        </Button>
                    ) : sessionStatus === 'live' ? (
                        <Button
                            onClick={onJoinSession}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 animate-pulse"
                            disabled={!isConnected}
                        >
                            <Phone className="w-4 h-4 mr-2 fill-current" />
                            Join Live
                        </Button>
                    ) : (
                        <div className="px-4 py-2 rounded-full bg-stone-800 border border-stone-700 text-stone-400 text-sm font-medium">
                            Waiting for host...
                        </div>
                    )}

                    <div className="w-px h-8 bg-stone-800 mx-2 hidden md:block"></div>

                    {/* View Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={onToggleSidebar}
                            variant="ghost"
                            size="icon"
                            className={`rounded-full ${!isSidebarCollapsed ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white'} hover:bg-stone-700`}
                            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                        >
                            {isSidebarCollapsed ? <MessageCircle className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                        </Button>

                        <Button
                            onClick={onToggleFullScreen}
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-stone-400 hover:text-white hover:bg-stone-700"
                        >
                            {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Join Error Toast-like display */}
            {joinError && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 px-4 py-2 bg-red-500 text-white text-xs rounded shadow-lg animate-in fade-in slide-in-from-bottom-2">
                    {joinError}
                </div>
            )}
        </div>
    );
};

export default memo(ControlBar);
