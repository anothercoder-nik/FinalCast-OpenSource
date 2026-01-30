import * as uploadService from './services/recordingUpload.service.js';
import * as mergeService from './services/recordingMerge.service.js';
import * as queryService from './services/recordingQuery.service.js';
import Transcript from '../models/transcript.model.js';
import emailService from '../services/email.service.js';
import Session from '../models/session.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadChunk = async (req, res) => {
  const result = await uploadService.uploadChunkService(req);
  res.json({ success: true, ...result });
};

export const uploadFinalVideo = async (req, res) => {
  const result = await uploadService.uploadFinalVideoService(req);
  res.json({ success: true, result });
};

export const mergeChunks = async (req, res) => {
  const result = await mergeService.mergeChunksService({
    ...req.body,
    baseDir: path.join(__dirname, '../temp')
  });
  res.json({ success: true, result });
};

export const getSessionRecordings = async (req, res) => {
  res.json({ recordings: await queryService.getSessionRecordingsService(req.params.sessionId) });
};

export const getUserRecordings = async (req, res) => {
  res.json({ recordings: await queryService.getUserRecordingsService(req.params.participantId) });
};
