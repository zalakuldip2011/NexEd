const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const VIDEO_SECRET_KEY = process.env.VIDEO_SECRET_KEY || 'nexed-video-security-key-2024';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Rate limiting for video access
const videoAccessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many video access requests, please try again later.'
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Validate video access for paid content
router.post('/validate-access', authenticateToken, videoAccessLimiter, async (req, res) => {
  try {
    const { videoId, userId, courseId } = req.body;
    const { User, Enrollment, Course } = require('../models');

    // Verify user identity
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'User ID mismatch' });
    }

    // Check if user has active enrollment for this course
    const enrollment = await Enrollment.findOne({
      where: {
        userId: userId,
        courseId: courseId,
        status: 'active'
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'No active enrollment found' });
    }

    // Verify course exists and video belongs to course
    const course = await Course.findOne({
      where: { id: courseId },
      include: [{
        model: require('../models/Lecture'),
        where: { videoId: videoId }
      }]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course or video not found' });
    }

    // Log access for monitoring
    console.log(`Video access granted - User: ${userId}, Course: ${courseId}, Video: ${videoId}`);

    res.json({ 
      success: true, 
      message: 'Access validated',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Video access validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Secure video streaming proxy
router.get('/stream', authenticateToken, async (req, res) => {
  try {
    const { v: obfuscatedId, t: token } = req.query;

    // Decrypt and validate token
    const decrypted = crypto.createDecipher('aes-256-cbc', VIDEO_SECRET_KEY);
    let tokenData = decrypted.update(Buffer.from(token, 'base64'), 'base64', 'utf8');
    tokenData += decrypted.final('utf8');
    
    const payload = JSON.parse(tokenData);

    // Check token expiry
    if (Date.now() > payload.expires) {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Verify user identity
    if (req.user.id !== payload.userId) {
      return res.status(403).json({ error: 'Invalid user' });
    }

    // Generate YouTube embed URL with additional security
    const youtubeUrl = `https://www.youtube.com/embed/${payload.videoId}?` + new URLSearchParams({
      autoplay: req.query.autoplay || '0',
      controls: req.query.controls || '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      fs: req.query.fs || '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      enablejsapi: '1',
      origin: req.get('origin'),
      end: '999999',
      disablekb: '1',
      playsinline: '1'
    }).toString();

    // Return iframe HTML with additional security headers
    const iframeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="referrer" content="no-referrer">
        <style>
          body { margin: 0; padding: 0; background: #000; }
          iframe { width: 100%; height: 100vh; border: none; }
          .watermark {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1000;
            pointer-events: none;
            user-select: none;
          }
        </style>
      </head>
      <body>
        <iframe src="${youtubeUrl}" allowfullscreen></iframe>
        <div class="watermark">User: ${payload.userId.substring(0, 8)}... | ${new Date().toLocaleString()}</div>
        <script>
          // Prevent common stealing attempts
          document.addEventListener('contextmenu', e => e.preventDefault());
          document.addEventListener('keydown', e => {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))) {
              e.preventDefault();
            }
          });
          
          // Detect developer tools
          let devtools = { open: false };
          setInterval(() => {
            if (window.outerHeight - window.innerHeight > 160) {
              if (!devtools.open) {
                devtools.open = true;
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-family:Arial">Developer tools detected. Video paused for security.</div>';
              }
            }
          }, 500);
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.send(iframeHtml);

  } catch (error) {
    console.error('Secure streaming error:', error);
    res.status(500).json({ error: 'Streaming failed' });
  }
});

// Secure video player that returns HTML without exposing YouTube URL
router.post('/secure-player', authenticateToken, async (req, res) => {
  try {
    const { token, videoId, userId, courseId, options } = req.body;

    // Decrypt and validate token
    const crypto = require('crypto');
    const decrypted = crypto.createDecipher('aes-256-cbc', VIDEO_SECRET_KEY);
    let tokenData = decrypted.update(Buffer.from(token, 'base64'), 'base64', 'utf8');
    tokenData += decrypted.final('utf8');
    
    const payload = JSON.parse(tokenData);

    // Validate token and user
    if (Date.now() > payload.expires || payload.userId !== userId || payload.videoId !== videoId) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Generate obfuscated parameters
    const sessionId = crypto.randomBytes(16).toString('hex');
    const videoHash = crypto.createHash('sha256').update(`${videoId}${sessionId}${Date.now()}`).digest('hex').substring(0, 16);

    // Create secure HTML that loads YouTube without exposing URL
    const secureHtml = `
      <div id="player-${sessionId}" style="width:100%;height:100%;position:relative;">
        <div id="loading-${sessionId}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;">
          <div style="width:40px;height:40px;border:4px solid #333;border-top:4px solid #fff;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
          Loading secure video...
        </div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
      <script>
        (function() {
          const sessionId = '${sessionId}';
          const videoHash = '${videoHash}';
          
          // Obfuscated YouTube API loader
          function loadSecurePlayer() {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.onload = function() {
              if (window.YT && window.YT.Player) {
                initPlayer();
              } else {
                window.onYouTubeIframeAPIReady = initPlayer;
              }
            };
            document.head.appendChild(tag);
          }
          
          function initPlayer() {
            // Decrypt video ID on client side with multiple layers of obfuscation
            const obfuscatedData = '${Buffer.from(JSON.stringify({
              id: videoId,
              hash: crypto.createHash('md5').update(videoId + sessionId).digest('hex'),
              timestamp: Date.now()
            })).toString('base64')}';
            
            const decoded = JSON.parse(atob(obfuscatedData));
            const actualVideoId = decoded.id;
            
            new YT.Player('player-' + sessionId, {
              height: '100%',
              width: '100%',
              videoId: actualVideoId,
              playerVars: {
                autoplay: ${options.autoplay ? 1 : 0},
                controls: ${options.controls ? 1 : 0},
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: ${options.allowFullscreen ? 1 : 0},
                cc_load_policy: 0,
                iv_load_policy: 3,
                playsinline: 1,
                origin: window.location.origin,
                enablejsapi: 1
              },
              events: {
                onReady: function(event) {
                  document.getElementById('loading-' + sessionId).style.display = 'none';
                  
                  // Add security monitoring
                  setInterval(function() {
                    if (window.outerHeight - window.innerHeight > 160) {
                      event.target.pauseVideo();
                      alert('Developer tools detected. Video paused for security.');
                    }
                  }, 1000);
                },
                onError: function(event) {
                  console.error('Video player error:', event.data);
                }
              }
            });
          }
          
          // Anti-inspection measures
          document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
          document.addEventListener('keydown', function(e) {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))) {
              e.preventDefault();
            }
          });
          
          // Load player
          loadSecurePlayer();
        })();
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(secureHtml);

  } catch (error) {
    console.error('Secure player generation failed:', error);
    res.status(500).json({ error: 'Player generation failed' });
  }
});

// Generate time-limited direct video access
router.get('/secure/:videoId', authenticateToken, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { expires, hash, token } = req.query;

    // Verify hash
    const expectedHash = crypto
      .createHash('sha256')
      .update(`${videoId}${expires}${VIDEO_SECRET_KEY}`)
      .digest('hex')
      .substring(0, 16);

    if (hash !== expectedHash) {
      return res.status(403).json({ error: 'Invalid hash' });
    }

    // Check expiry
    if (Math.floor(Date.now() / 1000) > expires) {
      return res.status(401).json({ error: 'URL expired' });
    }

    // Validate token (additional security layer)
    const decrypted = crypto.createDecipher('aes-256-cbc', VIDEO_SECRET_KEY);
    let tokenData = decrypted.update(Buffer.from(token, 'base64'), 'base64', 'utf8');
    tokenData += decrypted.final('utf8');
    
    const payload = JSON.parse(tokenData);

    if (payload.videoId !== videoId || req.user.id !== payload.userId) {
      return res.status(403).json({ error: 'Token validation failed' });
    }

    // Redirect to YouTube with additional tracking
    const trackingParams = new URLSearchParams({
      utm_source: 'nexed_secure',
      utm_medium: 'protected_stream',
      utm_campaign: payload.courseId
    });

    console.log(`Secure video access - User: ${req.user.id}, Video: ${videoId}, IP: ${req.ip}`);

    res.redirect(`https://www.youtube.com/watch?v=${videoId}&${trackingParams.toString()}`);

  } catch (error) {
    console.error('Secure video access error:', error);
    res.status(500).json({ error: 'Access failed' });
  }
});

module.exports = router;