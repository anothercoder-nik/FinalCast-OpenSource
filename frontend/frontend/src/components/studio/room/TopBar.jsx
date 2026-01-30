import React, { memo } from 'react';
import { Users, Wifi, WifiOff, Radio, Wand2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Link } from '@tanstack/react-router';

const TopBar = ({ isLive, sessionTime, onToggleLive, session, participantCount, connectionStatus, isGridStreaming }) => {
    return (
        <div className="bg-stone-900 border-b border-stone-800 px-6 py-3 shadow-sm z-20">
            <div className="flex items-center justify-between max-w-7xl mx-auto">

                {/* Left: Title & Status */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            {session?.title || 'Studio Session'}
                            {isLive && (
                                <Badge variant="destructive" className="h-5 text-[10px] px-1.5 animate-pulse">LIVE</Badge>
                            )}
                        </h1>
                        {/* Connection Status Subtitle */}
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-stone-400">
                                <Users className="w-3.5 h-3.5" />
                                <span>{participantCount} present</span>
                            </div>
                            <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                            <div className="flex items-center gap-1.5 ">
                                {connectionStatus ? (
                                    <>
                                        <Wifi className="w-3.5 h-3.5 text-green-500" />
                                        <span className="text-green-500 font-medium">Excellent</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-3.5 h-3.5 text-red-500" />
                                        <span className="text-red-500 font-medium">Offline</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <div className="text-sm font-mono text-stone-300 bg-stone-800 px-3 py-1.5 rounded-md border border-stone-700 shadow-inner">
                        {sessionTime}
                    </div>

                    <Link
                        to={`/editor/${session?._id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                        title="Open Magic Editor"
                    >
                        <Wand2 className="w-4 h-4" />
                        Magic Edit
                    </Link>

                    <Button
                        onClick={onToggleLive}
                        variant={isGridStreaming ? "destructive" : "default"}
                        size="sm"
                        className={`${isGridStreaming
                            ? "bg-red-600 hover:bg-red-700 shadow-red-900/50 animate-pulse"
                            : "bg-red-600 hover:bg-red-700 shadow-red-900/20"
                            } font-medium text-white shadow-lg transition-all hover:scale-105`}
                    >
                        <Radio className="w-4 h-4 mr-2" />
                        {isGridStreaming ? "Stop Stream" : "Go Live"}
                    </Button>

                    {isGridStreaming && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                            <Badge variant="outline" className="bg-red-950/50 text-red-400 border-red-900/50 text-[10px] animate-fade-in">
                                Streaming Active
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(TopBar);
