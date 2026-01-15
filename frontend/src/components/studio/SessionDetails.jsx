import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useSelector } from 'react-redux';
import { getSessionByRoomId, getSessionParticipants } from '../../api/session.api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import SessionRecordings from './SessionRecordings';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Settings,
  Play,
  Square,
  Download,
  Share2,
  Copy,
  CheckCircle,
  XCircle,
  RadioIcon

} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const SessionDetails = () => {
  // Get roomId from route params
  const { roomId } = useParams({
    from: '/session-details/$roomId',
    strict: false
  });

  const navigate = useNavigate();
  const currentUser = useSelector(state => state?.auth?.user);

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        const sessionData = await getSessionByRoomId(roomId);
        setSession(sessionData);

        // Try to get participants
        try {
          const participantsData = await getSessionParticipants(sessionData._id);
          setParticipants(participantsData?.session?.participants || []);
        } catch (error) {
          // If user can't access participants or none exist, just show empty list
          setParticipants([]);
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError(err.response?.data?.message || 'Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    if (roomId && currentUser) {
      fetchSessionDetails();
    }
  }, [roomId, currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600';
      case 'live': return 'bg-red-600 animate-pulse';
      case 'ended': return 'bg-green-600';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'live': return <RadioIcon className="w-4 h-4" />;
      case 'ended': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard');
  };

  const joinSession = () => {
    navigate({ to: `/studio/${roomId}` });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Not available';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-300">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate({ to: '/studios' })}>
            Back to Studios
          </Button>
        </div>
      </div>
    );
  }

  const isHost = session?.host?._id === currentUser?._id;
  const activeParticipants = participants.filter(p => p.isActive);
  const totalParticipants = participants.length;

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate({ to: '/studios' })}
            variant="ghost"
            size="sm"
            className="text-stone-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Button>
        </div>

        {/* Session Info Card */}
        <div className="bg-stone-900 rounded-xl border border-stone-700 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={`${getStatusColor(session.status)} text-white`}>
                  {getStatusIcon(session.status)}
                  <span className="ml-2 capitalize">{session.status}</span>
                </Badge>
                <div className="flex items-center gap-2 text-stone-400">
                  <Users className="w-4 h-4" />
                  <span>{activeParticipants.length}/{session.maxParticipants} active</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <Users className="w-4 h-4" />
                  <span>{totalParticipants} total participants</span>
                </div>
              </div>
              {session.description && (
                <p className="text-stone-300 leading-relaxed">{session.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {session.status === 'live' && (
                <Button
                  onClick={joinSession}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RadioIcon className="w-4 h-4 mr-2" />
                  Join Live
                </Button>
              )}
              {(session.status === 'scheduled' && isHost) && (
                <Button
                  onClick={joinSession}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              )}
              <Button
                onClick={copyRoomId}
                variant="outline"
                className="border-stone-600 hover:bg-stone-800"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Room ID
              </Button>
            </div>
          </div>

          {/* Session Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-stone-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Scheduled</span>
              </div>
              <p className="text-stone-300">
                {session.scheduledAt
                  ? format(new Date(session.scheduledAt), 'PPP p')
                  : 'Not scheduled'
                }
              </p>
            </div>

            <div className="bg-stone-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="font-medium">Duration</span>
              </div>
              <p className="text-stone-300">
                {session.duration
                  ? formatDuration(session.duration)
                  : session.status === 'live'
                    ? 'In progress...'
                    : 'Not started'
                }
              </p>
            </div>

            <div className="bg-stone-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="font-medium">Started At</span>
              </div>
              <p className="text-stone-300">
                {session.startedAt
                  ? format(new Date(session.startedAt), 'PPp')
                  : 'Not started'
                }
              </p>
            </div>

            <div className="bg-stone-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-orange-400" />
                <span className="font-medium">Room ID</span>
              </div>
              <p className="text-stone-300 font-mono">{session.roomId}</p>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-stone-900 rounded-xl border border-stone-700 p-8">
          <h2 className="text-xl font-bold mb-6">Participants ({totalParticipants})</h2>

          {/* Host */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-blue-400">Host</h3>
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {session.host?.name?.charAt(0)?.toUpperCase() || 'H'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{session.host?.name}</p>
                  <p className="text-sm text-stone-400">{session.host?.email}</p>
                </div>
                <Badge className="bg-blue-600">Host</Badge>
              </div>
            </div>
          </div>

          {/* All Participants */}
          {participants.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-400">
                All Participants ({participants.length})
              </h3>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div
                    key={participant._id || index}
                    className={`rounded-lg p-4 border ${participant.isActive
                        ? 'bg-green-600/20 border-green-500/30'
                        : 'bg-stone-800 border-stone-600'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${participant.isActive ? 'bg-green-600' : 'bg-stone-600'
                          } text-white`}>
                          {participant.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{participant.user?.name}</p>
                        <div className="text-sm text-stone-400 space-y-1">
                          <p>Joined: {format(new Date(participant.joinedAt), 'PPp')}</p>
                          {participant.leftAt && (
                            <p>Left: {format(new Date(participant.leftAt), 'PPp')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={participant.isActive ? "default" : "secondary"}
                          className={participant.isActive ? 'bg-green-600' : 'bg-stone-600'}
                        >
                          {participant.isActive ? 'Active' : 'Left'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {participant.role || 'participant'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {participants.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400">No participants have joined yet</p>
            </div>
          )}
        </div>

        {/* Session Recordings */}
        {session && (
          <SessionRecordings
            sessionId={session._id}
            isHost={session.host?._id === currentUser?._id}
          />
        )}
      </div>
    </div>
  );
};

export default SessionDetails;
