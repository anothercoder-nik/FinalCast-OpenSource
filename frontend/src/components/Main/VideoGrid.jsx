import React, { useEffect, useRef, useState, memo } from 'react';
import { Users, Pin, PinOff, MicOff, VideoOff } from 'lucide-react';
import AudioVisualizer from '../ui/AudioVisualizer';
import Spinner from "../spinner"; // adjust if path error


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
    <div className={`relative bg-stone-900 rounded-xl overflow-hidden border border-stone-800 group hover:border-stone-700 transition-all ${className}`}>
      {stream && hasVideo ? (
        <video
          ref={setRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover bg-stone-900"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-800 to-stone-700 flex items-center justify-center text-2xl font-bold text-stone-400 mb-3 shadow-inner">
            {displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="text-stone-300 font-medium truncate max-w-full px-2">{displayName}</p>
          <p className="text-xs text-stone-500 mt-1 capitalize">{connectionState || (isLocal ? 'Active' : 'Connecting...')}</p>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 max-w-[80%]">
        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2 truncate shadow-sm border border-white/10">
          <span className="truncate">{displayName} {isLocal && '(You)'}</span>
          {!hasAudio && <MicOff size={12} className="text-red-400 flex-shrink-0" />}
          {!hasVideo && <VideoOff size={12} className="text-red-400 flex-shrink-0" />}
        </div>
      </div>

      {/* Pin Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPin(); }}
        className="absolute top-3 left-3 p-2 rounded-lg bg-black/40 text-white/90 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
        title={isPinned ? "Unpin" : "Pin"}
      >
        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
      </button>

      {/* Status Icons */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {isLocal && hasAudio && <AudioVisualizer audioLevel={audioLevel} isAudioEnabled={true} size="sm" />}
        {!isLocal && <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-black/20 ${getConnectionColor(connectionState)}`} title={connectionState} />}
      </div>

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
    const [loading, setLoading] = useState(true);


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
    useEffect(() => {
    if (localStream || participants.length > 0) {
      setLoading(false);
    }
  }, [localStream, participants.length]);


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

    if (loading) {
    return <Spinner />;
  }


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

  // Grid Layout
  return (
    <div className={`h-full overflow-y-auto p-4 ${isFullScreen ? 'p-8' : ''}`}>
      {participants.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
          <div className="p-6 rounded-full bg-stone-900">
            <Users size={48} className="opacity-50" />
          </div>
          <p>Waiting for participants...</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${getGridClasses(participants.length)} auto-rows-fr h-full max-h-full`}>
          {participants.map(p => (
            <VideoTile
              key={p.userId}
              {...p}
              displayName={p.userName}
              videoRef={p.isLocal ? localVideoRef : undefined}
              isPinned={false}
              onPin={() => handlePin(p)}
              connectionState={connectionStates?.get(p.userId)}
              audioLevel={p.isLocal ? audioLevel : 0}
              className="w-full h-full shadow-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(VideoGrid);
