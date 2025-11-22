// Video Security Service
import CryptoJS from 'crypto-js';

const VIDEO_SECRET_KEY = process.env.REACT_APP_VIDEO_SECRET_KEY || 'nexed-video-security-key-2024';
const TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

class VideoSecurityService {
  // Generate encrypted video token with expiry
  static generateVideoToken(videoId, userId, courseId) {
    const payload = {
      videoId,
      userId,
      courseId,
      timestamp: Date.now(),
      expires: Date.now() + TOKEN_EXPIRY,
      nonce: Math.random().toString(36).substring(2, 15)
    };

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(payload), 
      VIDEO_SECRET_KEY
    ).toString();

    return btoa(encrypted).replace(/[+/=]/g, (match) => {
      return { '+': '-', '/': '_', '=': '' }[match];
    });
  }

  // Decrypt and validate video token
  static decryptVideoToken(token) {
    try {
      const restored = token.replace(/[-_]/g, (match) => {
        return { '-': '+', '_': '/' }[match];
      });
      
      const padded = restored + '='.repeat((4 - restored.length % 4) % 4);
      const decrypted = CryptoJS.AES.decrypt(atob(padded), VIDEO_SECRET_KEY);
      const payload = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

      if (Date.now() > payload.expires) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  // Generate secure player configuration (no direct URL exposed)
  static generateSecurePlayerConfig(videoId, token, userId, options = {}) {
    return {
      token: token,
      videoId: this.obfuscateVideoId(videoId, userId),
      userId: userId,
      sessionId: Math.random().toString(36).substring(2, 15),
      options: {
        autoplay: options.autoplay || false,
        controls: options.controls !== false,
        allowFullscreen: options.allowFullscreen !== false,
        modestbranding: true,
        rel: 0,
        showinfo: 0,
        playsinline: true
      },
      timestamp: Date.now()
    };
  }

  // Load secure video player without exposing YouTube URL
  static async loadSecurePlayer(containerId, videoId, token, userId, courseId, options = {}) {
    try {
      const response = await fetch('/api/video/secure-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token: token,
          videoId: videoId,
          userId: userId,
          courseId: courseId,
          options: options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load secure player');
      }

      const secureHtml = await response.text();
      const container = document.getElementById(containerId);
      
      if (container) {
        container.innerHTML = secureHtml;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Secure player loading failed:', error);
      throw error;
    }
  }

  // Generate obfuscated embed URL that doesn't expose real video ID (fallback for free content)
  static generateSecureEmbedUrl(videoId, token, userId) {
    const obfuscatedId = this.obfuscateVideoId(videoId, userId);
    const secureParams = new URLSearchParams({
      v: obfuscatedId,
      t: token,
      autoplay: '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      fs: '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      enablejsapi: '1',
      origin: window.location.origin,
      end: '999999',
      disablekb: '1',
      playsinline: '1'
    });

    // Use a proxy endpoint instead of direct YouTube URL
    return `/api/video/stream?${secureParams.toString()}`;
  }

  // Obfuscate video ID to prevent direct access
  static obfuscateVideoId(videoId, userId) {
    const combined = `${videoId}:${userId}:${Date.now()}`;
    return CryptoJS.SHA256(combined).toString().substring(0, 16);
  }

  // Generate time-limited streaming URL
  static generateStreamingUrl(videoId, token) {
    const timestamp = Math.floor(Date.now() / 1000);
    const expiry = timestamp + 3600; // 1 hour expiry
    
    const hashString = `${videoId}${expiry}${VIDEO_SECRET_KEY}`;
    const hash = CryptoJS.SHA256(hashString).toString().substring(0, 16);
    
    return `/api/video/secure/${videoId}?expires=${expiry}&hash=${hash}&token=${token}`;
  }

  // Rotate video tokens every 30 minutes
  static scheduleTokenRotation(videoId, userId, courseId, callback) {
    const rotateToken = () => {
      const newToken = this.generateVideoToken(videoId, userId, courseId);
      callback(newToken);
      
      // Schedule next rotation
      setTimeout(rotateToken, 30 * 60 * 1000); // 30 minutes
    };

    // Initial rotation after 30 minutes
    setTimeout(rotateToken, 30 * 60 * 1000);
  }

  // Validate user access to specific video
  static async validateVideoAccess(videoId, userId, courseId) {
    try {
      const response = await fetch('/api/video/validate-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ videoId, userId, courseId })
      });

      return response.ok;
    } catch (error) {
      console.error('Video access validation failed:', error);
      return false;
    }
  }

  // Add watermark overlay to prevent screen recording
  static addVideoWatermark(containerElement, userId, courseName) {
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 1000;
      pointer-events: none;
      user-select: none;
      mix-blend-mode: difference;
    `;
    
    watermark.textContent = `${courseName} - User: ${userId.substring(0, 8)}...`;
    containerElement.appendChild(watermark);
    
    return watermark;
  }

  // Detect developer tools opening
  static detectDevTools(callback) {
    let devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          callback(true);
        }
      } else {
        if (devtools.open) {
          devtools.open = false;
          callback(false);
        }
      }
    }, 500);

    // Additional detection methods
    let devToolsChecker = () => {
      let before = new Date();
      debugger;
      let after = new Date();
      if (after - before > 100) {
        callback(true);
      }
    };

    // Run checker every 5 seconds
    setInterval(devToolsChecker, 5000);
  }

  // Prevent right-click and common keyboard shortcuts
  static preventVideoStealing(element) {
    // Disable right-click
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable common shortcuts
    element.addEventListener('keydown', (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
          (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
    });

    // Disable text selection
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.mozUserSelect = 'none';
    element.style.msUserSelect = 'none';
  }
}

export default VideoSecurityService;