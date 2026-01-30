import React, { useState, useEffect } from 'react';
import { Download, Eye, FileVideo, Clock, User, Calendar } from 'lucide-react';
import { getParticipantRecordings, getSessionRecordings, generateDownloadUrl } from '../../api/session.api.js';
import {Skeleton} from "../ui/skeleton.jsx";

export default function RecordingsList({ participantId }) {
  const [recordings, setRecordings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | mine
  const [downloading, setDownloading] = useState(new Set());

  useEffect(() => {
    if (!participantId) return;
    loadRecordings();
  }, [participantId]);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const { recordings: userRecs } = await getParticipantRecordings(participantId);

      const sessionIds = [...new Set(userRecs.map(r => r.sessionId))];
      const grouped = {};

      await Promise.all(sessionIds.map(async (id) => {
        try {
          const { recordings } = await getSessionRecordings(id);
          grouped[id] = recordings;
        } catch {
          grouped[id] = userRecs.filter(r => r.sessionId === id);
        }
      }));

      setRecordings(grouped);
    } catch (err) {
      console.error(err);
      setError('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const download = async (rec) => {
    setDownloading(prev => new Set(prev).add(rec.id));
    try {
      const { success, downloadUrl } = await generateDownloadUrl(rec.id);
      if (success) {
        window.open(downloadUrl, '_blank');
      } else {
        throw new Error('Failed to get URL');
      }
    } catch {
      // Fallback
      let url = rec.url;
      if (url.includes('cloudinary.com')) url = url.replace('/upload/', '/upload/fl_attachment/');
      window.open(url, '_blank');
    } finally {
      setTimeout(() => setDownloading(prev => {
        const next = new Set(prev);
        next.delete(rec.id);
        return next;
      }), 2000);
    }
  };

  const formatSize = (b) => {
    if (b === 0) return '0 B';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  if (loading){
    return (
      <div className="w-screen h-screen flex justify-center items-start p-10">
        <div className="space-y-6 w-full max-w-4xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 items-center">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  const allRecs = Object.values(recordings).flat();
  if (!allRecs.length) return <div className="text-center py-8 text-gray-500">No recordings found.</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><FileVideo className="w-5 h-5" /> Recordings</h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['all', 'mine'].map(m => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === m ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {m === 'all' ? 'All Recordings' : 'My Recordings'}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(recordings).map(([sessionId, recs]) => {
        const shown = filter === 'mine' ? recs.filter(r => r.participantId === participantId) : recs;
        if (!shown.length) return null;

        return (
          <div key={sessionId} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <span className="font-mono text-sm text-gray-600">Session: {sessionId}</span>
              <span className="text-xs text-gray-500">{shown.length} video{shown.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y">
              {shown.map(rec => (
                <div key={rec.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">{rec.displayName || rec.filename}</span>
                      {rec.participantId === participantId && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">You</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={12} /> {rec.role}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(rec.duration)}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(rec.uploadedAt).toLocaleDateString()}</span>
                      <span>{formatSize(rec.size)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => window.open(rec.url, '_blank')} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => download(rec)}
                      disabled={downloading.has(rec.id)}
                      className={`p-2 rounded-lg transition-colors ${downloading.has(rec.id) ? 'text-gray-400' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'}`}
                      title="Download"
                    >
                      <Download size={18} className={downloading.has(rec.id) ? 'animate-pulse' : ''} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
