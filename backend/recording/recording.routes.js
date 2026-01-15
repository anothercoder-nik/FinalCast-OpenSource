import express from 'express';
import multer from 'multer';
import * as controller from './recording.controller.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 }
});

router.post('/upload-chunk', upload.single('chunk'), controller.uploadChunk);
router.post('/upload-complete-video', upload.single('video'), controller.uploadFinalVideo);
router.post('/merge-chunks', controller.mergeChunks);
router.get('/session/:sessionId/videos', controller.getSessionRecordings);
router.get('/recordings/:participantId', controller.getUserRecordings);

export default router;
