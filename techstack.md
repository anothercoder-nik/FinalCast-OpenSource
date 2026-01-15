# 🛠️ Comprehensive Tech Stack & Tools

This document lists every library, tool, and framework used in the **FinalCast** project, categorized by their function.

## 🖥️ Frontend (Client-Side)

### **Core Framework & Build**
*   **React** (`v18.3.1`) - Main UI library.
*   **Vite** (`v5.4.10`) - Next-generation frontend tooling and bundler.
*   **JavaScript (ESM)** - Application logic (configured as `"type": "module"`).

### **Styling & UI Components**
*   **Tailwind CSS** (`v4.0.0-alpha.30`) - Utility-first CSS framework.
*   **Radix UI** - Headless, accessible UI primitives:
    *   `@radix-ui/react-avatar` - User avatars.
    *   `@radix-ui/react-dialog` - Modals/Popups.
    *   `@radix-ui/react-dropdown-menu` - Dropdown menus.
    *   `@radix-ui/react-label` - Form labels.
    *   `@radix-ui/react-progress` - Progress bars.
    *   `@radix-ui/react-scroll-area` - Custom scrollbars.
    *   `@radix-ui/react-select` - Form select inputs.
    *   `@radix-ui/react-separator` - Visual dividers.
    *   `@radix-ui/react-slot` - Component composition.
    *   `@radix-ui/react-switch` - Toggle switches.
    *   `@radix-ui/react-tabs` - Tabbed interfaces.
    *   `@radix-ui/react-icons` - Radix specific icons.
*   **Material UI** (`@mui/material`, `@mui/icons-material`) - Complete component library (likely for specific pre-built components).
*   **CSS Utilities**:
    *   `clsx` - Conditional class name construction.
    *   `tailwind-merge` - Intelligent tailwind class merging (prevents conflicts).
    *   `class-variance-authority` - Component variant management.

### **Animation & Effects**
*   **Motion** (`v12.23.9`) - Powerful animation library (formerly Framer Motion).
*   **tailwindcss-animate** - Tailwinc CSS animation plugins.
*   **tw-animate-css** - Port of Animate.css for Tailwind.
*   **react-fast-marquee** - Scrolling text/element components.

### **State Management & Data Fetching**
*   **Redux Toolkit** (`@reduxjs/toolkit`) - Global state management (slices, store).
*   **React Redux** - Redux bindings for React.
*   **TanStack Query** (`@tanstack/react-query`) - Server state, caching, and data fetching hooks.
*   **Axios** - Promise-based HTTP client for API requests.

### **Routing**
*   **TanStack Router** (`@tanstack/react-router`) - Type-safe routing for React applications.

### **Icons**
*   **Lucide React** - Clean, consistent icon set.
*   **React Icons** - Collection of popular icon packs.
*   **Tabler Icons** (`@tabler/icons-react`) - Pixel-perfect SVG icons.

### **Communication & Real-time**
*   **Socket.io-client** - WebSocket client for real-time signaling and chat.

### **Forms & Utilities**
*   **date-fns** - Modern date utility library.
*   **Sonner** - Toast notification library (for success/error alerts).
*   **react-toastify** - Alternative toast notification library.
*   **next-themes** - Theme management (Dark/Light mode).
*   **express-fileupload** (Likely unused in frontend, usually backend).
*   **node-mailer** / **nodemailer** (Likely unused in frontend, strictly backend).

### **Development & Linting**
*   **ESLint** - JavaScript linting utility.
*   **PostCSS** - CSS transformation tool.
*   **Autoprefixer** - Adds vendor prefixes to CSS.
*   **@vitejs/plugin-react** - Vite plugin for Fast Refresh.
*   **eslint-plugin-react** - React specific linting rules.
*   **eslint-plugin-react-hooks** - Rules of Hooks linting.

---

## ⚙️ Backend (Server-Side)

### **Runtime & Framework**
*   **Node.js** - JavaScript runtime environment.
*   **Express.js** (`v5.1.0`) - Web framework for Node.js.

### **Database & Storage**
*   **MongoDB** - NoSQL database.
*   **Mongoose** - Object Data Modeling (ODM) library for MongoDB.

### **Authentication & Security**
*   **Passport.js** - Authentication middleware.
    *   `passport-google-oauth20` - Google Sign-In strategy.
*   **Bcrypt** - Password hashing function.
*   **JsonWebToken (JWT)** - Stateless authentication tokens.
*   **Express Session** - Session middleware.
*   **Cookie Parser** / **Cookie** - Parse HTTP request cookies.
*   **CORS** - Cross-Origin Resource Sharing middleware.
*   **Speakeasy** - Two-factor authentication (TOTP) generator.
*   **QRCode** - Application QR code generator (for 2FA).

### **Streaming & Media Processing**
*   **Socket.io** - Real-time bidirectional event-based communication.
*   **Fluent-FFmpeg** - Abstract API for FFmpeg (server-side rendering).
*   **Multer** - Middleware for handling `multipart/form-data` (file uploads).
*   **Multer-S3** - Streaming multer uploads directly to AWS S3.
*   **AWS SDK** (`aws-sdk`) - Interface for AWS services (S3).
*   **Cloudinary** - Image and video management (uploads, transformations).

### **Utilities**
*   **Dotenv** - Loads environment variables from `.env` file.
*   **Nodemailer** - Send emails from Node.js.
*   **Nodemon** - Automatically restarts server on file changes (Dev).
*   **Crypto** - Cryptographic functionality (Node.js built-in module).
*   **date-fns** - Date manipulation on the server.

---

## ☁️ Infrastructure & DevOps

*   **Vercel** - Frontend hosting/deployment (configured via `vercel.json`).
*   **Render.com** - Backend hosting (implied by configuration files).
*   **FFmpeg** - System-level dependency required for video processing.
