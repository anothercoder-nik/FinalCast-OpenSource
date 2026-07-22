# Multi-Platform RTMP Streaming Feature

## Overview
FinalCast now supports live streaming to multiple platforms: **YouTube**, **Twitch**, and **Facebook Live** using RTMP (Real-Time Messaging Protocol).

## What Was Added

### Backend Changes

1. **New RTMP Streaming Service** (`backend/services/rtmpStreaming.service.js`)
   - Generic RTMP streaming service supporting multiple platforms
   - Platform-specific RTMP URL configuration
   - Secure input validation to prevent command injection
   - FFmpeg-based video encoding and streaming

2. **Updated Controller** (`backend/controllers/youtubeController.js`)
   - Now accepts `platform` parameter (youtube, twitch, facebook)
   - Validates platform selection
   - Routes to appropriate RTMP endpoint

3. **Environment Variables** (`backend/.env.example`)
   ```bash
   YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2/
   TWITCH_RTMP_URL=rtmp://live.twitch.tv/app/
   FACEBOOK_RTMP_URL=rtmp://live-api-s.facebook.com:80/rtmp/
   ```

### Frontend Changes

1. **New RTMP Live Modal** (`frontend/src/components/studio/RTMPLiveModal.jsx`)
   - Platform selection UI (YouTube, Twitch, Facebook)
   - Dynamic RTMP URL and help text based on selected platform
   - Stream key input with platform-specific guidance
   - Visual platform icons and branding

2. **RTMP Modal Wrapper** (`frontend/src/components/studio/RTMPModal.jsx`)
   - State management for multi-platform streaming
   - Platform switching logic
   - Form validation and error handling

3. **Updated Studio Room** (`frontend/src/components/Main/StudioRoomComplete.jsx`)
   - Integrated new RTMP modal
   - API calls to start/stop streaming
   - Toast notifications for stream status
   - Platform-aware streaming controls

4. **RTMP API Client** (`frontend/src/api/rtmp.api.js`)
   - `startRTMPStream()` - Start streaming to any platform
   - `stopRTMPStream()` - Stop active stream
   - `getRTMPStreamStatus()` - Check stream status
   - `getActiveRTMPStreams()` - List all active streams

5. **Environment Variables** (`frontend/.env.example`)
   ```bash
   VITE_YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2/
   VITE_TWITCH_RTMP_URL=rtmp://live.twitch.tv/app/
   VITE_FACEBOOK_RTMP_URL=rtmp://live-api-s.facebook.com:80/rtmp/
   ```

## How to Use

### For Users

1. **Start a Studio Session**
   - Create or join a studio session
   - Click the "Go Live" button in the top bar

2. **Select Streaming Platform**
   - Choose from YouTube, Twitch, or Facebook tabs
   - The RTMP URL will auto-populate based on your selection

3. **Enter Stream Key**
   - **YouTube**: Find in YouTube Studio → Go Live → Stream
   - **Twitch**: Find in Twitch Dashboard → Stream
   - **Facebook**: Find in Facebook Live Producer

4. **Start Streaming**
   - Click "Start Streaming"
   - Your studio video grid will be broadcast to the selected platform
   - Click "Stop Stream" to end the broadcast

### For Developers

#### Starting a Stream (Frontend)
```javascript
import { startRTMPStream } from '../../api/rtmp.api';

const config = {
  sessionId: 'session-id',
  platform: 'twitch', // 'youtube', 'twitch', or 'facebook'
  streamKey: 'your-stream-key',
  title: 'My Live Stream',
  hasVideoCapture: true,
  inputMode: 'webm'
};

await startRTMPStream(config);
```

#### Stopping a Stream (Frontend)
```javascript
import { stopRTMPStream } from '../../api/rtmp.api';

await stopRTMPStream('session-id');
```

