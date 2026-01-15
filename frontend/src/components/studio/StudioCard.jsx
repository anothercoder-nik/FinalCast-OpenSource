import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Users,
  Crown,
  Radio,
  CheckCircle2,
  XCircle,
  Clipboard,
  MoreVertical,
  Play,
  Trash2,
  BarChart2,
  Wand2,
  Eye,
  StopCircle
} from 'lucide-react';

const StudioCard = ({ session, currentUser, onDelete, onStatusUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!currentUser || !session) {
    return (
      <div className="backdrop-blur-md bg-stone-900/40 border border-stone-800 rounded-2xl p-6 h-[300px] flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-stone-700 border-t-stone-500 animate-spin"></div>
      </div>
    );
  }

  const isHost = session?.host?._id === currentUser?._id;
  const isParticipant = session?.participants?.some(p => p.user?._id === currentUser?._id && p.isActive) || false;
  const activeParticipants = session.participants.filter(p => p.isActive);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'live': return 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse';
      case 'ended': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
      default: return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'live': return <Radio className="w-4 h-4" />;
      case 'ended': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clipboard className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await onStatusUpdate(session._id, newStatus);
      setShowMenu(false);
      toast.success(`Session ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(session._id);
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-stone-900/40 border border-stone-800 rounded-2xl p-6 hover:border-stone-700 transition-all group flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xl font-bold text-stone-100 mb-2 truncate group-hover:text-blue-400 transition-colors">
            {session.title}
          </h3>
          <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
            {getStatusIcon(session.status)}
            <span className="capitalize">{session.status}</span>
          </div>
        </div>

        {/* Menu */}
        {isHost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                  {session.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusUpdate('live')}
                      className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-stone-800 flex items-center gap-2"
                    >
                      <Radio className="w-4 h-4" /> Start Live
                    </button>
                  )}
                  {session.status === 'live' && (
                    <button
                      onClick={() => handleStatusUpdate('ended')}
                      className="w-full text-left px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 flex items-center gap-2"
                    >
                      <StopCircle className="w-4 h-4" /> End Session
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-stone-800 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                  <div className="my-1 border-t border-stone-800" />
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-stone-800 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {session.description && (
        <p className="text-stone-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
          {session.description}
        </p>
      )}

      {/* Participants & Role */}
      <div className="flex items-center gap-4 mb-6 text-sm text-stone-400">
        <div className="flex items-center gap-1.5" title="Active Participants">
          <Users className="w-4 h-4" />
          <span>
            {activeParticipants.length}/{session.maxParticipants}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-800/50 border border-stone-800">
          <Crown className={`w-3 h-3 ${isHost ? 'text-amber-400' : 'text-stone-500'}`} />
          <span>{isHost ? 'You (Host)' : session.host.name}</span>
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Timing */}
      <div className="flex flex-col gap-1 mb-6 text-xs text-stone-500 font-medium tracking-wide">
        {session.scheduledAt && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(session.scheduledAt), 'MMM dd, yyyy • HH:mm')}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Created {formatDistanceToNow(new Date(session.createdAt))} ago</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        {session.status === 'live' ? (
          <Link to={`/studio/${session.roomId}`} className="flex-1">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
              <Radio className="w-4 h-4 animate-pulse" /> Join Live
            </button>
          </Link>
        ) : session.status === 'ended' ? (
          <>
            <Link to={`/session-details/${session.roomId}`} className="flex-1">
              <button className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium py-2 px-3 rounded-xl transition-colors border border-stone-700 flex items-center justify-center gap-2 text-sm">
                <BarChart2 className="w-4 h-4" /> Details
              </button>
            </Link>
            <Link to={`/editor/${session._id}`} className="flex-1">
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 text-sm">
                <Wand2 className="w-4 h-4" /> Edit
              </button>
            </Link>
          </>
        ) : (
          <Link to={`/studio/${session.roomId}`} className="flex-1">
            <button className="w-full bg-stone-100 hover:bg-white text-stone-900 font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              {isHost ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isHost ? 'Start Session' : 'View Session'}
            </button>
          </Link>
        )}

        {session.roomId && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(session.roomId);
              toast.success('Room ID copied to clipboard');
            }}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white rounded-xl transition-colors border border-stone-700"
            title="Copy Room ID"
          >
            <Clipboard className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudioCard;
