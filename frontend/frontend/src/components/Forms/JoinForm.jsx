import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useSelector } from 'react-redux';
import { Play, Mic, Shield, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import { joinSessionByRoomId, getSessionByRoomId } from '../../api/session.api.js';

const JoinForm = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return setError('Room ID is required');

    setError('');
    setLoading(true);

    try {
      const sessionData = await getSessionByRoomId(roomId.trim());

      if (['ended', 'cancelled'].includes(sessionData.status)) {
        throw new Error(`This session has ${sessionData.status}`);
      }

      await joinSessionByRoomId(roomId.trim());
      navigate({ to: `/studio/${roomId.trim()}` });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mt-36 overflow-hidden bg-gradient-to-b from-stone-950 to-slate-950 min-h-screen">
      <Header user={user} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-md relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl" />

          <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Mic className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Join Studio Session
              </h2>
              <p className="text-slate-400 text-lg">Enter the room ID to join</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Room ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="e.g., ABC1234"
                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-400 shadow-lg font-mono tracking-wider"
                    required
                  />
                  <ArrowRight className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
                {loading ? 'Joining...' : 'Join Session'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
              <p className="text-slate-400 text-sm mb-4">Don't have a ID? Ask the host.</p>
              <div className="flex justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> Secure</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> HD Audio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ user }) => (
  <header className="sticky top-0 z-50 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        FinalCast
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-bold hover:text-white transition-colors">
          Welcome, {user.name.toUpperCase()}
        </Link>
        <UserAvatar />
      </div>
    </div>
  </header>
);

export default JoinForm;
