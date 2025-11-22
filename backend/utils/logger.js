/**
 * Logger Utility
 * Comprehensive logging system with file and console output
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const accessLogPath = path.join(logsDir, 'access.log');
const wishlistLogPath = path.join(logsDir, 'wishlist.log');

// Helper function to format log entry
const formatLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };
  return JSON.stringify(logEntry, null, 2) + '\n';
};

// Write to log file
const writeToFile = (filePath, content) => {
  try {
    fs.appendFileSync(filePath, content);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

// Logger class
class Logger {
  constructor(module = 'APP') {
    this.module = module;
  }

  // Info log
  info(message, data = null) {
    const logMessage = `[${this.module}] ${message}`;
    console.log('ℹ️ ', logMessage, data || '');
    writeToFile(accessLogPath, formatLog('INFO', logMessage, data));
  }

  // Success log
  success(message, data = null) {
    const logMessage = `[${this.module}] ${message}`;
    console.log('✅', logMessage, data || '');
    writeToFile(accessLogPath, formatLog('SUCCESS', logMessage, data));
  }

  // Warning log
  warn(message, data = null) {
    const logMessage = `[${this.module}] ${message}`;
    console.warn('⚠️ ', logMessage, data || '');
    writeToFile(accessLogPath, formatLog('WARNING', logMessage, data));
  }

  // Error log
  error(message, error = null) {
    const logMessage = `[${this.module}] ${message}`;
    console.error('❌', logMessage);
    
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;

    if (error) {
      console.error('   Error details:', errorData);
    }

    writeToFile(errorLogPath, formatLog('ERROR', logMessage, errorData));
  }

  // Debug log
  debug(message, data = null) {
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = `[${this.module}] ${message}`;
      console.log('🐛', logMessage, data || '');
    }
  }

  // Wishlist specific log
  wishlist(action, userId, courseId = null, result = null) {
    const logData = {
      action,
      userId,
      courseId,
      result,
      timestamp: new Date().toISOString()
    };
    
    console.log(`❤️  [WISHLIST] ${action}`, logData);
    writeToFile(wishlistLogPath, formatLog('WISHLIST', action, logData));
  }

  // Request log
  request(method, path, userId = null) {
    const logData = {
      method,
      path,
      userId,
      timestamp: new Date().toISOString()
    };
    console.log(`📥 [REQUEST] ${method} ${path}`, userId ? `(User: ${userId})` : '');
    writeToFile(accessLogPath, formatLog('REQUEST', `${method} ${path}`, logData));
  }

  // Response log
  response(statusCode, message, data = null) {
    const level = statusCode >= 400 ? 'ERROR' : 'SUCCESS';
    const emoji = statusCode >= 400 ? '❌' : '✅';
    console.log(`${emoji} [RESPONSE] ${statusCode} - ${message}`);
    writeToFile(accessLogPath, formatLog(level, message, { statusCode, data }));
  }
}

// Export logger factory
module.exports = {
  Logger,
  createLogger: (module) => new Logger(module)
};
