import React, { useEffect, useRef, memo } from 'react';
import { Users, Pin, PinOff, MicOff, VideoOff } from 'lucide-react';
import AudioVisualizer from '../ui/AudioVisualizer';

const getConnectionColor = (state) => {
  switch (state) {
    case 'connected': return 'bg-green-500';
    case 'connecting': return 'bg-yellow-500';
    case 'failed':
    case 'disconnected': return 'bg-red-500';
    default: return 'bg-stone-600';
  }
};

const AudioElement = memo(({ stream }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
      ref.current.play().catch(e => console.warn('Audio play failed', e));
    }
  }, [stream]);
  return <audio ref={ref} autoPlay />;
});

const VideoTile = memo(({
  stream,
  displayName,
  isLocal,
  isPinned,
  onPin,
  connectionState,
  audioLevel,
  videoRef,
  className = ""
}) => {
  const internalVideoRef = useRef(null);

  // Handle ref assignment for both internal use and parent access
  const setRef = (el) => {
    internalVideoRef.current = el;
    if (videoRef) {
      if (typeof videoRef === 'function') videoRef(el);
      else videoRef.current = el;
    }
  };

  useEffect(() => {
    const el = internalVideoRef.current;
    if (el && stream) {
      if (el.srcObject !== stream) {
        el.srcObject = stream;
        // Local video is usually muted to avoid echo, remote is muted here because we use separate audio element
        el.muted = true;
        el.play().catch(e => console.warn(`Video play failed for ${displayName}:`, e));
      }
    }
  }, [stream, displayName]);

  const hasVideo = stream?.getVideoTracks().some(t => t.enabled);
  const hasAudio = stream?.getAudioTracks().some(t => t.enabled);

  return (
    <div className={`relative bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl overflow-hidden border-2 border-stone-700/50 group hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 ${className}`}>
      {stream && hasVideo ? (
        <video
          ref={setRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover bg-stone-900 transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-800 to-stone-900">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl font-bold text-white mb-2 shadow-lg animate-pulse">
            {displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="text-stone-200 font-medium truncate max-w-full px-2 text-sm">{displayName}</p>
          <p className="text-xs text-stone-400 mt-1 capitalize">{connectionState || (isLocal ? 'Active' : 'Connecting...')}</p>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 max-w-[80%]">
        <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-2 truncate shadow-lg border border-white/20">
          <span className="truncate">{displayName} {isLocal && '(You)'}</span>
          {!hasAudio && <MicOff size={12} className="text-red-400 flex-shrink-0 animate-pulse" />}
          {!hasVideo && <VideoOff size={12} className="text-red-400 flex-shrink-0 animate-pulse" />}
        </div>
      </div>

      {/* Pin Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPin(); }}
        className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600/80 hover:scale-110 backdrop-blur-sm shadow-lg"
        title={isPinned ? "Unpin" : "Pin"}
      >
        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
      </button>

      {/* Status Icons */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {isLocal && hasAudio && <AudioVisualizer audioLevel={audioLevel} isAudioEnabled={true} size="sm" />}
        {!isLocal && <div className={`w-3 h-3 rounded-full ring-2 ring-black/30 shadow-lg transition-all duration-300 ${getConnectionColor(connectionState)}`} title={connectionState} />}
      </div>

      {/* Speaking Indicator */}
      {audioLevel > 0.1 && (
        <div className="absolute inset-0 border-4 border-green-400/50 rounded-2xl animate-pulse pointer-events-none"></div>
      )}

      {/* Remote Audio */}
      {!isLocal && stream && hasAudio && <AudioElement stream={stream} />}
    </div>
  );
});

const VideoGrid = ({
  onlineParticipants,
  currentUser,
  localStream,
  remoteStreams,
  localVideoRef,
  connectionStates,
  audioLevel = 0,
  pinnedVideo,
  onPinVideo,
  onUnpinVideo,
  isFullScreen,
  isSidebarCollapsed
}) => {
  const remoteVideoRefs = useRef(new Map());

  // Derive all participants list including local user
  const participants = [
    {
      userId: currentUser._id,
      userName: currentUser.name,
      isLocal: true,
      stream: localStream
    },
    ...onlineParticipants.filter(p => p.userId !== currentUser._id).map(p => ({
      ...p,
      isLocal: false,
      stream: remoteStreams?.get(p.userId)
    }))
  ];

  const handlePin = (p) => {
    if (pinnedVideo?.userId === p.userId) {
      onUnpinVideo();
    } else {
      onPinVideo({ userId: p.userId, userName: p.userName, type: p.isLocal ? 'local' : 'remote' });
    }
  };

  const getGridClasses = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Pinned Layout
  if (pinnedVideo) {
    const pinnedParticipant = participants.find(p => p.userId === pinnedVideo.userId) || {
      userId: pinnedVideo.userId,
      userName: pinnedVideo.userName,
      isLocal: pinnedVideo.type === 'local',
      stream: pinnedVideo.type === 'local' ? localStream : remoteStreams?.get(pinnedVideo.userId)
    };

    return (
      <div className={`h-full flex flex-col gap-4 p-4 ${isFullScreen ? 'p-6' : ''}`}>
        {/* Main Pinned Video */}
        <div className="flex-1 min-h-0 w-full">
          <VideoTile
            {...pinnedParticipant}
            displayName={pinnedParticipant.userName}
            videoRef={pinnedParticipant.isLocal ? localVideoRef : undefined}
            isPinned={true}
            onPin={() => onUnpinVideo()}
            connectionState={connectionStates?.get(pinnedParticipant.userId)}
            audioLevel={pinnedParticipant.isLocal ? audioLevel : 0}
            className="h-full border-blue-500/30 ring-1 ring-blue-500/20"
          />
        </div>

        {/* Thumbnails */}
        <div className="flex-shrink-0 h-36 flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-stone-700">
          {participants.filter(p => p.userId !== pinnedVideo.userId).map(p => (
            <div key={p.userId} className="w-56 flex-shrink-0 h-full">
              <VideoTile
                {...p}
                displayName={p.userName}
                videoRef={p.isLocal ? localVideoRef : undefined}
                isPinned={false}
                onPin={() => handlePin(p)}
                connectionState={connectionStates?.get(p.userId)}
                audioLevel={p.isLocal ? audioLevel : 0}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Circular Layout for Podcast Studio
  return (
    <div className="h-full flex items-center justify-center p-8 relative">
      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-stone-500 space-y-4 animate-pulse">
          <div className="p-8 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 shadow-2xl">
            <Users size={64} className="opacity-60" />
          </div>
          <p className="text-lg font-medium">Waiting for participants...</p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full max-w-4xl max-h-4xl">
          {/* Center Studio Logo/Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎙️</span>
              </div>
            </div>
          </div>

          {/* Circular Video Layout */}
          {participants.map((p, index) => {
            const angle = (index / participants.length) * 2 * Math.PI - Math.PI / 2; // Start from top
            const radius = Math.min(300, 150 + participants.length * 20); // Dynamic radius
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={p.userId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out hover:scale-105 hover:z-10"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <VideoTile
                  {...p}
                  displayName={p.userName}
                  videoRef={p.isLocal ? localVideoRef : undefined}
                  isPinned={false}
                  onPin={() => handlePin(p)}
                  connectionState={connectionStates?.get(p.userId)}
                  audioLevel={p.isLocal ? audioLevel : 0}
                  className="w-48 h-32 shadow-2xl border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default memo(VideoGrid);
