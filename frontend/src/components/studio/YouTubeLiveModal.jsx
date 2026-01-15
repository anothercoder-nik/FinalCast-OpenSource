import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, RadioIcon, X, Youtube } from 'lucide-react';
import { getYouTubeRtmpUrl } from '../../utils/config.js';

const YouTubeLiveModal = ({ 
  streamConfig, 
  setStreamConfig, 
  errors, 
  setErrors, 
  isStartingStream, 
  setIsStartingStream, 
  closeModal,
  onStartStream
}) => {

  const handleInputChange = (field, value) => {
    setStreamConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate RTMP URL
    if (!streamConfig.rtmpUrl.startsWith('rtmp://')) {
      newErrors.rtmpUrl = 'RTMP URL must start with rtmp://';
    }
    
    // Validate Stream Key
    if (!streamConfig.streamKey.trim()) {
      newErrors.streamKey = 'Stream key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartStream = async () => {
    if (!validateForm()) return;
    
    setIsStartingStream(true);
    try {
      // Call the start function passed from parent
      await onStartStream(streamConfig);
      console.log('Starting YouTube stream with config:', streamConfig);
      closeModal();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsStartingStream(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={closeModal}>
      <DialogContent className="bg-stone-900 border border-stone-700 text-white max-w-md">
        {/* Header */}
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="flex items-center gap-2">
              <Youtube className="w-6 h-6 text-red-500" />
              <RadioIcon className="w-5 h-5 text-red-500" />
            </div>
            Start YouTube Live Stream
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleStartStream(); }} className="space-y-6">
          
          {/* RTMP Server URL */}
          <div className="space-y-2">
            <Label htmlFor="rtmpUrl" className="text-stone-200 font-medium">
              RTMP Server URL
            </Label>
            <Input
              id="rtmpUrl"
              type="text"
              value={streamConfig.rtmpUrl}
              onChange={(e) => handleInputChange('rtmpUrl', e.target.value)}
              placeholder={getYouTubeRtmpUrl()}
              className={`bg-stone-800 border-stone-600 text-white ${
                errors.rtmpUrl ? 'border-red-500' : 'focus:border-blue-500'
              }`}
              disabled={isStartingStream}
            />
            {errors.rtmpUrl && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.rtmpUrl}
              </div>
            )}
          </div>

          {/* Stream Key */}
          <div className="space-y-2">
            <Label htmlFor="streamKey" className="text-stone-200 font-medium">
              Stream Key <span className="text-red-400">*</span>
            </Label>
            <Input
              id="streamKey"
              type="password"
              value={streamConfig.streamKey}
              onChange={(e) => handleInputChange('streamKey', e.target.value)}
              placeholder="Enter your YouTube stream key"
              className={`bg-stone-800 border-stone-600 text-white ${
                errors.streamKey ? 'border-red-500' : 'focus:border-blue-500'
              }`}
              disabled={isStartingStream}
            />
            {errors.streamKey && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.streamKey}
              </div>
            )}
            <p className="text-stone-400 text-xs">
              You can find your stream key in YouTube Studio → Go Live → Stream
            </p>
          </div>

          {/* Stream Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-stone-200 font-medium">
              Stream Title (Optional)
            </Label>
            <Input
              id="title"
              type="text"
              value={streamConfig.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="My Live Stream"
              className="bg-stone-800 border-stone-600 text-white focus:border-blue-500"
              disabled={isStartingStream}
            />
            <p className="text-stone-400 text-xs">
              Internal reference name for this stream session
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
              <AlertCircle className="w-4 h-4" />
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isStartingStream}
              className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isStartingStream || !streamConfig.streamKey.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isStartingStream ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <RadioIcon className="w-4 h-4 mr-2" />
                  Start Streaming
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Video Grid Streaming:</p>
              <ul className="space-y-1 text-xs">
                <li>• This will stream your entire video grid with all participants to YouTube</li>
                <li>• Make sure your YouTube channel is verified for live streaming</li>
                <li>• Set up your stream in YouTube Studio first</li>
                <li>• All participant videos will be automatically arranged in a grid layout</li>
                <li>• Audio from all participants will be mixed together</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeLiveModal;