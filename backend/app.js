import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import './config/passport.js';
import { attachuser } from './utils/attachUser.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import studioRoutes from './routes/studio.routes.js';
import recordingRoutes from './recording/recording.routes.js';
import youtubeRoutes from './routes/youtube.routes.js';
import emailRoutes from './routes/email.routes.js';
import renderRoutes from './routes/renderRoutes.js';

// ------------------ INIT ------------------
const app = express();
const server = createServer(app);
const io = new Server(server);

// ------------------ DB ------------------
connectDB();

// ------------------ PATH SETUP ------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------ MIDDLEWARE ------------------
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach user from JWT / cookie
app.use(attachuser);
app.use(passport.initialize());

// ------------------ CORS ------------------
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.onrender.com') ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.netlify.app')
  );
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ------------------ SOCKET.IO ------------------
io.engine.opts.cors = {
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
};

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
});

setupSocketHandlers(io);

// ------------------ ROUTES ------------------
app.use('/api/auth', authRoutes);
app.use('/api/sessions', studioRoutes);
app.use('/api', recordingRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/email', emailRoutes);
app.use('/api', renderRoutes);

// ------------------ STATIC FILES ------------------
app.use('/temp', express.static(path.join(__dirname, 'temp')));

// ------------------ HEALTH CHECK ------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready`);
});
