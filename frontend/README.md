<div align="center">

  <h1>🎙️ FinalCast</h1>
  
  <h3>Not Just Record — Record. Render. Release.</h3>
  <p><i>FinalCast is an open-source, full-stack podcasting and video conversation platform built with the MERN stack, WebRTC, and FFmpeg — designed to provide creators with a fully rendered video after every session, without needing to manually edit timeline chunks.</i></p>


---
  <p>
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-core-features">Features</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-architecture">Architecture</a>
  </p>


  
  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=102)](https://github.com/anothercoder-nik/FinalCast-OpenSource)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=anothercoder-nik.FinalCast-OpenSource)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 🚀 Why FinalCast?

Traditional streaming tools often leave you with a mess of raw footage. **FinalCast** is different. We are building a platform that doesn't just record; it **produces**.

By leveraging **WebRTC** for real-time interaction and **FFmpeg** for server-side compositing, FinalCast delivers a fully rendered, editor-ready video immediately after your session ends. No more manual stitching. No more syncing headaches.

> **Our Mission:** To democratize professional-grade live broadcasting by combining the flexibility of the web with the power of server-side rendering.

---

## 🛠️ Tech Stack

### Trusted by Engineers, Built for Creators.

#### **Frontend (The Stage)**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)

*   **State & Async:** `TanStack Query`, `Redux Toolkit`
*   **Real-time:** `Socket.io-client` for signaling
*   **Styling:** `Tailwind CSS` + `Radix UI` Primitives
*   **Animations:** `Framer Motion`



# 🏗️ FinalCast Architecture Diagram

## System Overview

FinalCast is a full-stack podcasting and video conversation platform that provides real-time recording, server-side rendering, and automated video production. The system combines WebRTC for real-time communication with FFmpeg for professional video processing.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React Frontend]
        C[Vite Dev Server]
    end

    subgraph "Real-time Communication"
        D[WebRTC Peer-to-Peer]
        E[Socket.io Signaling]
    end

    subgraph "Application Layer"
        F[Node.js Backend]
        G[Express Server]
        H[Socket.io Server]
    end

    subgraph "Processing Layer"
        I[FFmpeg Video Processing]
        J[MediaRecorder API]
        K[Chunk Upload Service]
    end

    subgraph "Data Layer"
        L[MongoDB Database]
        M[User Sessions]
        N[Recording Metadata]
    end

    subgraph "Storage Layer"
        O[Cloudinary CDN]
        P[AWS S3 Bucket]
        Q[Signed URL Upload]
    end

    subgraph "External Services"
        R[Google OAuth]
        S[YouTube RTMP]
        T[Google Gemini AI]
        U[Email Service]
    end

    subgraph "Infrastructure"
        V[Nginx RTMP Server]
        W[Docker Container]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    D --> E
    E --> H
    H --> G
    G --> F
    F --> I
    J --> K
    K --> Q
    Q --> O
    Q --> P
    F --> L
    L --> M
    L --> N
    F --> R
    F --> S
    F --> T
    F --> U
    V --> S
    W --> V
```

## Detailed Component Architecture

### Frontend Architecture

```mermaid
graph TD
    subgraph "React Application"
        A[Main.jsx]
        B[RootLayout.jsx]
        C[Router Configuration]
    end

    subgraph "State Management"
        D[Redux Store]
        E[TanStack Query]
        F[Socket Context]
    end

    subgraph "UI Components"
        G[Auth Components]
        H[Studio Components]
        I[Dashboard Components]
        J[Editor Components]
    end

    subgraph "Services & APIs"
        K[WebRTC Service]
        L[Recording API]
        M[Session API]
        N[User API]
    end

    subgraph "Hooks & Utils"
        O[Custom Hooks]
        P[Utility Functions]
        Q[WebRTC Handlers]
    end

    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    C --> J
    G --> K
    H --> K
    I --> L
    I --> M
    I --> N
    K --> O
    K --> P
    K --> Q
