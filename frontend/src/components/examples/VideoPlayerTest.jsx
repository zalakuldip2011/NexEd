import React, { useState } from 'react';
import VideoPlayerWrapper from '../common/VideoPlayerWrapper';

/**
 * Video Player Test Component
 * Demonstrates different video player sizes and configurations
 */
const VideoPlayerTest = () => {
  const [testVideoId] = useState('dQw4w9WgXcQ'); // Rick Roll for testing
  const [currentSize, setCurrentSize] = useState('large');
  
  const sizes = [
    { value: 'small', label: 'Small (max-w-2xl)' },
    { value: 'medium', label: 'Medium (max-w-4xl)' },
    { value: 'large', label: 'Large (max-w-6xl)' },
    { value: 'xl', label: 'Extra Large (max-w-7xl)' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Video Player Structure Test</h1>
        
        {/* Size Selector */}
        <div className="mb-8 text-center">
          <h2 className="text-xl mb-4">Choose Video Player Size:</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => setCurrentSize(size.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentSize === size.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Player Demo */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Current Size: {sizes.find(s => s.value === currentSize)?.label}
          </h3>
          <VideoPlayerWrapper
            videoId={testVideoId}
            title="Test Video - Rick Astley - Never Gonna Give You Up"
            size={currentSize}
            autoplay={false}
            allowFullscreen={true}
            showOverlay={true}
          />
        </div>

        {/* Information Panel */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Video Player Features:</h3>
          <ul className="space-y-2 text-gray-300">
            <li>✅ 16:9 aspect ratio maintained</li>
            <li>✅ Responsive sizing with max-width constraints</li>
            <li>✅ Proper centering in container</li>
            <li>✅ Loading states and error handling</li>
            <li>✅ Fullscreen support</li>
            <li>✅ YouTube embed optimization</li>
            <li>✅ Mobile responsive design</li>
            <li>✅ Hover overlay with controls</li>
          </ul>
          
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-2">Current Configuration:</h4>
            <code className="text-sm text-green-400">
              Size: {currentSize} | Max Width: {sizes.find(s => s.value === currentSize)?.label}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerTest;