import express from 'express';
import multer from 'multer';
import * as controller from './recording.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 }
});

router.post(
  '/upload-chunk',
  authenticateToken,
  upload.single('chunk'),
  controller.uploadChunk
);

router.post(
  '/upload-complete-video',
  authenticateToken,
  upload.single('video'),
  controller.uploadFinalVideo
);

router.post(
  '/merge-chunks',
  authenticateToken,
  controller.mergeChunks
);

router.get(
  '/session/:sessionId/videos',
  authenticateToken,
  controller.getSessionRecordings
);

router.get(
  '/recordings/:participantId',
  authenticateToken,
  controller.getUserRecordings
);


export default router;
