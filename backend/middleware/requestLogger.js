/**
 * Enhanced Request Logger Middleware
 * Logs all HTTP requests with timing, user info, and error tracking
 */

const { logger } = require('../utils/errorLogger');

/**
 * Request Logger Middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original res.json to intercept response
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Track request details
  const requestDetails = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    userId: null,
    username: null,
    role: null,
    contentType: req.get('Content-Type') || 'N/A',
    contentLength: req.get('Content-Length') || 0
  };

  // Log request start in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n→ ${req.method} ${req.originalUrl}`);
  }

  // Intercept response to log completion
  res.json = function (data) {
    const responseTime = Date.now() - startTime;
    
    // Add user info if available
    if (req.user) {
      requestDetails.userId = req.user.id || req.user._id;
      requestDetails.username = req.user.username;
      requestDetails.role = req.user.role;
    }

    // Log request completion
    logger.logRequest(req, res, responseTime);

    // Log in console for development
    if (process.env.NODE_ENV !== 'production') {
      const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${statusEmoji} ${res.statusCode} | ${responseTime}ms | ${req.method} ${req.originalUrl}`);
      
      if (req.user) {
        console.log(`   User: ${req.user.username} (${req.user.role})`);
      }
      
      // Log errors with details
      if (res.statusCode >= 400 && data && !data.success) {
        console.log(`   Error: ${data.message || data.error?.message || 'Unknown error'}`);
        if (data.code) {
          console.log(`   Code: ${data.code}`);
        }
      }
    }

    return originalJson.call(this, data);
  };

  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    
    if (req.user) {
      requestDetails.userId = req.user.id || req.user._id;
      requestDetails.username = req.user.username;
      requestDetails.role = req.user.role;
    }

    logger.logRequest(req, res, responseTime);

    if (process.env.NODE_ENV !== 'production') {
      const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${statusEmoji} ${res.statusCode} | ${responseTime}ms | ${req.method} ${req.originalUrl}`);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Performance Monitor Middleware
 * Warns about slow requests
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original res.json
  const originalJson = res.json;
  
  res.json = function (data) {
    const responseTime = Date.now() - startTime;
    
    // Warn about slow requests (> 1 second)
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        userId: req.user ? req.user.id : 'Anonymous'
      });
    }
    
    // Error on very slow requests (> 5 seconds)
    if (responseTime > 5000) {
      logger.error(new Error('Very slow request'), {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        userId: req.user ? req.user.id : 'Anonymous'
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Request Body Logger (for debugging)
 * Only logs in development and for specific routes
 */
const bodyLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
    // Don't log sensitive data
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    sensitiveFields.forEach(field => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '***REDACTED***';
      }
    });

    logger.debug('Request Body', {
      method: req.method,
      url: req.originalUrl,
      body: sanitizedBody
    });
  }
  
  next();
};

module.exports = {
  requestLogger,
  performanceMonitor,
  bodyLogger
};