#### Backend Service Usage
```javascript
import RTMPStreamingService from './services/rtmpStreaming.service.js';

// Start streaming
RTMPStreamingService.startStream({
  sessionId: 'session-123',
  platform: 'twitch',
  streamKey: 'live_xxxx_yyyy',
  videoConfig: {
    width: 1280,
    height: 720,
    framerate: 30,
    videoBitrate: '2500k',
    audioBitrate: '128k'
  }
});

// Stop streaming
RTMPStreamingService.stopStream('session-123');

// Get status
const status = RTMPStreamingService.getStreamStatus('session-123');
```

## Configuration

### Backend Setup
1. Copy `.env.example` to `.env`
2. Configure RTMP URLs (optional, defaults provided):
   ```bash
   YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2/
   TWITCH_RTMP_URL=rtmp://live.twitch.tv/app/
   FACEBOOK_RTMP_URL=rtmp://live-api-s.facebook.com:80/rtmp/
   ```

### Frontend Setup
1. Copy `.env.example` to `.env`
2. Configure RTMP URLs (optional, defaults provided):
   ```bash
   VITE_YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2/
   VITE_TWITCH_RTMP_URL=rtmp://live.twitch.tv/app/
   VITE_FACEBOOK_RTMP_URL=rtmp://live-api-s.facebook.com:80/rtmp/
   ```

## Platform-Specific Notes

### YouTube
- RTMP URL: `rtmp://a.rtmp.youtube.com/live2/`
- Stream key format: Usually starts with alphanumeric characters
- Setup: YouTube Studio → Go Live → Stream Settings

### Twitch
- RTMP URL: `rtmp://live.twitch.tv/app/`
- Stream key format: Usually starts with `live_`
- Setup: Twitch Dashboard → Settings → Stream

### Facebook
- RTMP URL: `rtmp://live-api-s.facebook.com:80/rtmp/`
- Stream key format: Varies by account
- Setup: Facebook Live Producer → Streaming Software

## Security Features

- **Input Validation**: All user inputs are sanitized to prevent command injection
- **Platform Whitelisting**: Only approved platforms (YouTube, Twitch, Facebook) are supported
- **Stream Key Protection**: Stream keys are transmitted securely and not logged

## Troubleshooting

### Stream Won't Start
1. Verify FFmpeg is installed: `ffmpeg -version`
2. Check stream key is correct for the platform
3. Ensure RTMP URL matches the platform
4. Check backend logs for detailed error messages

### Stream Disconnects
1. Check internet connection stability
2. Verify platform streaming limits (bitrate, resolution)
3. Check FFmpeg process logs
4. Ensure platform account has streaming enabled

### Can't Find Stream Key
- **YouTube**: Must enable live streaming (24-hour verification for new accounts)
- **Twitch**: Must have affiliate/partner status or wait for access
- **Facebook**: Must meet platform requirements for live streaming

## API Endpoints

### Start Stream
```
POST /api/youtube/start-stream
Content-Type: application/json

{
  "sessionId": "string",
  "platform": "youtube|twitch|facebook",
  "streamKey": "string",
  "title": "string (optional)",
  "videoConfig": {
    "width": 1280,
    "height": 720,
    "framerate": 30,
    "videoBitrate": "2500k",
    "audioBitrate": "128k"
  }
}
```

### Stop Stream
```
POST /api/youtube/stop-stream
Content-Type: application/json

{
  "sessionId": "string"
}
```

### Get Stream Status
```
GET /api/youtube/stream-status/:sessionId
```

### Get Active Streams
```
GET /api/youtube/active-streams
```

## Future Enhancements

- [ ] Multi-platform simultaneous streaming
- [ ] Stream health monitoring and auto-reconnect
- [ ] Adaptive bitrate based on connection quality
- [ ] Stream analytics and viewer count
- [ ] Custom RTMP server support
- [ ] Stream recording alongside broadcasting
- [ ] Platform-specific optimizations (encoding presets)

## Contributing

To contribute to this feature:
1. Test streaming to different platforms
2. Report bugs or suggest improvements
3. Add support for additional platforms
4. Improve error handling and user feedback

## License

This feature is part of FinalCast and follows the same MIT license.