```

### Backend Architecture

```mermaid
graph TD
    subgraph "Entry Point"
        A[app.js]
    end

    subgraph "Core Framework"
        B[Express Server]
        C[Middleware Stack]
    end

    subgraph "Authentication"
        D[Passport.js]
        E[JWT Tokens]
        F[Google OAuth]
        G[2FA Support]
    end

    subgraph "API Routes"
        H[Auth Routes]
        I[Session Routes]
        J[Recording Routes]
        K[YouTube Routes]
    end

    subgraph "Controllers"
        L[Auth Controller]
        M[Session Controller]
        N[Recording Controller]
        O[YouTube Controller]
    end

    subgraph "Services"
        P[Auth Service]
        Q[Session Service]
        R[Recording Service]
        S[AI Service]
        T[Email Service]
    end

    subgraph "Data Access"
        U[DAO Layer]
        V[Mongoose Models]
        W[MongoDB Connection]
    end

    subgraph "Real-time"
        X[Socket.io Server]
        Y[Event Handlers]
        Z[WebRTC Signaling]
    end

    subgraph "Media Processing"
        AA[FFmpeg Client]
        BB[Recording Merge]
        CC[Video Upload]
        DD[Cloudinary Client]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    B --> H
    B --> I
    B --> J
    B --> K
    H --> L
    I --> M
    J --> N
    K --> O
    L --> P
    M --> Q
    N --> R
    O --> S
    P --> U
    Q --> U
    R --> U
    S --> U
    U --> V
    V --> W
    B --> X
    X --> Y
    Y --> Z
    R --> AA
    AA --> BB
    AA --> CC
    CC --> DD
```

## Data Flow Architecture

### Recording Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Socket.io
    participant W as WebRTC
    participant R as MediaRecorder
    participant C as Cloudinary/S3
    participant FF as FFmpeg

    U->>F: Join Session
    F->>B: Authenticate
    B->>F: Session Token
    F->>S: Connect Socket
    S->>F: Room Joined
    F->>W: Initialize WebRTC
    W->>F: Peer Connections
    F->>R: Start Recording
    R->>R: Capture 3s Chunks
    R->>C: Upload Chunks
    C->>R: Signed URLs
    R->>B: Chunk Metadata
    B->>B: Store in DB
    U->>F: End Session
    F->>B: Stop Recording
    B->>FF: Process Chunks
    FF->>FF: Merge & Render
    FF->>C: Upload Final Video
    C->>B: Video URL
    B->>F: Recording Complete
    F->>U: Download Link
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as Google OAuth
    participant DB as Database

    U->>F: Login Request
    F->>G: Redirect to Google
    G->>U: OAuth Consent
    U->>G: Grant Permission
    G->>F: Authorization Code
    F->>B: Exchange Code
    B->>G: Verify Code
    G->>B: User Profile
    B->>DB: Create/Update User
    DB->>B: User Data
    B->>F: JWT Token
    F->>F: Store Token
    F->>U: Login Success
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Development]
        B[Vite Dev Server :5173]
        C[Node Dev Server :3000]
        D[MongoDB Local/Atlas]
    end

    subgraph "Production"
        E[Vercel/Netlify]
        F[Node.js Server]
        G[MongoDB Atlas]
        H[Cloudinary/S3]
    end

    subgraph "RTMP Streaming"
        I[Docker Container]
        J[Nginx RTMP :1935]
        K[YouTube Live]
    end

    A --> B
    A --> C
    A --> D
    B --> E
    C --> F
    D --> G
    F --> H
    I --> J
    J --> K
```

## Security Architecture

```mermaid
graph TD
    subgraph "Authentication"
        A[JWT Tokens]
        B[HTTP-Only Cookies]
        C[Google OAuth 2.0]
        D[Two-Factor Auth]
    end

    subgraph "Authorization"
        E[Role-Based Access]
        F[Session Validation]
        G[API Rate Limiting]
    end

    subgraph "Data Protection"
        H[Input Validation]
        I[SQL Injection Prevention]
        J[XSS Protection]
        K[CSRF Protection]
    end

    subgraph "Network Security"
        L[CORS Configuration]
        M[Helmet Security Headers]
        N[HTTPS Enforcement]
    end

    subgraph "Media Security"
        O[Signed URLs]
        P[File Type Validation]
        Q[FFmpeg Security]
    end

    A --> E
    B --> E
    C --> A
    D --> A
    E --> F
    F --> G
    H --> I
    H --> J
    H --> K
    L --> N
    M --> N
    O --> P
    P --> Q
```

