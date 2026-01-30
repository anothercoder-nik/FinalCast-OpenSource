import React from 'react';

export default function UploadStatus({ isUploading, uploadProgress, uploadTimer }) {
  if (!isUploading) return null;

  return (
    <>
      {/* Remove center modal, keep only the small notification */}
      
      {/* Small notification in top-right */}
      <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg border-l-4 border-blue-400 max-w-xs">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <div className="text-sm">
            <div className="font-medium">Recording Upload</div>
            <div className="text-xs opacity-90">{uploadTimer}</div>
          </div>
        </div>
      </div>
    </>
  );
}
