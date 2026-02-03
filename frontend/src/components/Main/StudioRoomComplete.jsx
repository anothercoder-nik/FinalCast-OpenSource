import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useSocket } from '../../context/SocketContext';
import useMediaRecorder from '../../hooks/userMediaRecorder';
import {
  joinSessionByRoomId,
  leaveSession,
  updateSessionStatus
} from '../../api/session.api';
import { startRTMPStream, stopRTMPStream } from '../../api/rtmp.api';
import { toast } from 'sonner';

// Components
import TopBar from '../studio/room/TopBar';
import ControlBar from '../studio/room/ControlBar';
import Sidebar from '../studio/room/Sidebar';
import UploadStatus from '../studio/UploadStatus';
import VideoGrid from './VideoGrid';
import MediaPermissionDialog from '../ui/MediaPermissionDialog';
import RTMPModal from '../studio/RTMPModal';

// Hooks
import { useWebRTC } from '../../hooks/useWebRTC';
import { useStudioData } from '../../hooks/studio/useStudioData';
import { useStudioTimer } from '../../hooks/studio/useStudioTimer';
import { useStudioSocketListeners } from '../../hooks/studio/useStudioSocketListeners';
import { useStudioConnectionListeners } from '../../hooks/studio/useStudioConnectionListeners';

