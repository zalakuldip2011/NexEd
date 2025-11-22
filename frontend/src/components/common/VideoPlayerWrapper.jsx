import React from 'react';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

/**
 * Responsive Video Player Wrapper Component
 * Provides consistent video player layout with proper aspect ratio and responsive sizing
 */
const VideoPlayerWrapper = ({
  videoId,
  title,
  autoplay = false,
  allowFullscreen = true,
  onEnded,
  className = '',
  size = 'large', // 'small', 'medium', 'large', 'xl'
  showOverlay = true,
  ...props
}) => {
  const sizeClasses = {
    small: 'max-w-2xl',
    medium: 'max-w-4xl', 
    large: 'max-w-6xl',
    xl: 'max-w-7xl'
  };

  const maxWidthClass = sizeClasses[size] || sizeClasses.large;

  return (
    <div className={`w-full flex items-center justify-center bg-black ${className}`}>
      <div className={`w-full ${maxWidthClass} aspect-video relative`}>
        <YouTubeVideoPlayer
          videoId={videoId}
          title={title}
          height="100%"
          autoplay={autoplay}
          allowFullscreen={allowFullscreen}
          className="w-full h-full"
          onEnded={onEnded}
          {...props}
        />
        
        {/* Optional overlay for controls or information */}
        {showOverlay && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between items-center text-white text-sm">
              <span className="truncate">{title}</span>
              <button 
                onClick={() => {
                  // Toggle fullscreen functionality can be added here
                }}
                className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerWrapper;