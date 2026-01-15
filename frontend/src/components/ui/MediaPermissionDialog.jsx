import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  Camera, 
  Mic, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings
} from 'lucide-react';

const MediaPermissionDialog = ({ 
  onPermissionGranted, 
  onPermissionDenied,
  isVisible = false,
  title = "Media Permissions Required"
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [error, setError] = useState(null);

  const requestPermissions = async () => {
    setIsRequesting(true);
    setError(null);
    setPermissionStatus(null);

    try {
      console.log('🎥 Requesting media permissions...');
      
      // Import mediaManager dynamically
      const { default: mediaManager } = await import('../../utils/mediaManager');
      
      const result = await mediaManager.requestMediaPermissions();
      
      if (result.granted) {
        setPermissionStatus('granted');
        console.log('✅ Permissions granted');
        
        // Call success callback after a brief delay to show success state
        setTimeout(() => {
          onPermissionGranted?.(result);
        }, 1000);
      } else {
        setPermissionStatus('denied');
        setError(result.error?.message || 'Permission denied');
        onPermissionDenied?.(result.error);
      }
      
    } catch (err) {
      console.error('❌ Permission request failed:', err);
      setPermissionStatus('error');
      setError(err.message || 'Failed to request permissions');
      onPermissionDenied?.(err);
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'denied':
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Permissions granted successfully!';
      case 'denied':
        return 'Permissions denied. Please allow access to continue.';
      case 'error':
        return error || 'An error occurred while requesting permissions.';
      default:
        return 'We need access to your camera and microphone to start the session.';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Permission Requirements */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Camera className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Camera Access</p>
                <p className="text-sm text-gray-600">Required for video streaming</p>
              </div>
              <Badge variant="secondary">Required</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mic className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Microphone Access</p>
                <p className="text-sm text-gray-600">Required for audio streaming</p>
              </div>
              <Badge variant="secondary">Required</Badge>
            </div>
          </div>

          {/* Status Message */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {getStatusMessage()}
            </p>
          </div>

          {/* Error Message */}
          {error && permissionStatus === 'error' && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {permissionStatus === 'granted' ? (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => onPermissionGranted?.()}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Continue
              </Button>
            ) : (
              <>
                <Button
                  onClick={requestPermissions}
                  disabled={isRequesting}
                  className="flex-1"
                >
                  {isRequesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Allow Access
                    </>
                  )}
                </Button>
                
                {permissionStatus === 'denied' && (
                  <Button
                    variant="outline"
                    onClick={() => onPermissionDenied?.()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Click "Allow" when your browser asks for permissions</p>
            <p>• You can change these settings later in your browser</p>
            <p>• Your media is only shared during active sessions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaPermissionDialog;
