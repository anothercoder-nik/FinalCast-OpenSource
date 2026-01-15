# 🎙️ FinalCast - Walkthrough & Developer Guide

> **Not Just Record — Record. Render. Release.**
> Full-stack podcasting and video conversation platform designed to provide creators with a fully rendered video after equal session.

---

## 🚀 Key Features

### 🎥 Core Studio & Recording
*   **Real-time Communication**: High-quality video/audio via WebRTC (Mesh topology) with Socket.io signaling.
*   **Zero-Knowledge Recording**:
    *   On-device `MediaRecorder` captures 3-second chunks.
    *   Chunks automatically uploaded to **Cloudinary** (via signed URLs) or **S3** (optional configuration).
    *   **Progressive Recovery**: Uploads resume if browser crashes; indexedDB buffering.
*   **Server-Side Rendering**: 
    *   Backend uses **FFmpeg** to merge chunks into a final, synced video.
    *   Automatic participant layout generation (1x1, 2x2, 3x3 grids) based on join times.
    *   Host dashboard to view and download final recordings.

### 🔴 Streaming & Broadcasting
*   **YouTube Live Integration**:
    *   Stream entire video grid directly to YouTube via RTMP.
    *   Real-time video composition using HTML5 Canvas.
    *   Server-side FFmpeg processing for RTMP protocols.
*   **Mobile Compatibility**:
    *   Optimized media constraints (lower resolution/fps) for mobile devices.
    *   Touch-friendly controls and responsive layout.

### 🔐 Security & Authentication
*   **Authentication**:
    *   Google OAuth 1.0/2.0 Integration.
    *   Session management with secure HTTP-only cookies.
*   **Two-Factor Authentication (2FA)** (Optional):
    *   TOTP support (Google Authenticator, Authy).
    *   Backup codes for account recovery.

## 🔮 Upcoming Roadmap (Planned Features)
*   **Broadcast Expansion**: Support for **Twitch** and **Facebook Live** RTMP streaming.
*   **Advanced Auth**: Magic Links and JWT stateless authentication.
*   **Audio Engineering**: 
    *   Multi-track audio export.
    *   Individual participant volume controls in-studio.
    *   Noise suppression and echo cancellation fine-tuning.
*   **Performance**:
    *   GPU Acceleration for server-side rendering.
    *   WebRTC Turn server implementation for restrictive networks.
*   **Studio Tools**: 
    *   Visual Timeline Editor (drag-and-drop clips).
    *   Screen sharing with system audio.

---

## 🛠️ Developer Setup

### Prerequisites
*   **Node.js** (v18+)
*   **MongoDB** (Atlas or Local)
*   **FFmpeg** (Required for rendering and streaming)
    *   *Windows*: Download from ffmpeg.org and add `/bin` to PATH.
    *   *Mac*: `brew install ffmpeg`
    *   *Linux*: `sudo apt install ffmpeg`

### Installation
```bash
# Clone Repository
git clone https://github.com/anothercoder-nik/FinalCast.git
cd FinalCast

# Backend Setup
cd backend
npm install
npm start # Runs on localhost:3000

# Frontend Setup
cd ../frontend
npm install
npm run dev # Runs on localhost:5173
```

### Environment Configuration
**Frontend (`frontend/.env`)**
```ini
VITE_API_URL=http://localhost:3000 # or your production URL
```

**Backend (`backend/.env`)**
```ini
PORT=3000
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:5173
# Cloudinary (for recording storage)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Deployment Configuration
*   **Deployment Targets**: 
    *   Backend: Render/Railway (Node.js service).
    *   Frontend: Vercel/Netlify (Static site).
*   **Critical Fixes**: 
    *   Ensure CORS allowed origins in `app.js` match your production domains.
    *   Verify `GOOGLE_CALLBACK_URL` matches the production backend URL exactly in Google Console.

---

> [!NOTE]
> This document consolidates previous guides. For specific module details (e.g. `socketHandlers.js`, `recordingRoutes.js`), refer to the source code comments. 
