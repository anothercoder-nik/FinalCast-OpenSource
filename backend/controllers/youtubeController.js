import YouTubeStreamingService from "../services/youtube.service.js";
import wrapAsync from "../utils/trycatchwrapper.js";

// -------------------- START STREAM --------------------

export const startYouTubeStream = wrapAsync(async (req, res) => {
  const {
    sessionId,
    rtmpUrl,
    streamKey,
    title,
    videoConfig,
    hasVideoCapture,
    inputMode
  } = req.body;

  if (!sessionId || !rtmpUrl || !streamKey) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (!rtmpUrl.startsWith("rtmp://")) {
    return res.status(400).json({
      success: false,
      message: "Invalid RTMP URL"
    });
  }

  const result = await YouTubeStreamingService.startStream({
    sessionId,
    rtmpUrl,
    streamKey,
    title,
    videoConfig,
    hasVideoCapture: hasVideoCapture === true,
    inputMode: inputMode || "webm"
  });

  res.status(200).json(result);
});

// -------------------- STOP STREAM --------------------

export const stopYouTubeStream = wrapAsync(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID required"
    });
  }

  const result = await YouTubeStreamingService.stopStream(sessionId);
  res.status(200).json(result);
});

// -------------------- STATUS --------------------

export const getStreamStatus = wrapAsync(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID required"
    });
  }

  const status = YouTubeStreamingService.getStreamStatus(sessionId);

  res.status(200).json({
    success: true,
    data: status
  });
});

// -------------------- VIDEO CHUNK --------------------

export const handleStreamChunk = wrapAsync(async (req, res) => {
  const { sessionId, timestamp } = req.body;
  const chunk = req.file;

  if (!sessionId || !chunk) {
    return res.status(400).json({
      success: false,
      message: "Session ID and chunk required"
    });
  }

  const result = await YouTubeStreamingService.processStreamChunk({
    sessionId,
    chunkData: chunk.buffer,
    timestamp: parseInt(timestamp) || Date.now(),
    mimeType: chunk.mimetype
  });

  res.status(200).json(result);
});

// -------------------- AUDIO CHUNK --------------------

export const handleAudioChunk = wrapAsync(async (req, res) => {
  const { sessionId } = req.body;
  const chunk = req.file;

  if (!sessionId || !chunk) {
    return res.status(400).json({
      success: false,
      message: "Session ID and audio chunk required"
    });
  }

  const result = await YouTubeStreamingService.processAudioChunk({
    sessionId,
    chunkData: chunk.buffer
  });

  res.status(200).json(result);
});

// -------------------- ACTIVE STREAMS --------------------

export const getActiveStreams = wrapAsync(async (req, res) => {
  const streams = YouTubeStreamingService.getAllActiveStreams();

  res.status(200).json({
    success: true,
    data: {
      count: streams.length,
      streams
    }
  });
});

// -------------------- HEALTH --------------------

export const getStreamHealth = wrapAsync(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID required"
    });
  }

  const data = YouTubeStreamingService.getHealth(sessionId);

  res.status(200).json({
    success: true,
    data
  });
});
