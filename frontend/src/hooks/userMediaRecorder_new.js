// hooks/useMediaRecorder.js
import { useRef, useState } from 'react';
import { getApiUrl } from '../utils/config.js';

export default function useMediaRecorder({ stream, sessionId, role, participantId }) {
  const recorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const chunkCountRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);

  const startRecording = async () => {
    try {
      if (!stream) {
        throw new Error('No media stream available');
      }

      // Reset counters for new recording
      chunkIndexRef.current = 0;
      chunkCountRef.current = 0;
      setError(null);

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8,opus',
      });

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
            // Combine all chunks into a single blob
            const combinedBlob = new Blob(chunks, { type: 'video/webm' });
            console.log(`📁 Combined video size: ${combinedBlob.size} bytes`);

            // Upload the complete video to backend
            const formData = new FormData();
            formData.append('video', combinedBlob, `recording_${sessionId}_${role}_${Date.now()}.webm`);
            formData.append('sessionId', sessionId);
            formData.append('participantId', participantId);
            formData.append('role', role);
            formData.append('duration', chunks.length * 3); // Approximate duration

            console.log('📤 Uploading complete video to backend...');

            const uploadRes = await fetch(`${getApiUrl()}/api/upload-complete-video`, {
              method: 'POST',
              body: formData
            });

            if (!uploadRes.ok) {
              const errorText = await uploadRes.text();
              console.error('❌ Video upload failed:', errorText);
              setError('Failed to upload recording');
              return;
            }

            const result = await uploadRes.json();
            console.log('✅ Video uploaded successfully:', result);

          } catch (error) {
            console.error('❌ Error processing recording:', error);
            setError('Failed to process recording');
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

  return { 
    startRecording, 
    stopRecording, 
    isRecording, 
    error,
    chunkCount: chunkCountRef.current 
  };
}
