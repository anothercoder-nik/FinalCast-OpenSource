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

// Components
import TopBar from '../studio/room/TopBar';
import ControlBar from '../studio/room/ControlBar';
import Sidebar from '../studio/room/Sidebar';
import UploadStatus from '../studio/UploadStatus';
import VideoGrid from './VideoGrid';
import MediaPermissionDialog from '../ui/MediaPermissionDialog';
import YouTubeModal from '../studio/YoutubeModal';

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
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
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

  const toggleLive = () => {
    if (isHost) {
      if (isGridStreaming) {
        setIsGridStreaming(false);
      } else {
        setShowYouTubeModal(true);
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
    <div className="flex flex-col h-screen bg-stone-950 overflow-hidden">
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
        <div className="flex-1 relative bg-stone-950 flex flex-col min-h-0">
          <div className="flex-1 relative p-4 overflow-hidden" ref={videoGridRef}>
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <div className="bg-stone-900 border border-stone-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Ready to join?</h2>
                  <p className="text-stone-400 mb-6">You are about to join {session?.title}</p>

                  {isHost ? (
                    <button
                      onClick={handleStartSession}
                      disabled={!isConnected}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors mb-3"
                    >
                      Start Session
                    </button>
                  ) : sessionStatus === 'live' ? (
                    <button
                      onClick={handleJoinSession}
                      disabled={!isConnected}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-3"
                    >
                      Join Session
                    </button>
                  ) : (
                    <div className="bg-stone-800 p-4 rounded-lg text-stone-300">
                      Waiting for host to start the session...
                    </div>
                  )}

                  {joinError && (
                    <div className="mt-4 p-3 bg-red-900/30 border border-red-800 text-red-300 rounded text-sm">
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

      <YouTubeModal
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        onStartStream={async (config) => {
          setShowYouTubeModal(false);
          setIsGridStreaming(true);
        }}
        session={session}
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
