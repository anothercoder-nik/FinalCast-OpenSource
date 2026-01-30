/**
 * Video Grid Stream Manager for YouTube Live Streaming
 * Captures the entire video grid (all participants) and streams to YouTube
 */

import { getApiUrl } from './config.js';

class VideoGridStreamManager {
  constructor() {
    this.isStreaming = false;
    this.mediaRecorder = null;
    this.captureStream = null;
    this.canvas = null;
    this.context = null;
    this.animationFrame = null;
    this.streamConfig = null;
  }

  /**
   * Start streaming the video grid to YouTube
   * @param {Object} config - Stream configuration
   * @param {string} config.rtmpUrl - YouTube RTMP URL
   * @param {string} config.streamKey - YouTube stream key
   * @param {string} config.title - Stream title
   * @param {string} config.sessionId - Session ID
   * @param {HTMLElement} videoGridElement - The video grid container element
   * @param {Object} participants - All participants data
   */
  async startGridStreaming(config, videoGridElement, participants) {
    try {
      console.log('🎥 Starting Video Grid YouTube streaming...');
      
      if (this.isStreaming) {
        throw new Error('Grid streaming already active');
      }

      this.streamConfig = config;
      
      // Wait for video elements to be ready
      await this.waitForVideoElements(videoGridElement);
      
      // Create offscreen canvas for grid composition
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1280;
      this.canvas.height = 720;
      this.context = this.canvas.getContext('2d');
      
      // Start capturing the grid
      await this.startGridCapture(videoGridElement, participants);
      
      // Create MediaRecorder from canvas stream
      this.captureStream = this.canvas.captureStream(30); // 30 FPS
      console.log('🎬 Canvas stream created:', {
        active: this.captureStream.active,
        videoTracks: this.captureStream.getVideoTracks().length,
        audioTracks: this.captureStream.getAudioTracks().length
      });
      
      // Add audio from all participants
      await this.addAudioTracks(participants);
      
      // Configure MediaRecorder
      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4'
      ];
      
      let selectedMimeType = null;
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('No supported video format found for streaming');
      }
      
