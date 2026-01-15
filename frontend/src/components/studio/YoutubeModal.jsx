import React, { useState, useEffect } from 'react';
import YouTubeLiveModal from './YouTubeLiveModal';
import { getYouTubeRtmpUrl } from '../../utils/config.js';

export default function YouTubeModal({ isOpen, onClose, onStartStream }) {
  // Modal state - controlled by parent component
  const [streamConfig, setStreamConfig] = useState({
    rtmpUrl: getYouTubeRtmpUrl(),
    streamKey: '',
    title: ''
  });

  // Form validation
  const [errors, setErrors] = useState({});
  const [isStartingStream, setIsStartingStream] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStreamConfig({
        rtmpUrl: getYouTubeRtmpUrl(),
        streamKey: '',
        title: ''
      });
      setErrors({});
      setIsStartingStream(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setErrors({});
    setIsStartingStream(false);
    onClose();
  };

  const handleStartStream = async (config) => {
    try {
      setIsStartingStream(true);
      await onStartStream(config);
      handleClose();
    } catch (error) {
      setErrors({ submit: error.message });
      setIsStartingStream(false);
    }
  };

  if (!isOpen) return null;

  return (
    <YouTubeLiveModal
      streamConfig={streamConfig}
      setStreamConfig={setStreamConfig}
      errors={errors}
      setErrors={setErrors}
      isStartingStream={isStartingStream}
      setIsStartingStream={setIsStartingStream}
      closeModal={handleClose}
      onStartStream={handleStartStream}
    />
  );
}
