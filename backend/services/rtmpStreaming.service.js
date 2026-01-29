import { spawn } from 'child_process';
import { assertSafeString } from '../utils/ffmpegSecurity.js';

const PLATFORM_RTMP_URLS = {
  youtube: process.env.YOUTUBE_RTMP_URL || 'rtmp://a.rtmp.youtube.com/live2/',
  twitch: process.env.TWITCH_RTMP_URL || 'rtmp://live.twitch.tv/app/',
  facebook: process.env.FACEBOOK_RTMP_URL || 'rtmp://live-api-s.facebook.com:80/rtmp/'
};

class RTMPStreamingService {
  constructor() {
    this.streams = new Map();
  }

  startStream({ sessionId, platform, streamKey, videoConfig = {} }) {
    // Validate platform
    if (!PLATFORM_RTMP_URLS[platform]) {
      throw new Error('Unsupported streaming platform');
    }
    const rtmpUrl = PLATFORM_RTMP_URLS[platform];

    // FFmpeg fixup: Sanitize user inputs to prevent command injection
    try {
      assertSafeString(rtmpUrl, 'rtmpUrl');
      assertSafeString(streamKey, 'streamKey');
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
      '-f', 'image2pipe',
      '-framerate', String(framerate),
      '-i', 'pipe:0',
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-pix_fmt', 'yuv420p',
      '-r', String(framerate),
      '-g', String(framerate * 2),
      '-b:v', videoBitrate,
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-ar', '48000',
      '-f', 'flv',
      fullUrl
    ];

    const ffmpeg = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'inherit'] });
    this.streams.set(sessionId, ffmpeg);
    ffmpeg.on('close', () => {
      this.streams.delete(sessionId);
    });
    return ffmpeg.stdin;
  }

  stopStream(sessionId) {
    const ffmpeg = this.streams.get(sessionId);
    if (ffmpeg) {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGINT');
      this.streams.delete(sessionId);
    }
  }
}

export default new RTMPStreamingService();
