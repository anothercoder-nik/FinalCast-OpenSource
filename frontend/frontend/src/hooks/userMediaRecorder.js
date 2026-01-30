// hooks/useMediaRecorder.js
import React, { useRef, useState } from 'react';
import { getApiUrl } from '../utils/config.js';

export default function useMediaRecorder({ stream, sessionId, role, participantId, participantName }) {
  const recorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const chunkCountRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadTimer, setUploadTimer] = useState(0);
  const timerIntervalRef = useRef(null);

  const startRecording = async () => {
    try {
      if (!stream) {
        throw new Error('No media stream available');
      }

      // Reset counters for new recording
      chunkIndexRef.current = 0;
      chunkCountRef.current = 0;
      setError(null);

      // Enhanced recording options for better quality with size optimization
      const recordingOptions = {
        mimeType: 'video/webm; codecs=vp9,opus', // VP9 for better compression
        videoBitsPerSecond: 2000000, // Reduced from 2.5 to 2 Mbps to avoid timeouts
        audioBitsPerSecond: 128000,  // 128 kbps for high quality audio
      };

      // Fallback to VP8 if VP9 is not supported
      if (!MediaRecorder.isTypeSupported(recordingOptions.mimeType)) {
        console.log('🔄 VP9 not supported, falling back to VP8 with optimized bitrate');
        recordingOptions.mimeType = 'video/webm; codecs=vp8,opus';
        recordingOptions.videoBitsPerSecond = 1500000; // Lower bitrate for VP8 fallback
      }

      console.log('🎥 Starting recording with options:', recordingOptions);

      const recorder = new MediaRecorder(stream, recordingOptions);

      // Collect all chunks locally instead of uploading individually
      const chunks = [];

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          const chunkIndex = chunkIndexRef.current++;
          chunkCountRef.current++;

          console.log(`📦 Collected chunk ${chunkIndex} (${e.data.size} bytes)`);
          
          // Store chunk locally for later combination
          chunks.push(e.data);
        }
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setError('Recording error occurred');
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        console.log(`🎬 Recording stopped. Combining ${chunks.length} chunks...`);
        
        if (chunks.length > 0) {
          try {
            // Start upload process
            setIsUploading(true);
            setUploadProgress('📦 Combining video chunks...');
            setUploadTimer(0);
            
            // Start timer
            timerIntervalRef.current = setInterval(() => {
              setUploadTimer(prev => prev + 1);
            }, 1000);

            // Combine all chunks into a single blob
            const combinedBlob = new Blob(chunks, { type: 'video/webm' });
            const fileSizeMB = (combinedBlob.size / (1024 * 1024)).toFixed(2);
            console.log(`📁 Combined video size: ${fileSizeMB} MB (${combinedBlob.size} bytes)`);

            // Check file size and warn if too large
            if (combinedBlob.size > 100 * 1024 * 1024) { // 100MB limit
              console.warn('⚠️ Large file detected, upload may take longer');
              setUploadProgress(`📤 Uploading large file (${fileSizeMB} MB)... This may take a while.`);
            } else {
              setUploadProgress(`📤 Uploading video (${fileSizeMB} MB) to server...`);
            }

            // Upload the complete video to backend
            const formData = new FormData();
            formData.append('video', combinedBlob, `recording_${sessionId}_${role}_${Date.now()}.webm`);
            formData.append('sessionId', sessionId);
            formData.append('participantId', participantId);
            formData.append('participantName', participantName || 'Unknown');
            formData.append('role', role);
            formData.append('duration', chunks.length * 3); // Approximate duration

            console.log('📤 Uploading complete video to backend...');

            // Add timeout handling to fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

            try {
              const uploadRes = await fetch(`${getApiUrl()}/api/upload-complete-video`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                console.error('❌ Video upload failed:', errorText);
                
                // Handle specific timeout errors
                if (uploadRes.status === 408 || uploadRes.status === 499) {
                  setError('Upload timeout - please try recording shorter sessions');
                } else {
                  setError('Failed to upload recording');
                }
                return;
              }

              const result = await uploadRes.json();
              console.log('✅ Video uploaded successfully:', result);
              
              setUploadProgress('✅ Upload completed successfully!');
              
              // Stop timer after 2 seconds
              setTimeout(() => {
                setIsUploading(false);
                setUploadProgress('');
                if (timerIntervalRef.current) {
                  clearInterval(timerIntervalRef.current);
                  timerIntervalRef.current = null;
                }
              }, 2000);

            } catch (fetchError) {
              clearTimeout(timeoutId);
              console.error('❌ Fetch error:', fetchError);
              
              if (fetchError.name === 'AbortError') {
                setError('Upload timeout - please try recording shorter sessions');
              } else {
                setError('Network error during upload');
              }
              setIsUploading(false);
              setUploadProgress('');
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
              return;
            }

          } catch (error) {
            console.error('❌ Error processing recording:', error);
            setError('Failed to process recording');
            setIsUploading(false);
            setUploadProgress('');
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
          }
        }
      };

      recorder.start(3000); // 3s chunks
      recorderRef.current = recorder;
      chunkIndexRef.current = 0;
      setIsRecording(true);
      setError(null);

      console.log('🎥 Recording started for', { sessionId, role, participantId });
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(error.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (recorderRef.current && isRecording) {
        recorderRef.current.stop();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError(error.message);
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return { 
    startRecording, 
    stopRecording, 
    isRecording, 
    error,
    chunkCount: chunkCountRef.current,
    isUploading,
    uploadProgress,
    uploadTimer: formatTime(uploadTimer)
  };
}
