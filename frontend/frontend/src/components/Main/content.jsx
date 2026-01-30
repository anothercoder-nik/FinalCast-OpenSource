import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@tanstack/react-router';
import { getSessions } from '../../api/session.api';
import { FloatingShapes } from '../utils/floating-shapers.jsx';
import Navbar from '../utils/Navbar';
import SessionRecordings from '../studio/SessionRecordings';
import {
  ArrowLeft, Calendar, Clock, Users, Play, Video, Search, RefreshCw, Layers
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Content = () => {
  const currentUser = useSelector(state => state.auth.user);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      // Only show sessions where the current user is the host
      const hostSessions = data.filter(session => session.host._id === currentUser._id);
      setSessions(hostSessions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(term) ||
        session.description?.toLowerCase().includes(term)
      );
    }
    setFilteredSessions(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'live': return 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse';
      case 'ended': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-stone-500/10 text-stone-500 border-stone-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white">
        <FloatingShapes />
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-stone-900 rounded w-1/3"></div>
            <div className="h-64 bg-stone-900 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-purple-500/30">
      <FloatingShapes />
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent inline-flex items-center gap-3">
              <Layers className="text-blue-400" />
              Content Library
            </h1>
            <p className="text-stone-400 mt-2 text-lg">
              Manage your sessions and access recordings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSessions}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors flex items-center gap-2 border border-stone-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync</span>
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-stone-100 hover:bg-white text-stone-900 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-stone-900/50 backdrop-blur-md border border-stone-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-stone-600"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {/* List */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-20 bg-stone-900/30 rounded-2xl border border-stone-800/50">
            <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-stone-600" />
            </div>
            <h3 className="text-xl font-semibold text-stone-300 mb-2">No Sessions Found</h3>
            <p className="text-stone-500 mb-6">
              {sessions.length === 0
                ? "You haven't hosted any sessions yet."
                : "Try adjusting your filters to find what you're looking for."
              }
            </p>
            {sessions.length === 0 && (
              <Link
                to="/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
              >
                <Play className="w-4 h-4 mr-2" />
                Create New Session
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session._id}
                className="bg-stone-900/40 backdrop-blur-sm border border-stone-800 rounded-xl overflow-hidden hover:border-stone-700 transition-all"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-stone-100 truncate">{session.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                    {session.description && (
                      <p className="text-stone-400 text-sm mb-4 line-clamp-2">{session.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {session.scheduledAt
                            ? new Date(session.scheduledAt).toLocaleString()
                            : 'Unscheduled'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{session.participants?.length || 0} participants</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(session.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start mt-1 md:mt-0">
                    <button
                      onClick={() => setExpandedSession(expandedSession === session._id ? null : session._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${expandedSession === session._id
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
                        }`}
                    >
                      <Video className="w-4 h-4" />
                      {expandedSession === session._id ? 'Hide Recordings' : 'View Recordings'}
                    </button>

                    <Link
                      to={`/session-details/${session.roomId}`}
                      className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors border border-transparent hover:border-stone-700"
                      title="Details"
                    >
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </Link>
                  </div>
                </div>

                {/* Expanded Recordings View */}
                {expandedSession === session._id && (
                  <div className="border-t border-stone-800/50 bg-stone-950/30 p-4 animate-in slide-in-from-top-2 duration-200">
                    <SessionRecordings
                      sessionId={session._id}
                      isHost={true}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;