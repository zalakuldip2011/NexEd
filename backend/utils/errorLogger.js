/**
 * Advanced Error Logger with File Logging
 * Comprehensive error tracking, logging, and monitoring system
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');
const accessLogPath = path.join(logsDir, 'access.log');
const debugLogPath = path.join(logsDir, 'debug.log');

// Helper to format date
const formatDate = () => {
  const now = new Date();
  return now.toISOString();
};

// Helper to get log file path based on date
const getDateBasedLogPath = (type = 'error') => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `${type}-${date}.log`);
};

/**
 * Write to log file with rotation support
 */
const writeToFile = (filePath, message) => {
  try {
    const logMessage = `${formatDate()} | ${message}\n`;
    fs.appendFileSync(filePath, logMessage, 'utf8');
    
    // Check file size and rotate if needed (max 10MB)
    const stats = fs.statSync(filePath);
    if (stats.size > 10 * 1024 * 1024) {
      const backupPath = `${filePath}.${Date.now()}.old`;
      fs.renameSync(filePath, backupPath);
    }
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
};

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

/**
 * Main Logger Class
 */
class ErrorLogger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  /**
   * Format error object for logging
   */
  formatError(error, context = {}) {
    const errorInfo = {
      timestamp: formatDate(),
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack || 'No stack trace',
      code: error.code,
      statusCode: error.statusCode || 500,
      context: {
        ...context,
        url: context.url || 'N/A',
        method: context.method || 'N/A',
        userId: context.userId || 'Anonymous',
        ip: context.ip || 'N/A'
      }
    };

    return errorInfo;
  }

  /**
   * Format log message
   */
  formatLogMessage(level, message, metadata = {}) {
    const logEntry = {
      timestamp: formatDate(),
      level,
      message,
      ...metadata
    };

    return JSON.stringify(logEntry, null, 2);
  }

  /**
   * Log error to file and console
   */
  error(error, context = {}) {
    const errorInfo = this.formatError(error, context);
    const logMessage = this.formatLogMessage(LogLevel.ERROR, error.message, errorInfo);

    // Write to error log
    writeToFile(getDateBasedLogPath('error'), logMessage);
    writeToFile(combinedLogPath, logMessage);

    // Console output
    if (!this.isProduction) {
      console.error('\n❌ ERROR LOGGED:');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Message:', error.message);
      console.error('Name:', error.name);
      console.error('Code:', error.code || 'N/A');
      console.error('Status:', error.statusCode || 500);
      console.error('Context:', JSON.stringify(context, null, 2));
      console.error('Stack:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    return errorInfo;
  }

  /**
   * Log warning
   */
  warn(message, metadata = {}) {
    const logMessage = this.formatLogMessage(LogLevel.WARN, message, metadata);
    
    writeToFile(getDateBasedLogPath('warn'), logMessage);
    writeToFile(combinedLogPath, logMessage);

    if (!this.isProduction) {
      console.warn(`\n⚠️  WARNING: ${message}`);
      if (Object.keys(metadata).length > 0) {
        console.warn('Details:', metadata);
      }
    }
  }

  /**
   * Log info
   */
  info(message, metadata = {}) {
    const logMessage = this.formatLogMessage(LogLevel.INFO, message, metadata);
    
    writeToFile(combinedLogPath, logMessage);

    if (!this.isProduction) {
      console.log(`ℹ️  INFO: ${message}`);
      if (Object.keys(metadata).length > 0) {
        console.log('Details:', metadata);
      }
    }
  }

  /**
   * Log debug information
   */
  debug(message, metadata = {}) {
    if (this.logLevel === 'debug' || !this.isProduction) {
      const logMessage = this.formatLogMessage(LogLevel.DEBUG, message, metadata);
      
      writeToFile(debugLogPath, logMessage);
      writeToFile(combinedLogPath, logMessage);

      console.debug(`🐛 DEBUG: ${message}`);
      if (Object.keys(metadata).length > 0) {
        console.debug('Details:', metadata);
      }
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req, res, responseTime) {
    const logEntry = {
      timestamp: formatDate(),
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'N/A',
      userId: req.user ? req.user.id : 'Anonymous'
    };

    const logMessage = this.formatLogMessage(LogLevel.INFO, 'HTTP Request', logEntry);
    writeToFile(accessLogPath, logMessage);
  }

  /**
   * Log database operation
   */
  logDatabase(operation, model, details = {}) {
    const logEntry = {
      timestamp: formatDate(),
      operation,
      model,
      ...details
    };

    const logMessage = this.formatLogMessage(LogLevel.DEBUG, `Database: ${operation}`, logEntry);
    writeToFile(debugLogPath, logMessage);
    writeToFile(combinedLogPath, logMessage);
  }

  /**
   * Log payment transaction
   */
  logPayment(action, details = {}) {
    const logEntry = {
      timestamp: formatDate(),
      action,
      ...details
    };

    const logMessage = this.formatLogMessage(LogLevel.INFO, `Payment: ${action}`, logEntry);
    writeToFile(getDateBasedLogPath('payment'), logMessage);
    writeToFile(combinedLogPath, logMessage);

    console.log(`💳 PAYMENT: ${action}`, details);
  }

  /**
   * Log authentication events
   */
  logAuth(event, userId, details = {}) {
    const logEntry = {
      timestamp: formatDate(),
      event,
      userId,
      ...details
    };

    const logMessage = this.formatLogMessage(LogLevel.INFO, `Auth: ${event}`, logEntry);
    writeToFile(getDateBasedLogPath('auth'), logMessage);
    writeToFile(combinedLogPath, logMessage);

    console.log(`🔐 AUTH: ${event}`, { userId, ...details });
  }

  /**
   * Get recent errors from log file
   */
  getRecentErrors(limit = 50) {
    try {
      const logFile = getDateBasedLogPath('error');
      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n');
      
      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line.substring(line.indexOf('{')));
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Failed to read error log:', error.message);
      return [];
    }
  }

  /**
   * Clear old log files (older than 30 days)
   */
  cleanOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(logsDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Failed to clean old logs:', error.message);
    }
  }

  /**
   * Get log statistics
   */
  getLogStats() {
    try {
      const stats = {
        errorCount: 0,
        warnCount: 0,
        totalSize: 0,
        files: []
      };

      if (fs.existsSync(logsDir)) {
        const files = fs.readdirSync(logsDir);
        
        files.forEach(file => {
          const filePath = path.join(logsDir, file);
          const fileStats = fs.statSync(filePath);
          
          stats.totalSize += fileStats.size;
          stats.files.push({
            name: file,
            size: fileStats.size,
            modified: fileStats.mtime
          });

          // Count errors
          if (file.includes('error')) {
            const content = fs.readFileSync(filePath, 'utf8');
            stats.errorCount += (content.match(/ERROR/g) || []).length;
          }
          if (file.includes('warn')) {
            const content = fs.readFileSync(filePath, 'utf8');
            stats.warnCount += (content.match(/WARN/g) || []).length;
          }
        });
      }

      return stats;
    } catch (error) {
      console.error('Failed to get log stats:', error.message);
      return null;
    }
  }
}

// Create singleton instance
const logger = new ErrorLogger();

// Export logger instance and utilities
module.exports = {
  logger,
  LogLevel,
  logsDir,
  
  // Convenience methods
  logError: (error, context) => logger.error(error, context),
  logWarn: (message, metadata) => logger.warn(message, metadata),
  logInfo: (message, metadata) => logger.info(message, metadata),
  logDebug: (message, metadata) => logger.debug(message, metadata),
  logRequest: (req, res, time) => logger.logRequest(req, res, time),
  logDatabase: (op, model, details) => logger.logDatabase(op, model, details),
  logPayment: (action, details) => logger.logPayment(action, details),
  logAuth: (event, userId, details) => logger.logAuth(event, userId, details),
};
