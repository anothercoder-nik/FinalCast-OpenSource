import React from 'react';

class VideoErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Video error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
          <div className="text-center">
            <div className="text-2xl mb-2">📹</div>
            <div className="text-sm">Video unavailable</div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VideoErrorBoundary;
