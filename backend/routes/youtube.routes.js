import express from "express";
import multer from "multer";
import {
  startYouTubeStream,
  stopYouTubeStream,
  getStreamStatus,
  getActiveStreams,
  handleStreamChunk,
  handleAudioChunk,
  getStreamHealth,
  setStreamKey,
  getStreamKey,
  updateStreamKey,
  removeStreamKey
} from "../controllers/youtubeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.use(authenticateToken);

router.post("/start-stream", startYouTubeStream);
router.post("/stop-stream", stopYouTubeStream);

router.post("/stream-chunk", upload.single("chunk"), handleStreamChunk);
router.post("/audio-chunk", upload.single("chunk"), handleAudioChunk);

router.get("/stream-status/:sessionId", getStreamStatus);
router.get("/active-streams", getActiveStreams);
router.get("/health/:sessionId", getStreamHealth);

// Stream key management
router.post("/stream-key", setStreamKey);
router.get("/stream-key/:sessionId", getStreamKey);
router.put("/stream-key", updateStreamKey);
router.delete("/stream-key", removeStreamKey);

export default router;
