import React from 'react';
import YouTubeVideoPlayer from '../../components/common/YouTubeVideoPlayer';

/**
 * Test component to verify YouTube video player functionality
 */
const VideoPlayerTest = () => {
  // Test with a known working YouTube video ID
  const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Video Player Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Video Player
          </h2>
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <YouTubeVideoPlayer
              videoId={testVideoId}
              title="Test Video - Rick Roll"
              height="100%"
              autoplay={false}
              allowFullscreen={true}
            />
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Debug Info:</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Video ID:</strong> {testVideoId}</li>
              <li><strong>Expected Embed URL:</strong> https://www.youtube.com/embed/{testVideoId}</li>
              <li><strong>Test Status:</strong> {testVideoId ? '✅ Video ID provided' : '❌ No video ID'}</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Empty Video Player Test
          </h2>
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <YouTubeVideoPlayer
              videoId=""
              title="Empty Test"
              height="100%"
              autoplay={false}
              allowFullscreen={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerTest;