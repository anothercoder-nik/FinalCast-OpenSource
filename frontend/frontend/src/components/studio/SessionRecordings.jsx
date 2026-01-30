import React, { useState, useEffect } from 'react';
import { Download, Play, Eye, Calendar, Clock, HardDrive, User, AlertCircle, Video } from 'lucide-react';
import { getSessionRecordings, generateDownloadUrl } from '../../api/session.api';

const SessionRecordings = ({ sessionId, isHost, compact = false }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId && isHost) {
      loadRecordings();
    }
  }, [sessionId, isHost]);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessionRecordings(sessionId);
      // Handles both { videos: [...] } and { recordings: [...] } structures for safety
      setRecordings(data.recordings || data.videos || []);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError(err.message || 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (publicId, filename) => {
    try {
      const data = await generateDownloadUrl(publicId || filename); // fallback if publicId is missing
      const { downloadUrl } = data;

      if (!downloadUrl) throw new Error('No download URL returned');

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'recording.webm';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading video:', err);
      // Fallback to direct URL if available in recording object
      const recording = recordings.find(r => r.publicId === publicId);
      if (recording?.url) {
        window.open(recording.url, '_blank');
      } else {
        alert('Failed to download video. Please try again.');
      }
    }
  };

  const handleBulkDownload = () => {
    recordings.forEach((recording, index) => {
      setTimeout(() => {
        handleDownload(recording.publicId, recording.filename);
      }, index * 1000);
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isHost) return null;

  if (loading) {
    return (
      <div className={`${compact ? 'p-4' : 'mt-6 p-4'} bg-stone-900/50 rounded-xl border border-stone-800`}>
        <div className="flex items-center space-x-2 text-stone-100 mb-4">
          <Video className="w-5 h-5" />
          <h3 className="font-semibold">Session Recordings</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-stone-800 rounded-lg"></div>
          <div className="h-12 bg-stone-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${compact ? 'p-4' : 'mt-6 p-4'} bg-red-900/10 rounded-xl border border-red-900/30`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={loadRecordings} className="text-xs px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasRecordings = recordings.length > 0;

  return (
    <div className={`${compact ? 'p-4' : 'mt-6 p-6'} bg-stone-900/50 rounded-xl border border-stone-800`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-400" />
          Recordings
          {hasRecordings && (
            <span className="px-2 py-0.5 bg-stone-800 text-stone-400 text-xs rounded-full border border-stone-700">
              {recordings.length}
            </span>
          )}
        </h3>

        {recordings.length > 1 && (
          <button
            onClick={handleBulkDownload}
            className="flex items-center space-x-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm rounded-lg transition-colors border border-stone-700"
          >
            <Download className="w-4 h-4" />
            <span>Download All</span>
          </button>
        )}
      </div>

      {!hasRecordings ? (
        <div className="text-center py-12 border-2 border-dashed border-stone-800 rounded-xl">
          <div className="w-12 h-12 bg-stone-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6 text-stone-600" />
          </div>
          <p className="text-stone-400 font-medium">No recordings yet</p>
          <p className="text-stone-600 text-sm mt-1">
            Recordings will appear here after the session
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {recordings.map((recording) => (
            <div
              key={recording.publicId || recording._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-800/40 hover:bg-stone-800/60 rounded-xl border border-stone-800 transition-colors group"
            >
              <div className="flex items-start space-x-4 mb-3 sm:mb-0">
                {/* Icon/Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${recording.role === 'host'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                  {recording.role === 'host' ? <Play className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-stone-200">
                      {recording.participant?.name || recording.filename || 'Unknown'}
                    </h4>
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${recording.role === 'host' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                      {recording.role}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mt-1.5 text-xs text-stone-400">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(recording.duration)}
                    </span>
                    <span className="flex items-center">
                      <HardDrive className="w-3 h-3 mr-1" />
                      {formatFileSize(recording.size)}
                    </span>
                    {!compact && recording.createdAt && (
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(recording.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  onClick={() => window.open(recording.url, '_blank')}
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-700/50 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(recording.publicId, recording.filename)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-stone-100 hover:bg-white text-stone-900 text-sm font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer / Stats */}
      {hasRecordings && !compact && (
        <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>
            Total Size: {formatFileSize(recordings.reduce((acc, r) => acc + (r.size || 0), 0))}
          </span>
          <button onClick={loadRecordings} className="hover:text-stone-300 transition-colors">
            Refresh List
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionRecordings;
