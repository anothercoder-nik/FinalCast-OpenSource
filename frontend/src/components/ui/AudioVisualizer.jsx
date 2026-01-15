import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const AudioVisualizer = ({ 
  audioLevel = 0, 
  isAudioEnabled = false, 
  size = 'md',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  const getBarHeight = (index) => {
    const normalizedLevel = Math.max(0, Math.min(100, audioLevel));
    const threshold = (index + 1) * 20; // 20%, 40%, 60%, 80%, 100%
    return normalizedLevel >= threshold ? '100%' : '20%';
  };

  const getBarOpacity = (index) => {
    const normalizedLevel = Math.max(0, Math.min(100, audioLevel));
    const threshold = (index + 1) * 20;
    return normalizedLevel >= threshold ? 1 : 0.3;
  };

  const getBarColor = () => {
    if (!isAudioEnabled) return 'bg-red-500';
    if (audioLevel > 70) return 'bg-red-400';
    if (audioLevel > 30) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Microphone Icon */}
      <div className={`${getSizeClasses()} flex items-center justify-center`}>
        {isAudioEnabled ? (
          <Mic className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} text-white`} />
        ) : (
          <MicOff className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} text-red-400`} />
        )}
      </div>

      {/* Audio Level Bars */}
      {isAudioEnabled && (
        <div className="flex items-end gap-0.5 h-4">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`w-1 transition-all duration-100 ${getBarColor()}`}
              style={{
                height: getBarHeight(index),
                opacity: getBarOpacity(index),
              }}
            />
          ))}
        </div>
      )}

      {/* Audio Level Text (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <span className="text-xs text-gray-400 ml-1">
          {Math.round(audioLevel)}%
        </span>
      )}
    </div>
  );
};

export default AudioVisualizer;
