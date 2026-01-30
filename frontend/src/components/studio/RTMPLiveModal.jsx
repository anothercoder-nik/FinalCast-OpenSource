import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, RadioIcon, X, Youtube, Twitch, Facebook } from 'lucide-react';

const PLATFORM_CONFIGS = {
  youtube: {
    label: 'YouTube',
    icon: <Youtube className="w-6 h-6 text-red-500" />,
    rtmpUrl: process.env.VITE_YOUTUBE_RTMP_URL || 'rtmp://a.rtmp.youtube.com/live2/',
    streamKeyPlaceholder: 'Enter your YouTube stream key',
    help: 'You can find your stream key in YouTube Studio → Go Live → Stream',
  },
  twitch: {
    label: 'Twitch',
    icon: <Twitch className="w-6 h-6 text-purple-500" />,
    rtmpUrl: process.env.TWITCH_RTMP_URL || 'rtmp://live.twitch.tv/app/',
    streamKeyPlaceholder: 'Enter your Twitch stream key',
    help: 'You can find your stream key in Twitch Dashboard → Stream',
  },
  facebook: {
    label: 'Facebook',
    icon: <Facebook className="w-6 h-6 text-blue-500" />,
    rtmpUrl: process.env.FACEBOOK_RTMP_URL || 'rtmp://live-api-s.facebook.com:80/rtmp/',
    streamKeyPlaceholder: 'Enter your Facebook stream key',
    help: 'You can find your stream key in Facebook Live Producer',
  },
};

const RTMPLiveModal = ({
  streamConfig,
  setStreamConfig,
  errors,
  setErrors,
  isStartingStream,
  setIsStartingStream,
  closeModal,
  onStartStream
}) => {
  const [platform, setPlatform] = useState('youtube');
  const config = PLATFORM_CONFIGS[platform];

  const handleInputChange = (field, value) => {
    setStreamConfig(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!streamConfig.rtmpUrl.startsWith('rtmp://')) newErrors.rtmpUrl = 'RTMP URL must start with rtmp://';
    if (!streamConfig.streamKey.trim()) newErrors.streamKey = 'Stream key is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartStream = async () => {
    if (!validateForm()) return;
    setIsStartingStream(true);
    try {
      await onStartStream({ ...streamConfig, platform });
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
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="flex items-center gap-2">
              {config.icon}
              <RadioIcon className="w-5 h-5 text-red-500" />
            </div>
            Start {config.label} Live Stream
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          {Object.keys(PLATFORM_CONFIGS).map(p => (
            <Button
              key={p}
              type="button"
              variant={platform === p ? 'default' : 'outline'}
              onClick={() => {
                setPlatform(p);
                setStreamConfig(prev => ({ ...prev, rtmpUrl: PLATFORM_CONFIGS[p].rtmpUrl, streamKey: '' }));
              }}
              className={`flex-1 ${platform === p ? '' : 'bg-stone-800 text-stone-200'}`}
            >
              {PLATFORM_CONFIGS[p].icon} {PLATFORM_CONFIGS[p].label}
            </Button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); handleStartStream(); }} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rtmpUrl" className="text-stone-200 font-medium">RTMP Server URL</Label>
            <Input
              id="rtmpUrl"
              type="text"
              value={streamConfig.rtmpUrl}
              onChange={e => handleInputChange('rtmpUrl', e.target.value)}
              placeholder={config.rtmpUrl}
              className={`bg-stone-800 border-stone-600 text-white ${errors.rtmpUrl ? 'border-red-500' : 'focus:border-blue-500'}`}
              disabled={isStartingStream}
            />
            {errors.rtmpUrl && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.rtmpUrl}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="streamKey" className="text-stone-200 font-medium">Stream Key <span className="text-red-400">*</span></Label>
            <Input
              id="streamKey"
              type="password"
              value={streamConfig.streamKey}
              onChange={e => handleInputChange('streamKey', e.target.value)}
              placeholder={config.streamKeyPlaceholder}
              className={`bg-stone-800 border-stone-600 text-white ${errors.streamKey ? 'border-red-500' : 'focus:border-blue-500'}`}
              disabled={isStartingStream}
            />
            {errors.streamKey && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.streamKey}
              </div>
            )}
            <p className="text-stone-400 text-xs">{config.help}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-stone-200 font-medium">Stream Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              value={streamConfig.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder="My Live Stream"
              className="bg-stone-800 border-stone-600 text-white focus:border-blue-500"
              disabled={isStartingStream}
            />
            <p className="text-stone-400 text-xs">Internal reference name for this stream session</p>
          </div>
          {errors.submit && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
              <AlertCircle className="w-4 h-4" />
              {errors.submit}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isStartingStream} className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-800">Cancel</Button>
            <Button type="submit" disabled={isStartingStream || !streamConfig.streamKey.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              {isStartingStream ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Starting...</>) : (<><RadioIcon className="w-4 h-4 mr-2" />Start Streaming</>)}
            </Button>
          </div>
        </form>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Video Grid Streaming:</p>
              <ul className="space-y-1 text-xs">
                <li>• This will stream your entire video grid with all participants to the selected platform</li>
                <li>• Make sure your channel/page is verified for live streaming</li>
                <li>• Set up your stream in the platform dashboard first</li>
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

export default RTMPLiveModal;
