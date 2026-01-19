<div align="center">

  <h1>🎙️ FinalCast</h1>
  
  <h3>Record. Render. Release.</h3>
  <p><i>The open-source, browser-based broadcasting studio that handles the heavy lifting for you.</i></p>

  <p>
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-core-features">Features</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-architecture">Architecture</a>
  </p>
  
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Status](https://img.shields.io/badge/status-active-success.svg)
  ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

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
