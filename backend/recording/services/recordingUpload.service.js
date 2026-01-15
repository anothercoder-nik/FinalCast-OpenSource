import cloudinary from '../infra/cloudinary.client.js';
import { RecordingChunk, FinalRecording } from '../../models/recording.model.js';

export const uploadChunkService = async ({ file, body }) => {
  const { sessionId, role, participantId, chunkIndex, timestamp } = body;

  if (!file) throw new Error('No chunk file provided');

  const publicId = `sessions/${sessionId}/${role}/chunk_${chunkIndex}_${timestamp}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'video',
        format: 'webm',
        folder: `sessions/${sessionId}/${role}`
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(file.buffer);
  });

  await RecordingChunk.create({
    sessionId,
    participantId,
    role,
    publicId: result.public_id,
    chunkIndex: Number(chunkIndex),
    timestamp: Number(timestamp),
    size: result.bytes,
    duration: result.duration || 3,
    url: result.secure_url
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    size: result.bytes
  };
};

export const uploadFinalVideoService = async ({ file, body }) => {
  const { sessionId, role, participantId, participantName, duration } = body;

  const publicId = `sessions/${sessionId}/${role}-${participantId}-${Date.now()}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'video',
        format: 'webm',
        folder: `sessions/${sessionId}`,
        quality: 'auto:good'
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(file.buffer);
  });

  await FinalRecording.create({
    sessionId,
    participantId,
    role,
    publicId: result.public_id,
    url: result.secure_url,
    filename: `${role}-recording.webm`,
    displayName: role === 'host' ? 'Host Recording' : `${participantName} Recording`,
    duration: result.duration || duration,
    size: result.bytes,
    format: 'webm',
    uploadedAt: new Date()
  });

  return result;
};
