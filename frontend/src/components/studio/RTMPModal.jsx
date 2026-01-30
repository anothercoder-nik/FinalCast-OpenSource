import React, { useState, useEffect } from 'react';
import RTMPLiveModal from './RTMPLiveModal';

const PLATFORM_DEFAULTS = {
  youtube: {
    rtmpUrl: process.env.VITE_YOUTUBE_RTMP_URL || 'rtmp://a.rtmp.youtube.com/live2/',
    streamKey: '',
    title: ''
  },
  twitch: {
    rtmpUrl: process.env.TWITCH_RTMP_URL || 'rtmp://live.twitch.tv/app/',
    streamKey: '',
    title: ''
  },
  facebook: {
    rtmpUrl: process.env.FACEBOOK_RTMP_URL || 'rtmp://live-api-s.facebook.com:80/rtmp/',
    streamKey: '',
    title: ''
  }
};

export default function RTMPModal({ isOpen, onClose, onStartStream, defaultPlatform = 'youtube' }) {
  const [streamConfig, setStreamConfig] = useState(PLATFORM_DEFAULTS[defaultPlatform]);
  const [errors, setErrors] = useState({});
  const [isStartingStream, setIsStartingStream] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStreamConfig(PLATFORM_DEFAULTS[defaultPlatform]);
      setErrors({});
      setIsStartingStream(false);
    }
  }, [isOpen, defaultPlatform]);

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
    <RTMPLiveModal
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
