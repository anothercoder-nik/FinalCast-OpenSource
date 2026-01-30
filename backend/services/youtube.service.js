import { spawn } from 'child_process';
import { assertSafeString } from '../utils/ffmpegSecurity.js';

class YouTubeStreamingService {
  constructor() {
    this.streams = new Map();
    this.streamKeys = new Map(); // Store stream keys securely
    this.errors = new Map(); // Store errors per session
    this.statusCallbacks = new Map(); // Store status change callbacks
  }

  startStream({ sessionId, rtmpUrl, streamKey, videoConfig = {} }) {
    // FFmpeg fixup: Sanitize user inputs to prevent command injection
    try {
      assertSafeString(rtmpUrl, 'rtmpUrl');
      assertSafeString(streamKey, 'streamKey');
      // Validate videoConfig values
      Object.keys(videoConfig).forEach(key => {
        assertSafeString(String(videoConfig[key]), key);
      });
    } catch (error) {
      throw new Error(`Invalid input: ${error.message}`);
    }

    if (this.streams.has(sessionId)) {
      throw new Error('Stream already running');
    }

    if (!rtmpUrl || !streamKey) {
      throw new Error('RTMP URL and stream key required');
    }

    const {
      width = 1280,
      height = 720,
      framerate = 30,
      videoBitrate = '2500k',
      audioBitrate = '128k'
    } = videoConfig;

    const fullUrl = `${rtmpUrl}${streamKey}`;

    const args = [
      // VIDEO INPUT (JPEG frames)
      '-f', 'image2pipe',
      '-framerate', String(framerate),
      '-i', 'pipe:0',

      // AUDIO INPUT (silent fallback)
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',

      // VIDEO ENCODE
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-pix_fmt', 'yuv420p',
      '-r', String(framerate),
      '-g', String(framerate * 2),
      '-b:v', videoBitrate,

      // AUDIO ENCODE
      '-c:a', 'aac',
      '-b:a', audioBitrate,

      // OUTPUT
      '-f', 'flv',
      fullUrl
    ];

    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['pipe', 'ignore', 'pipe']
    });

    ffmpeg.stderr.on('data', d => {
      const msg = d.toString();
      if (msg.includes('frame=')) {
        this._updateStatus(sessionId, 'live');
      }
      if (msg.includes('Connection refused') || msg.includes('Server returned')) {
        console.error('❌ RTMP rejected by YouTube');
        this.addError(sessionId, 'RTMP connection failed');
        this._updateStatus(sessionId, 'error');
      }
    });

    ffmpeg.on('close', code => {
      console.log(`FFmpeg exited (${code}) for ${sessionId}`);
      this._updateStatus(sessionId, 'stopped');
      this.streams.delete(sessionId);
      this.clearErrors(sessionId);
    });

    ffmpeg.on('error', err => {
      console.error(`FFmpeg error for ${sessionId}:`, err);
      this.addError(sessionId, err.message);
      this._updateStatus(sessionId, 'error');
    });

    this.streams.set(sessionId, {
      process: ffmpeg,
      status: 'starting',
      startedAt: Date.now()
    });

    return { success: true };
  }

  sendFrame(sessionId, jpegBuffer) {
    const stream = this.streams.get(sessionId);
    if (!stream || !stream.process?.stdin) return;

    // JPEG validation (simple, safe)
    if (jpegBuffer[0] !== 0xff || jpegBuffer[1] !== 0xd8) return;

    stream.process.stdin.write(jpegBuffer);
  }

  stopStream(sessionId) {
    const stream = this.streams.get(sessionId);
    if (!stream) return;

    try {
      stream.process.stdin.end();
      stream.process.kill('SIGTERM');
    } finally {
      this.streams.delete(sessionId);
    }

    return { success: true };
  }

  getStatus(sessionId) {
    const s = this.streams.get(sessionId);
    if (!s) return { active: false };
    return {
      active: true,
      status: s.status,
      uptimeMs: Date.now() - s.startedAt,
      errors: this.errors.get(sessionId) || []
    };
  }

  // Store stream key securely
  setStreamKey(sessionId, streamKey) {
    if (!sessionId || !streamKey) {
      throw new Error('Session ID and stream key required');
    }
    this.streamKeys.set(sessionId, streamKey);
  }

  // Get stored stream key
  getStreamKey(sessionId) {
    return this.streamKeys.get(sessionId);
  }

  // Remove stream key
  removeStreamKey(sessionId) {
    this.streamKeys.delete(sessionId);
  }

  // Add error for session
  addError(sessionId, error) {
    if (!this.errors.has(sessionId)) {
      this.errors.set(sessionId, []);
    }
    const sessionErrors = this.errors.get(sessionId);
    sessionErrors.push({
      message: error.message || error,
      timestamp: Date.now()
    });
    // Keep only last 10 errors
    if (sessionErrors.length > 10) {
      sessionErrors.shift();
    }
  }

  // Clear errors for session
  clearErrors(sessionId) {
    this.errors.delete(sessionId);
  }

  // Register callback for status changes
  onStatusChange(sessionId, callback) {
    this.statusCallbacks.set(sessionId, callback);
  }

  // Remove status change callback
  removeStatusCallback(sessionId) {
    this.statusCallbacks.delete(sessionId);
  }

  // Internal method to update status and trigger callbacks
  _updateStatus(sessionId, newStatus) {
    const stream = this.streams.get(sessionId);
    if (stream && stream.status !== newStatus) {
      const oldStatus = stream.status;
      stream.status = newStatus;

      // Trigger callback if registered
      const callback = this.statusCallbacks.get(sessionId);
      if (callback) {
        callback({ sessionId, oldStatus, newStatus });
      }
    }
  }
}

export default new YouTubeStreamingService();