export const StudioRoomComplete = () => {
  const { roomId } = useParams({ from: '/studio/$roomId' });
  const navigate = useNavigate();
  const currentUser = useSelector(state => state?.auth?.user);

  const {
    socket,
    isConnected,
    startSession: socketStartSession,
    joinLiveSession: socketJoinSession,
    endSession: socketEndSession,
    leaveSession: socketLeaveSession,
    sendMessage: socketSendMessage,
    addEventListener,
    removeEventListener
  } = useSocket();

  // State
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineParticipants, setOnlineParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sessionStatus, setSessionStatus] = useState('scheduled');
  const [isJoined, setIsJoined] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionAction, setPermissionAction] = useState(null); // 'start' or 'join'
  const [pinnedVideo, setPinnedVideo] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showRTMPModal, setShowRTMPModal] = useState(false);
  const [isGridStreaming, setIsGridStreaming] = useState(false);
  const videoGridRef = useRef(null);

  const {
    session,
    loading,
    error,
    isHost,
    settings,
    setSettings
  } = useStudioData(roomId, currentUser);

  const sessionTime = useStudioTimer(sessionStatus);

  useEffect(() => {
    if (session?.status) {
      setSessionStatus(session.status);
    }
  }, [session]);

  const {
    isInitialized,
    isInitializing,
    localStream,
    localVideoRef,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    mediaError,
    startLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    connectToUser,
    cleanupWebRTC,
    connectionStates,
    audioLevel
  } = useWebRTC(roomId, isJoined, currentUser);

  const {
    startRecording,
    stopRecording,
    isRecording,
    error: recordingError,
    chunkCount,
    isUploading,
    uploadProgress,
  } = useMediaRecorder({
    stream: localStream,
    sessionId: session?._id,
    role: isHost ? 'host' : 'participant',
    participantId: currentUser?._id,
    participantName: currentUser?.name
  });

  // Listeners
  useStudioSocketListeners({
    isConnected,
    isHost,
    currentUser,
    navigate,
    addEventListener,
    removeEventListener,
    setSessionStatus,
    setMessages,
    setOnlineParticipants,
    setIsJoined,
    setJoinError,
    setTypingUsers,
    cleanupWebRTC
  });

  useStudioConnectionListeners({
    isConnected,
    addEventListener,
    removeEventListener,
    setOnlineParticipants,
    setMessages,
    currentUser,
    localStream,
    isInitialized,
    connectToUser
  });

  // Auto-start media when user joins
  useEffect(() => {
    const initializeMedia = async () => {
      if (isJoined && isInitialized && !localStream) {
        try {
          await startLocalStream();
        } catch (error) {
          console.error('❌ Failed to start media:', error);
          setJoinError('Failed to access camera/microphone');
        }
      }
    };
    initializeMedia();
  }, [isJoined, isInitialized, localStream, startLocalStream]);

  // Auto-Join / Init Logic
  useEffect(() => {
    const handleAutoJoin = async () => {
      if (!session || !currentUser || isJoined) return;

      const userIsParticipant = session?.participants?.some(
        p => p?.user?._id === currentUser?._id && p?.isActive
      ) ?? false;

      if (session.status === 'live' && (isHost || userIsParticipant)) {
        setIsJoined(true);
        if (!localStream) {
          await startLocalStream();
        }

        const joinData = {
          roomId,
          userId: currentUser._id,
          userName: currentUser.name,
          sessionId: session._id
        };

        if (isHost) {
          socketStartSession(joinData);
        } else {
          socketJoinSession(joinData);
        }
      }
    };
    handleAutoJoin();
  }, [session, isHost, currentUser, isJoined, socketStartSession, socketJoinSession, startLocalStream, localStream]);

  // Handlers
  const handleStartSession = async () => {
    if (!isHost || !isConnected) return;
    setPermissionAction('start');
    setShowPermissionDialog(true);
  };

  const handleJoinSession = async () => {
    if (!isConnected) return;
    setPermissionAction('join');
    setShowPermissionDialog(true);
  };

  const handlePermissionGranted = async () => {
    setShowPermissionDialog(false);
    try {
      setJoinError(null);
      if (!localStream) await startLocalStream();

      if (permissionAction === 'start') {
        socketStartSession({
          roomId,
          userId: currentUser._id,
          userName: currentUser.name,
          sessionId: session._id
        });
        setIsJoined(true);
        setOnlineParticipants([{
          userId: currentUser._id,
          userName: currentUser.name,
          socketId: 'host-temp',
          isHost: true,
          joinedAt: new Date()
        }]);
      } else if (permissionAction === 'join') {
        await joinSessionByRoomId(roomId);
        socketJoinSession({
          roomId,
          userId: currentUser._id,
          userName: currentUser.name,
          sessionId: session._id
        });
      }
    } catch (err) {
      setJoinError('Failed to ' + permissionAction + ' session: ' + err.message);
    } finally {
      setPermissionAction(null);
    }
  };

  const handlePermissionDenied = () => {
    setShowPermissionDialog(false);
    setJoinError('Media permissions are required.');
    setPermissionAction(null);
  };

  const handleLeaveSession = async () => {
    try {
      if (isHost) {
        if (window.confirm('End session for everyone?')) {
          socketEndSession({ roomId, userId: currentUser._id, sessionId: session._id });
          await updateSessionStatus(session._id, 'ended');
        }
      } else {
        socketLeaveSession();
        await leaveSession(session._id);
        navigate({ to: '/studios' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLive = async () => {
    if (isHost) {
      if (isGridStreaming) {
        try {
          if (session?._id) {
            await stopRTMPStream(session._id);
            toast.success('Stream stopped');
          }
          setIsGridStreaming(false);
        } catch (error) {
          console.error('Failed to stop stream:', error);
          toast.error('Failed to stop stream');
        }
      } else {
        setShowRTMPModal(true);
      }
    }
  };

  const sendMessage = (message) => {
    if (!isConnected || !isJoined) return;
    socketSendMessage({
      roomId,
      message,
      userName: currentUser.name,
      userId: currentUser._id
    });
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-stone-950 text-white">Loading studio...</div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-stone-950 text-red-400">Error: {error}</div>;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-black overflow-hidden relative">
      {/* Studio Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.05)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      {!isFullScreen && (
        <TopBar
          isLive={sessionStatus === 'live'}
          sessionTime={sessionTime}
          onToggleLive={toggleLive}
          session={session}
          participantCount={onlineParticipants.length}
          connectionStatus={isConnected}
          isGridStreaming={isGridStreaming}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-gradient-to-br from-stone-950 to-stone-900 flex flex-col min-h-0 shadow-inner">
          <div className="flex-1 relative p-6 overflow-hidden" ref={videoGridRef}>
            <VideoGrid
              localStream={localStream}
              remoteStreams={remoteStreams}
              onlineParticipants={onlineParticipants}
              currentUser={currentUser}
              isHost={isHost}
              isJoined={isJoined}
              pinnedVideo={pinnedVideo}
              onPinVideo={setPinnedVideo}
              onUnpinVideo={() => setPinnedVideo(null)}
              localVideoRef={localVideoRef}
              connectionStates={connectionStates}
              audioLevel={audioLevel}
              isAudioEnabled={isAudioEnabled}
              isFullScreen={isFullScreen}
              isSidebarCollapsed={isSidebarCollapsed}
            />

            {/* Overlay for join prompt */}
            {!isJoined && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-10">
                <div className="bg-gradient-to-br from-stone-900 to-stone-800 border border-purple-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-lg">
                      <span className="text-2xl">🎙️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Studio</h2>
                    <p className="text-stone-300 mb-6">Ready to join {session?.title}?</p>
                  </div>

                  {isHost ? (
                    <button
                      onClick={handleStartSession}
                      disabled={!isConnected}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all duration-300 mb-3 shadow-lg hover:shadow-green-500/25 hover:scale-105"
                    >
                      🎬 Start Session
                    </button>
                  ) : sessionStatus === 'live' ? (
                    <button
                      onClick={handleJoinSession}
                      disabled={!isConnected}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 mb-3 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                    >
                      🎙️ Join Session
                    </button>
                  ) : (
                    <div className="bg-stone-800/50 p-4 rounded-xl text-stone-300 border border-stone-700/50">
                      Waiting for host to start the session...
                      <div className="flex justify-center mt-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {joinError && (
                    <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 text-red-300 rounded-xl text-sm animate-in fade-in">
                      {joinError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <ControlBar
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            onLeaveSession={handleLeaveSession}
            onStartSession={handleStartSession}
            isHost={isHost}
            isJoined={isJoined}
            onJoinSession={handleJoinSession}
            joinError={joinError}
            sessionStatus={sessionStatus}
            isConnected={isConnected}
            isMuted={!isAudioEnabled}
            isVideoOff={!isVideoEnabled}
            isScreenSharing={isScreenSharing}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={startScreenShare}
            mediaError={mediaError}
            isRecording={isRecording}
            onToggleRecording={isRecording ? stopRecording : startRecording}
            recordingError={recordingError}
            chunkCount={chunkCount}
            isUploading={isUploading}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Sidebar */}
        {!isFullScreen && (
          <Sidebar
            onlineParticipants={onlineParticipants}
            messages={messages}
            settings={settings}
            onSendMessage={sendMessage}
            onTypingStart={() => socket?.emit('typing-start', { roomId })}
            onTypingStop={() => socket?.emit('typing-stop', { roomId })}
            typingUsers={typingUsers}
            onUpdateSettings={setSettings}
            session={session}
            currentUser={currentUser}
            isHost={isHost}
            isJoined={isJoined}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            socket={socket}
          />
        )}
      </div>

      <MediaPermissionDialog
        isVisible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
      />

      <RTMPModal
        isOpen={showRTMPModal}
        onClose={() => setShowRTMPModal(false)}
        onStartStream={async (config) => {
          try {
            if (!session?._id) {
              toast.error('Session not found');
              return;
            }
            
            const streamData = {
              sessionId: session._id,
              platform: config.platform || 'youtube',
              streamKey: config.streamKey,
              rtmpUrl: config.rtmpUrl,
              title: config.title || session.title,
              hasVideoCapture: true,
              inputMode: 'webm'
            };

            await startRTMPStream(streamData);
            setShowRTMPModal(false);
            setIsGridStreaming(true);
            toast.success(`Started streaming to ${config.platform || 'YouTube'}!`);
          } catch (error) {
            console.error('Failed to start stream:', error);
            toast.error(error.message || 'Failed to start stream');
          }
        }}
      />

      <UploadStatus
        isUploading={isUploading}
        progress={uploadProgress || 0}
        chunkCount={chunkCount}
      />
    </div>
  );
};

export default StudioRoomComplete;
