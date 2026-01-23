import { spawn } from 'child_process';
import { assertSafeString } from '../utils/ffmpegSecurity.js';

class YouTubeStreamingService {
  constructor() {
    this.streams = new Map();
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
        const s = this.streams.get(sessionId);
        if (s) s.status = 'live';
      }
      if (msg.includes('Connection refused') || msg.includes('Server returned')) {
        console.error('❌ RTMP rejected by YouTube');
      }
    });

    ffmpeg.on('close', code => {
      console.log(`FFmpeg exited (${code}) for ${sessionId}`);
      this.streams.delete(sessionId);
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
      uptimeMs: Date.now() - s.startedAt
    };
  }
}

export default new YouTubeStreamingService();