      this.mediaRecorder = new MediaRecorder(this.captureStream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000,  // 2.5 Mbps
        audioBitsPerSecond: 128000    // 128 kbps
      });
      
      // Set up data handling
      this.setupRecorderHandlers();
      
      // Start recording with more frequent chunks for live streaming
      this.mediaRecorder.start(250); // 250ms chunks for better real-time streaming
      this.isStreaming = true;
      
      // Add a timer to monitor chunk generation
      this.chunkMonitor = setInterval(() => {
        console.log('🔍 MediaRecorder monitoring:', {
          state: this.mediaRecorder.state,
          streamActive: this.captureStream.active,
          videoTracks: this.captureStream.getVideoTracks().map(t => ({
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState
          }))
        });
        
        // Request a chunk if none received recently
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.requestData();
        }
      }, 2000); // Check every 2 seconds
      
      console.log('✅ Video Grid YouTube streaming started successfully');
      console.log('📊 MediaRecorder state:', this.mediaRecorder.state);
      console.log('📊 Canvas stream tracks:', this.captureStream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState
      })));
      
      return {
        success: true,
        message: 'Video grid streaming to YouTube started',
        streamInfo: {
          title: config.title,
          resolution: '1280x720',
          frameRate: 30,
          participants: Object.keys(participants).length,
          mimeType: selectedMimeType
        }
      };
      
    } catch (error) {
      console.error('❌ Failed to start grid streaming:', error);
      await this.stopGridStreaming();
      throw error;
    }
  }

  /**
   * Wait for video elements to be ready for capture
   */
  async waitForVideoElements(videoGridElement) {
    console.log('⏳ Waiting for video elements to be ready...');
    
    const maxWaitTime = 5000; // 5 seconds max wait
    const checkInterval = 100; // Check every 100ms
    let waitTime = 0;
    
    return new Promise((resolve) => {
      const checkVideos = () => {
        const videoElements = videoGridElement.querySelectorAll('video');
        const readyVideos = Array.from(videoElements).filter(video => {
          return video.srcObject && 
                 video.readyState >= 1 && // More lenient - HAVE_METADATA or higher
                 video.srcObject.getVideoTracks().length > 0;
        });
        
        console.log(`📹 Found ${readyVideos.length}/${videoElements.length} ready video elements (waitTime: ${waitTime}ms)`);
        
        if (readyVideos.length > 0 || waitTime >= maxWaitTime) {
          console.log(`✅ Video elements ready after ${waitTime}ms`);
          resolve();
        } else {
          waitTime += checkInterval;
          setTimeout(checkVideos, checkInterval);
        }
      };
      
      checkVideos();
    });
  }

  /**
   * Start capturing the video grid by drawing all participant videos to canvas
   */
  async startGridCapture(videoGridElement, participants) {
    console.log('🎬 Starting video grid capture from DOM elements');
    
    const drawFrame = () => {
      if (!this.isStreaming || !this.context) return;
      
      try {
        // Clear canvas with dark background
        this.context.fillStyle = '#1a1a1a'; // Dark background
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get all video elements from the grid that are actually playing
        const videoElements = videoGridElement.querySelectorAll('video');
        console.log(`🔍 Found ${videoElements.length} total video elements`);
        
        // Enhanced filtering with more detailed logging
        const activeVideos = Array.from(videoElements).filter((video, index) => {
          const hasStream = !!video.srcObject;
          const readyState = video.readyState;
          const hasVideoTrack = video.srcObject?.getVideoTracks().length > 0;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          
          console.log(`📹 Video ${index}:`, {
            hasStream,
            readyState: readyState + ` (${['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][readyState] || 'UNKNOWN'})`,
            hasVideoTrack,
            dimensions: `${videoWidth}x${videoHeight}`,
            srcObjectId: video.srcObject?.id
          });
          
          // More lenient filtering - include videos with streams even if not fully ready
          return hasStream && hasVideoTrack && readyState >= 1; // HAVE_METADATA or higher
        });
        
        console.log(`📹 Found ${activeVideos.length} active video elements for streaming`);
        
        if (activeVideos.length === 0) {
          // Draw "Waiting for participants" message with animation
          this.drawWaitingMessage();
          // Add a simple animation to ensure canvas content changes
          this.drawAnimatedElement();
        } else {
          // Calculate optimal grid layout
          const layout = this.calculateGridLayout(activeVideos.length);
          
          // Draw each active video to canvas
          activeVideos.forEach((video, index) => {
            this.drawVideoToCanvas(video, index, layout);
          });
          
          // Draw stream overlay with live information
          this.drawStreamOverlay(activeVideos.length);
          
          // Add subtle animation even with active videos to ensure chunks
          this.drawAnimatedElement();
        }
        
      } catch (error) {
        console.error('❌ Error in drawFrame:', error);
        // Draw error message on canvas
        this.drawErrorMessage(error.message);
      }
      
      this.animationFrame = requestAnimationFrame(drawFrame);
    };
    
    // Start the animation loop
    drawFrame();
  }

  /**
   * Calculate optimal grid layout for participants
   */
  calculateGridLayout(participantCount) {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    let cols, rows;
    
    if (participantCount <= 1) {
      cols = 1; rows = 1;
    } else if (participantCount <= 4) {
      cols = 2; rows = 2;
    } else if (participantCount <= 6) {
      cols = 3; rows = 2;
    } else if (participantCount <= 9) {
      cols = 3; rows = 3;
    } else {
      cols = 4; rows = Math.ceil(participantCount / 4);
    }
    
    const cellWidth = Math.floor(canvasWidth / cols);
    const cellHeight = Math.floor(canvasHeight / rows);
    
    return { cols, rows, cellWidth, cellHeight };
  }

  /**
   * Draw a single video to the canvas at the specified grid position
   */
  drawVideoToCanvas(videoElement, index, layout) {
    const { cols, cellWidth, cellHeight } = layout;
    
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = col * cellWidth;
    const y = row * cellHeight;
    
    // Add padding between videos
    const padding = 8;
    const videoWidth = cellWidth - (padding * 2);
    const videoHeight = cellHeight - (padding * 2);
    
    try {
      // Ensure video is ready for drawing
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
        
        // Draw video maintaining aspect ratio
        const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
        const containerAspect = videoWidth / videoHeight;
        
        let drawWidth = videoWidth;
        let drawHeight = videoHeight;
        let drawX = x + padding;
        let drawY = y + padding;
        
        // Center the video within the container
        if (videoAspect > containerAspect) {
          // Video is wider than container
          drawHeight = videoWidth / videoAspect;
          drawY = y + padding + (videoHeight - drawHeight) / 2;
        } else {
          // Video is taller than container
          drawWidth = videoHeight * videoAspect;
          drawX = x + padding + (videoWidth - drawWidth) / 2;
        }
        
        // Draw the video
        this.context.drawImage(
          videoElement,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        );
        
        // Draw participant label
        this.drawParticipantLabel(videoElement, x + padding, y + padding, videoWidth);
        
        console.log(`📺 Drew video ${index + 1} at (${Math.round(drawX)}, ${Math.round(drawY)}) size ${Math.round(drawWidth)}x${Math.round(drawHeight)}`);
        
      } else {
        // Video not ready, draw placeholder
        this.drawVideoPlaceholder(x + padding, y + padding, videoWidth, videoHeight, `Loading...`);
      }
      
    } catch (error) {
      console.warn(`⚠️ Failed to draw video ${index}:`, error);
      // Draw error placeholder
      this.drawVideoPlaceholder(x + padding, y + padding, videoWidth, videoHeight, `Video Error`);
    }
  }

  /**
   * Draw participant name label on video
   */
  drawParticipantLabel(videoElement, x, y, width) {
    // Try to get participant name from DOM
    const container = videoElement.closest('.relative, .group');
    const labelElement = container?.querySelector('[class*="bottom-"]');
    const participantName = labelElement?.textContent || `Participant`;
    
    // Draw label background
    this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.context.fillRect(x, y + 15, width, 25);
    
    // Draw participant name
    this.context.fillStyle = '#ffffff';
    this.context.font = '14px Arial, sans-serif';
    this.context.fillText(participantName, x + 8, y + 32);
  }

  /**
   * Draw placeholder for unavailable video
   */
  drawVideoPlaceholder(x, y, width, height, label) {
    // Dark gray background
    this.context.fillStyle = '#2a2a2a';
    this.context.fillRect(x, y, width, height);
    
    // Border
    this.context.strokeStyle = '#404040';
    this.context.lineWidth = 2;
    this.context.strokeRect(x, y, width, height);
    
    // Centered text
    this.context.fillStyle = '#888888';
    this.context.font = '16px Arial, sans-serif';
    this.context.textAlign = 'center';
    this.context.fillText(label, x + width/2, y + height/2);
    this.context.textAlign = 'left'; // Reset alignment
  }

  /**
   * Draw "Waiting for participants" message
   */
  drawWaitingMessage() {
    this.context.fillStyle = '#ffffff';
    this.context.font = '32px Arial, sans-serif';
    this.context.textAlign = 'center';
    this.context.fillText(
      'Waiting for participants...',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    
    // Draw subtitle
    this.context.font = '18px Arial, sans-serif';
    this.context.fillStyle = '#888888';
    this.context.fillText(
      'Starting video streams...',
      this.canvas.width / 2,
      this.canvas.height / 2 + 40
    );
    
    this.context.textAlign = 'left'; // Reset alignment
  }

  /**
   * Draw animated element to ensure canvas content changes
   */
  drawAnimatedElement() {
    const time = Date.now() / 1000;
    const radius = 10 + Math.sin(time * 2) * 5; // Pulsing circle
    const x = this.canvas.width / 2 + Math.cos(time) * 100;
    const y = this.canvas.height / 2 + 80 + Math.sin(time * 0.5) * 20;
    
    this.context.fillStyle = '#ff6b6b';
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();
    
    // Add timestamp for debugging
    this.context.fillStyle = '#666666';
    this.context.font = '12px monospace';
    this.context.textAlign = 'center';
    this.context.fillText(
      `Stream Time: ${time.toFixed(1)}s`,
      this.canvas.width / 2,
      this.canvas.height - 30
    );
    this.context.textAlign = 'left';
  }

  /**
   * Draw error message on canvas
   */
  drawErrorMessage(errorText) {
    this.context.fillStyle = '#ff4444';
    this.context.font = '24px Arial, sans-serif';
    this.context.textAlign = 'center';
    this.context.fillText(
      'Streaming Error',
      this.canvas.width / 2,
      this.canvas.height / 2 - 20
    );
    
    this.context.font = '16px Arial, sans-serif';
    this.context.fillStyle = '#ffffff';
    this.context.fillText(
      errorText.substring(0, 60),
      this.canvas.width / 2,
      this.canvas.height / 2 + 20
    );
    
    this.context.textAlign = 'left'; // Reset alignment
  }

  /**
   * Draw stream overlay with information
   */
  drawStreamOverlay(participantCount) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // Draw live indicator
    this.context.fillStyle = '#ff0000';
    this.context.fillRect(20, 20, 12, 12);
    this.context.fillStyle = '#ffffff';
    this.context.font = '14px Arial, sans-serif';
    this.context.fillText('LIVE', 40, 32);
    
    // Draw participant count
    this.context.fillText(`${participantCount} participants`, 20, 60);
    
    // Draw timestamp
    this.context.fillText(timeString, 20, 80);
    
    // Draw stream title if available
    if (this.streamConfig?.title) {
      this.context.font = '16px Arial, sans-serif';
      this.context.fillText(this.streamConfig.title, 20, this.canvas.height - 30);
    }
  }

  /**
   * Add audio tracks from all participants to the stream
   */
  async addAudioTracks(participants) {
    try {
      // Create audio context for mixing
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      
      // Collect all audio tracks
      const audioTracks = [];
      
      // Add local audio if available
      if (participants.localStream) {
        const localAudioTracks = participants.localStream.getAudioTracks();
        audioTracks.push(...localAudioTracks);
      }
      
      // Add remote audio tracks
      if (participants.remoteStreams) {
        participants.remoteStreams.forEach(stream => {
          const remoteAudioTracks = stream.getAudioTracks();
          audioTracks.push(...remoteAudioTracks);
        });
      }
      
      // Mix audio tracks
      audioTracks.forEach(track => {
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        source.connect(destination);
      });
      
      // Add mixed audio to capture stream
      const audioTrack = destination.stream.getAudioTracks()[0];
      if (audioTrack) {
        this.captureStream.addTrack(audioTrack);
      }
      
    } catch (error) {
      console.warn('⚠️ Failed to add audio tracks:', error);
    }
  }

  /**
   * Set up MediaRecorder event handlers
   */
  setupRecorderHandlers() {
    let chunkQueue = [];
    let isProcessingQueue = false;
    let chunkCount = 0;

    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data && event.data.size > 0) {
        chunkCount++;
        console.log(`📊 MediaRecorder chunk ${chunkCount}: ${event.data.size} bytes`);
        chunkQueue.push(event.data);
        
        if (!isProcessingQueue) {
          isProcessingQueue = true;
          this.processChunkQueue(chunkQueue).finally(() => {
            isProcessingQueue = false;
          });
        }
      } else {
        console.warn('⚠️ MediaRecorder produced empty chunk');
      }
    };

    this.mediaRecorder.onstart = () => {
      console.log('✅ MediaRecorder started successfully');
    };

    this.mediaRecorder.onstop = () => {
      console.log('🛑 MediaRecorder stopped');
    };

    this.mediaRecorder.onerror = (error) => {
      console.error('❌ MediaRecorder error:', error);
    };

    this.mediaRecorder.onpause = () => {
      console.log('⏸️ MediaRecorder paused');
    };

    this.mediaRecorder.onresume = () => {
      console.log('▶️ MediaRecorder resumed');
    };
  }

  /**
   * Process chunk queue for streaming
   */
  async processChunkQueue(chunkQueue) {
    while (chunkQueue.length > 0 && this.isStreaming) {
      const chunk = chunkQueue.shift();
      
      try {
        // Send chunk to backend for RTMP streaming
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('sessionId', this.streamConfig.sessionId);
        formData.append('timestamp', Date.now().toString());
        
        // Get auth token for backend API
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${getApiUrl()}/api/youtube/stream-chunk`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Chunk upload failed: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('📤 Chunk sent successfully:', result.chunkSize, 'bytes');
        
      } catch (error) {
        console.error('❌ Failed to send chunk:', error);
        // Continue processing other chunks but log the error
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50)); // Increased delay slightly
    }
  }

  /**
   * Stop streaming the video grid
   */
  async stopGridStreaming() {
    try {
      console.log('🛑 Stopping Video Grid YouTube streaming...');
      
      this.isStreaming = false;
      
      // Clear chunk monitor
      if (this.chunkMonitor) {
        clearInterval(this.chunkMonitor);
        this.chunkMonitor = null;
      }
      
      // Stop animation frame
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      
      // Stop MediaRecorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      
      // Stop capture stream
      if (this.captureStream) {
        this.captureStream.getTracks().forEach(track => track.stop());
        this.captureStream = null;
      }
      
      // Clean up canvas
      if (this.canvas) {
        this.context = null;
        this.canvas = null;
      }
      
      // Reset references
      this.mediaRecorder = null;
      this.streamConfig = null;
      
      console.log('✅ Video Grid streaming stopped successfully');
      
      return {
        success: true,
        message: 'Video grid streaming stopped'
      };
      
    } catch (error) {
      console.error('❌ Error stopping grid streaming:', error);
      throw error;
    }
  }

  /**
   * Get current streaming status
   */
  getStatus() {
    return {
      isStreaming: this.isStreaming,
      hasCanvas: !!this.canvas,
      hasRecorder: !!this.mediaRecorder,
      recorderState: this.mediaRecorder?.state || 'inactive',
      streamConfig: this.streamConfig
    };
  }
}

export default VideoGridStreamManager;
