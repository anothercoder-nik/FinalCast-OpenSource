/**
 * Cloud Recording Manager for FinalCast
 * Records individual participant streams and uploads to cloud storage
 */

import { getApiUrl } from './config.js';

class CloudRecordingManager {
  constructor(options = {}) {
    // Recording state
    this.isRecording = false;
    this.sessionId = null;
    this.recordingId = null;
    this.startTime = null;
    this.participants = new Map();
    this.recorders = new Map();
    this.recordedData = new Map();
    
    // Quality settings with defaults
    this.options = {
      videoBitsPerSecond: options.videoBitsPerSecond || 2500000, // 2.5Mbps
      audioBitsPerSecond: options.audioBitsPerSecond || 128000,  // 128kbps
      mimeType: this.getSupportedMimeType(),
      videoWidth: options.videoWidth || 1280,
      videoHeight: options.videoHeight || 720,
      frameRate: options.frameRate || 30,
      ...options
    };

    // Upload configuration
    this.uploadEndpoint = `${getApiUrl()}/api/recordings/upload`;
    this.chunkSize = 1024 * 1024; // 1MB chunks for upload

    console.log('🎬 CloudRecordingManager initialized with options:', this.options);
  }

  /**
   * Get the best supported MIME type for recording
   */
  getSupportedMimeType() {
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('📹 Using MIME type:', mimeType);
        return mimeType;
      }
    }
    
    throw new Error('No supported MIME type found for recording');
  }

  /**
   * Update recording quality settings
   */
  updateQualitySettings(settings) {
    this.options = { ...this.options, ...settings };
    console.log('⚙️ Updated recording settings:', this.options);
    return this.options;
  }

  /**
   * Add participant for recording
   */
  addParticipant(userId, userName, stream, isHost = false) {
    if (!userId || !stream) {
      console.warn('❌ Invalid participant data:', { userId, hasStream: !!stream });
      return false;
    }

    // Validate stream has tracks
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    if (videoTracks.length === 0 && audioTracks.length === 0) {
      console.warn('❌ Stream has no tracks for participant:', userId);
      return false;
    }

    const participantData = {
      userId,
      userName: userName || `User ${userId}`,
      stream,
      isHost,
      hasVideo: videoTracks.length > 0,
      hasAudio: audioTracks.length > 0,
      addedAt: Date.now()
    };

    this.participants.set(userId, participantData);
    console.log('✅ Added participant for recording:', {
      userId,
      userName: participantData.userName,
      hasVideo: participantData.hasVideo,
      hasAudio: participantData.hasAudio
    });

    return true;
  }

  /**
   * Remove participant from recording
   */
  removeParticipant(userId) {
    if (this.isRecording) {
      this.stopParticipantRecording(userId);
    }
    
    const removed = this.participants.delete(userId);
    if (removed) {
      console.log('🗑️ Removed participant from recording:', userId);
    }
    return removed;
  }

  /**
   * Start recording session
   */
  async startRecording(sessionId) {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    if (this.participants.size === 0) {
      throw new Error('No participants to record');
    }

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    console.log('🎬 Starting cloud recording for session:', sessionId);
    
    try {
      // Initialize recording session
      this.sessionId = sessionId;
      this.recordingId = `rec_${sessionId}_${Date.now()}`;
      this.startTime = Date.now();
      this.isRecording = true;

      // Create recording entry in backend
      await this.createRecordingSession();

      // Start recording each participant
      const recordingPromises = [];
      for (const [userId, participant] of this.participants) {
        const promise = this.startParticipantRecording(userId, participant);
        recordingPromises.push(promise);
      }

      await Promise.all(recordingPromises);
      
      console.log('✅ Recording started for', this.participants.size, 'participants');
      return {
        recordingId: this.recordingId,
        participants: this.participants.size,
        startTime: this.startTime
      };

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Start recording for individual participant
   */
  async startParticipantRecording(userId, participant) {
    try {
      console.log('🎥 Starting recording for participant:', participant.userName);

      const mediaRecorder = new MediaRecorder(participant.stream, {
        videoBitsPerSecond: this.options.videoBitsPerSecond,
        audioBitsPerSecond: this.options.audioBitsPerSecond,
        mimeType: this.options.mimeType
      });

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
          console.log(`📦 Data chunk received for ${participant.userName}:`, event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🔴 Recording stopped for participant:', participant.userName);
        
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: this.options.mimeType });
          this.recordedData.set(userId, {
            blob,
            participantName: participant.userName,
            isHost: participant.isHost,
            duration: Date.now() - this.startTime,
            size: blob.size
          });

          console.log(`💾 Recording data ready for ${participant.userName}:`, {
            size: blob.size,
            duration: Date.now() - this.startTime
          });

          // Start upload process
          await this.uploadParticipantRecording(userId, blob, participant);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error(`❌ Recording error for ${participant.userName}:`, event.error);
      };

      // Store recorder reference
      this.recorders.set(userId, mediaRecorder);

      // Start recording with data interval
      mediaRecorder.start(1000); // Collect data every second
      
      console.log(`✅ MediaRecorder started for ${participant.userName}`);

    } catch (error) {
      console.error(`❌ Failed to start recording for ${participant.userName}:`, error);
      throw error;
    }
  }

  /**
   * Stop recording session
   */
  async stopRecording() {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    console.log('🔴 Stopping recording session...');

    try {
      // Stop all individual recorders
      const stopPromises = [];
      for (const [userId, recorder] of this.recorders) {
        if (recorder && recorder.state === 'recording') {
          stopPromises.push(this.stopParticipantRecording(userId));
        }
      }

      await Promise.all(stopPromises);

      const duration = Date.now() - this.startTime;
      const participantCount = this.participants.size;

      // Update recording session status
      await this.finalizeRecordingSession(duration);

      // Reset recording state
      this.isRecording = false;
      this.recorders.clear();
      
      console.log('✅ Recording session completed:', {
        duration,
        participants: participantCount,
        recordingId: this.recordingId
      });

      return {
        recordingId: this.recordingId,
        duration,
        participants: participantCount,
        files: this.recordedData.size
      };

    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording for individual participant
   */
  async stopParticipantRecording(userId) {
    const recorder = this.recorders.get(userId);
    const participant = this.participants.get(userId);
    
    if (!recorder || !participant) {
      console.warn('⚠️ No recorder found for participant:', userId);
      return;
    }

    return new Promise((resolve) => {
      if (recorder.state === 'recording') {
        recorder.onstop = () => {
          console.log(`🔴 Stopped recording for: ${participant.userName}`);
          resolve();
        };
        recorder.stop();
      } else {
        resolve();
      }
    });
  }

  /**
   * Create recording session in backend
   */
  async createRecordingSession() {
    try {
      const response = await fetch(`${getApiUrl()}/api/recordings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordingId: this.recordingId,
          sessionId: this.sessionId,
          participants: Array.from(this.participants.values()).map(p => ({
            userId: p.userId,
            userName: p.userName,
            isHost: p.isHost
          })),
          settings: this.options,
          startTime: this.startTime
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create recording session: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Recording session created in backend:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to create recording session:', error);
      throw error;
    }
  }

  /**
   * Upload participant recording to cloud
   */
  async uploadParticipantRecording(userId, blob, participant) {
    try {
      console.log(`☁️ Starting upload for ${participant.userName}...`);

      const formData = new FormData();
      formData.append('recordingId', this.recordingId);
      formData.append('sessionId', this.sessionId);
      formData.append('participantId', userId);
      formData.append('participantName', participant.userName);
      formData.append('isHost', participant.isHost);
      formData.append('file', blob, `${participant.userName}_${userId}.webm`);
      formData.append('duration', Date.now() - this.startTime);
      formData.append('size', blob.size);

      const response = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Upload completed for ${participant.userName}:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Upload failed for ${participant.userName}:`, error);
      throw error;
    }
  }

  /**
   * Finalize recording session
   */
  async finalizeRecordingSession(duration) {
    try {
      const response = await fetch(`${getApiUrl()}/api/recordings/${this.recordingId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration,
          endTime: Date.now(),
          status: 'completed',
          fileCount: this.recordedData.size
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to finalize recording: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Recording session finalized:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to finalize recording:', error);
      throw error;
    }
  }

  /**
   * Get recording duration
   */
  getRecordingDuration() {
    if (!this.isRecording || !this.startTime) {
      return 0;
    }
    return Date.now() - this.startTime;
  }

  /**
   * Get recording status
   */
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      recordingId: this.recordingId,
      sessionId: this.sessionId,
      duration: this.getRecordingDuration(),
      participants: this.participants.size,
      settings: this.options
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.isRecording) {
      this.stopRecording().catch(console.error);
    }
    
    this.participants.clear();
    this.recorders.clear();
    this.recordedData.clear();
    console.log('🧹 CloudRecordingManager cleaned up');
  }
}

export default CloudRecordingManager;
