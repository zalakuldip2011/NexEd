import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import VideoSecurityService from '../../services/videoSecurityService';
import { useAuth } from '../../context/AuthContext';

const YouTubeVideoPlayer = ({ 
  videoId, 
  title = "Course Lecture",
  className = "",
  autoplay = false,
  controls = true,
  onProgress = null,
  onEnded = null,
  startTime = 0,
  height = "400px",
  allowFullscreen = true,
  courseId = null,
  isPaid = false,
  enableSecurity = true
}) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [secureToken, setSecureToken] = useState(null);
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const [accessValidated, setAccessValidated] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    setIsReady(false);
    setError(null);
    setAccessValidated(false);
    
    const initializeSecurity = async () => {
      if (enableSecurity && isPaid && user && courseId) {
        // Validate user access
        const hasAccess = await VideoSecurityService.validateVideoAccess(
          videoId, user.id, courseId
        );
        
        if (!hasAccess) {
          setError('Access denied. Please ensure you have purchased this course.');
          return;
        }
        
        setAccessValidated(true);
        
        // Generate secure token
        const token = VideoSecurityService.generateVideoToken(
          videoId, user.id, courseId
        );
        setSecureToken(token);
        
        // Setup token rotation
        VideoSecurityService.scheduleTokenRotation(
          videoId, user.id, courseId, setSecureToken
        );
        
        // Setup developer tools detection
        VideoSecurityService.detectDevTools(setDevToolsDetected);
      } else {
        setAccessValidated(true);
      }
    };
    
    initializeSecurity();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('YouTubeVideoPlayer - videoId:', videoId);
    }
  }, [videoId, user, courseId, isPaid, enableSecurity]);

  // Initialize secure video player for paid content
  useEffect(() => {
    if (enableSecurity && isPaid && secureToken && user && accessValidated) {
      const initSecureVideo = async () => {
        try {
          const container = document.getElementById(`secure-video-${videoId}`);
          if (!container) return;

          // Clear any existing content
          container.innerHTML = '';

          // Create secure video element through backend proxy
          const response = await fetch('/api/video/secure-player', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              token: secureToken,
              videoId: videoId,
              userId: user.id,
              courseId: courseId,
              options: {
                autoplay: autoplay,
                controls: controls,
                allowFullscreen: allowFullscreen
              }
            })
          });

          if (response.ok) {
            const secureHtml = await response.text();
            container.innerHTML = secureHtml;
            setIsReady(true);
          } else {
            setError('Failed to load secure video');
          }
        } catch (error) {
          console.error('Secure video initialization failed:', error);
          setError('Video loading failed');
        }
      };

      initSecureVideo();
    }
  }, [enableSecurity, isPaid, secureToken, user, accessValidated, videoId, courseId, autoplay, controls, allowFullscreen]);

  // Setup security protections
  useEffect(() => {
    if (containerRef.current && enableSecurity && isPaid) {
      VideoSecurityService.preventVideoStealing(containerRef.current);
      
      if (user) {
        VideoSecurityService.addVideoWatermark(
          containerRef.current, 
          user.id, 
          title
        );
      }
    }
  }, [enableSecurity, isPaid, user, title]);

  // Generate embed URL - must be called before any conditional returns
  const embedUrl = useMemo(() => {
    if (!videoId || typeof videoId !== 'string' || videoId.trim() === '') {
      return '';
    }
    
    if (enableSecurity && isPaid && secureToken && user) {
      // Use secure streaming URL that doesn't expose real video ID
      return VideoSecurityService.generateSecureEmbedUrl(videoId, secureToken, user.id);
    } else {
      // Standard YouTube embed for free content
      return `https://www.youtube.com/embed/${videoId}?` + new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        controls: controls ? '1' : '0',
        modestbranding: '1',
        rel: '0',
        showinfo: '0',
        fs: allowFullscreen ? '1' : '0',
        cc_load_policy: '0',
        iv_load_policy: '3',
        enablejsapi: '1',
        origin: window.location.origin,
        end: '999999',
        disablekb: '1',
        playsinline: '1',
        ...(startTime > 0 && { start: startTime.toString() })
      }).toString();
    }
  }, [videoId, secureToken, user, enableSecurity, isPaid, autoplay, controls, allowFullscreen, startTime]);

  if (!videoId || typeof videoId !== 'string' || videoId.trim() === '') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('YouTubeVideoPlayer - Invalid videoId:', videoId);
    }
    return (
      <div className={`bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center ${className}`} 
           style={{ height }}>
        <div className="text-center theme-text-tertiary">
          <PlayIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No video available</p>
          <p className="text-xs mt-2 opacity-60">Video ID: {JSON.stringify(videoId)}</p>
        </div>
      </div>
    );
  }

  const handleIframeLoad = () => {
    setIsReady(true);
  };

  const handleIframeError = () => {
    setError('Failed to load video. Please check if the video is available.');
  };

  // Security warning for developer tools
  if (devToolsDetected && enableSecurity && isPaid) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center justify-center p-8 ${className}`} 
           style={{ height }}>
        <div className="text-center">
          <div className="text-yellow-600 dark:text-yellow-400 mb-2">
            <ShieldCheckIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">Security Alert</p>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm">
            Developer tools detected. Video playback paused for security.
          </p>
          <p className="text-yellow-500 dark:text-yellow-300 text-xs mt-2">
            Please close developer tools to continue watching.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center p-8 ${className}`} 
           style={{ height }}>
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <SpeakerXMarkIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-red-800 dark:text-red-200 font-medium mb-1">Video Unavailable</p>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <p className="text-red-500 dark:text-red-300 text-xs mt-2">
            The video may be private, deleted, or have restricted embedding.
          </p>
        </div>
      </div>
    );
  }

  // Show loading while validating access for paid content
  if (enableSecurity && isPaid && !accessValidated) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`} 
           style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Validating access...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`} 
      style={{ height }}
      data-video-protected={enableSecurity && isPaid ? 'true' : 'false'}
    >
      <div className="w-full h-full" style={{ aspectRatio: '16 / 9' }}>
        {!isReady && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {title && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-20">
            <h3 className="text-white font-medium text-sm truncate">{title}</h3>
          </div>
        )}

        {enableSecurity && isPaid ? (
          <div
            ref={iframeRef}
            id={`secure-video-${videoId}`}
            className="absolute top-0 left-0 w-full h-full bg-black"
            onLoad={handleIframeLoad}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={allowFullscreen}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        )}

        {!controls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <button className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <PlayIcon className="h-5 w-5" />
                </button>
                <button className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <SpeakerWaveIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
                <button className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideoPlayer;