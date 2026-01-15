import { FinalRecording } from '../../models/recording.model.js';

export const getSessionRecordingsService = (sessionId) =>
  FinalRecording.find({ sessionId }).sort({ uploadedAt: -1 });

export const getUserRecordingsService = (participantId) =>
  FinalRecording.find({ participantId }).sort({ uploadedAt: -1 });
