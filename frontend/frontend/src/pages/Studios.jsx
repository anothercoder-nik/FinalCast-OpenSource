import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@tanstack/react-router';
import { getSessions, deleteSession, updateSessionStatus } from '../api/session.api';
import { FloatingShapes } from '../components/utils/floating-shapers.jsx';
import UserAvatar from '../components/ui/UserAvatar';
import StudioCard from '../components/studio/StudioCard';
import StudioFilters from '../components/studio/StudioFilters';

const Studios = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    search: ''
  });

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const currentUser = useSelector(state => state.auth.user);
  const dropdownRef = useRef(null);

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
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(session => {
        if (filters.role === 'host') {
          return session.host._id === currentUser._id;
        } else if (filters.role === 'participant') {
          return session.participants.some(p => p.user._id === currentUser._id && p.isActive);
        }
        return true;
      });
    }

    
    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        session.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this studio?')) return;
    
    try {
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (sessionId, newStatus) => {
    try {
      await updateSessionStatus(sessionId, newStatus);
      setSessions(prev => prev.map(s => 
        s._id === sessionId ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading your studios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-stone-950 to-slate-950 text-white min-h-screen overflow-hidden -mt-36 ">
      
      {/* Header */}
      <header className='sticky top-0 z-50 backdrop-blur-lg bg-stone-950/5 border-b border-black/20'>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-3xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              FinalCast
            </h1>
          </Link>
          
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link href="/create">
                <button className="backdrop-blur-md bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white font-semibold py-2 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 border border-blue-400/40 shadow-lg">
                  + New Studio
                </button>
              </Link>
              <UserAvatar />
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Your Studios
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Manage your podcast studios, view recordings, and track your content creation journey.
          </p>
        </div>

        {/* Filters */}
        <StudioFilters filters={filters} onFiltersChange={setFilters} />

        {/* Error Message */}
        {error && (
          <div className="backdrop-blur-md bg-red-500/30 border border-red-400/50 text-red-200 px-6 py-4 rounded-xl mb-8 shadow-lg">
            {error}
          </div>
        )}

        {/* Studios Grid */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-12 max-w-md mx-auto shadow-xl">
              <div className="text-6xl mb-4">🎙️</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No Studios Found</h3>
              <p className="text-white/70 mb-6">
                {sessions.length === 0 
                  ? "You haven't created any studios yet. Start your podcasting journey!"
                  : "No studios match your current filters."
                }
              </p>
              {sessions.length === 0 && (
                <Link href="/create">
                  <button className="backdrop-blur-md bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 border border-blue-400/40 shadow-lg">
                    Create Your First Studio
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <StudioCard
                key={session._id}
                session={session}
                currentUser={currentUser}
                onDelete={handleDeleteSession}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studios;
