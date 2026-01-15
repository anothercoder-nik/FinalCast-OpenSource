import fs from 'fs';
import path from 'path';
import cloudinary from '../infra/cloudinary.client.js';
import ffmpeg from '../infra/ffmpeg.client.js';
import { RecordingChunk, FinalRecording } from '../../models/recording.model.js';

export const mergeChunksService = async ({ sessionId, participantId, role, baseDir }) => {
  const chunks = await RecordingChunk.find({ sessionId, participantId, role, processed: false })
    .sort({ chunkIndex: 1 });

  if (!chunks.length) throw new Error('No chunks to merge');

  const tempDir = path.join(baseDir, sessionId);
  fs.mkdirSync(tempDir, { recursive: true });

  const files = await Promise.all(
    chunks.map(async (chunk, i) => {
      const filePath = path.join(tempDir, `chunk_${i}.webm`);
      const res = await fetch(chunk.url);
      fs.writeFileSync(filePath, Buffer.from(await res.arrayBuffer()));
      return filePath;
    })
  );

  const listPath = path.join(tempDir, 'list.txt');
  fs.writeFileSync(listPath, files.map(f => `file '${f}'`).join('\n'));

  const outputPath = path.join(tempDir, `${role}.mp4`);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const upload = await cloudinary.uploader.upload(outputPath, {
    resource_type: 'video',
    folder: `sessions/${sessionId}/final`
  });

  await FinalRecording.create({
    sessionId,
    participantId,
    role,
    publicId: upload.public_id,
    url: upload.secure_url,
    filename: `${role}_${participantId}.mp4`,
    duration: upload.duration,
    size: upload.bytes,
    format: 'mp4',
    totalChunks: chunks.length
  });

  await RecordingChunk.updateMany(
    { sessionId, participantId, role },
    { processed: true }
  );

  return upload;
};