## Performance Considerations

- **WebRTC Mesh Topology**: Direct peer-to-peer connections for low latency
- **Progressive Upload**: 3-second chunks with resume capability
- **CDN Integration**: Cloudinary for global content delivery
- **Database Indexing**: Optimized queries for session and recording data
- **Caching Strategy**: Redis for session storage (planned)
- **Compression**: Video transcoding with FFmpeg for optimal file sizes

## Scalability Architecture

```mermaid
graph LR
    subgraph "Load Balancing"
        A[API Gateway]
        B[Multiple Backend Instances]
    end

    subgraph "Database"
        C[MongoDB Replica Set]
        D[Sharding Strategy]
    end

    subgraph "Storage"
        E[Multi-Region S3]
        F[CDN Distribution]
    end

    subgraph "Real-time"
        G[Socket.io Clustering]
        H[Redis Adapter]
    end

    subgraph "Processing"
        I[FFmpeg Worker Pool]
        J[Queue System]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    G --> H
    B --> I
    I --> J
```

This architecture diagram provides a comprehensive view of FinalCast's system design, showing how all components interact to deliver a seamless recording and video production experience.
#### **Backend (The Studio)**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

*   **Core:** `Node.js` + `Express`
*   **Media Processing:** `FFmpeg` (Server-side rendering & transcoding)
*   **Storage:** `AWS S3` (via Multer S3) & `Cloudinary`
*   **Auth:** `Passport.js` (Google OAuth) + `JWT`
*   **AI Integration:** `@google/generative-ai`

---

## 🎯 Core Features

| Feature | Description |
| :--- | :--- |
| **🔴 Real-time Studio** | Low-latency video calls powered by **WebRTC** and mesh networking. |
| **🎞️ Cloud Rendering** | Automatic, server-side composition of video tracks using **FFmpeg**. |
| **🤖 AI-Enhanced** | Integrated with **Google Gemini** for smart features. |
| **📁 Smart Storage** | Multipart uploads to **AWS S3** with robust failure recovery. |
| **🎼 Dynamic Layouts** | Auto-adjusting video grids that adapt as participants join. |
| **🔐 Secure Access** | `OAuth2` Google login and `JWT` session management. |
| **📡Peer-to-peer** | Peer-to=peer media exchange with fallback signaling. |
| **🎙️ Multi-participant** |  Auto layout (dynamic tiling) |
| **🪄 Visual Timeline Editor** |  Drag-and-drop layout available. | 

---

## 📂 Architecture & Folder Structure

We maintain a clean separation of concerns between the client and server.

```bash
FinalCast/
├── frontend/               # The Client Application
│   ├── src/
│   │   ├── api/            # API integration points
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom Hooks (useWebRTC, etc.)
│   │   ├── pages/          # Application Routes/Pages
│   │   ├── store/          # Redux State Management
│   │   └── utils/          # Helper functions
│   └── package.json
│
├── backend/                # The Server Application
│   ├── DAO/                # Data Access Objects (DB Layer)
│   ├── config/             # Environment & App Configuration
│   ├── controllers/        # Request Handlers
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Route Definitions
│   ├── services/           # Business Logic (Recording, Transcoding)
│   ├── socket/             # Real-time Event Handlers
│   ├── recording/          # Media Processing Utilities
│   └── app.js              # Server Entry Point
│
└── README.md
```

---

## ⚡ Getting Started

Ready to run your own studio? Follow these steps.

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   FFmpeg installed on your system path.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/anothercoder-nik/FinalCast.git
    cd FinalCast
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create .env file based on .env.example
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

4.  **Go Live!**
    Visit `http://localhost:5173` and start creating.

---

## 🤝 Contributing

We love contributions! FinalCast is built by the community, for the community.

1.  Check out our [Open Issues](./OPEN_ISSUES.md) to find a task.
2.  Fork the repo and create a branch: `git checkout -b feature/amazing-feature`.
3.  Commit your changes and push.
4.  Open a Pull Request! 🚀

---

<p align="center">
  Built with ❤️ by the FinalCast Team
</p>
