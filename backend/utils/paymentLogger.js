/**
 * Payment Error Logger
 * Specialized logging for payment-related errors and events
 */

const fs = require('fs');
const path = require('path');

class PaymentLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.paymentLogFile = path.join(this.logDir, 'payments.log');
    this.errorLogFile = path.join(this.logDir, 'payment-errors.log');
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log payment success events
   */
  logSuccess(action, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      action,
      data,
      pid: process.pid
    };

    this.writeToFile(this.paymentLogFile, logEntry);
    
    // Also console log for immediate feedback
    console.log(`✅ PAYMENT SUCCESS: ${action}`, data);
  }

  /**
   * Log payment errors with detailed context
   */
  logError(action, error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      action,
      error: {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack,
        statusCode: error.statusCode
      },
      context,
      pid: process.pid
    };

    this.writeToFile(this.errorLogFile, logEntry);
    
    // Also console log for immediate feedback
    console.error(`❌ PAYMENT ERROR: ${action}`, {
      message: error.message,
      context
    });
  }

  /**
   * Log payment info/warning events
   */
  logInfo(action, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      action,
      data,
      pid: process.pid
    };

    this.writeToFile(this.paymentLogFile, logEntry);
    
    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️  PAYMENT INFO: ${action}`, data);
    }
  }

  /**
   * Log payment warnings
   */
  logWarning(action, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      action,
      message,
      data,
      pid: process.pid
    };

    this.writeToFile(this.paymentLogFile, logEntry);
    
    // Console log for immediate feedback
    console.warn(`⚠️  PAYMENT WARNING: ${action} - ${message}`, data);
  }

  /**
   * Write log entry to file
   */
  writeToFile(filePath, logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(filePath, logLine);
    } catch (writeError) {
      console.error('Failed to write to log file:', writeError);
    }
  }

  /**
   * Get recent payment errors for debugging
   */
  getRecentErrors(limit = 50) {
    try {
      if (!fs.existsSync(this.errorLogFile)) {
        return [];
      }

      const content = fs.readFileSync(this.errorLogFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      
      return lines.slice(-limit).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line };
        }
      }).reverse();
    } catch (error) {
      console.error('Failed to read error log:', error);
      return [];
    }
  }

  /**
   * Get payment statistics from logs
   */
  getPaymentStats() {
    try {
      if (!fs.existsSync(this.paymentLogFile)) {
        return {
          totalPayments: 0,
          successfulPayments: 0,
          failedPayments: 0,
          successRate: 0
        };
      }

      const content = fs.readFileSync(this.paymentLogFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      
      let successCount = 0;
      let errorCount = 0;
      let totalCount = 0;

      lines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          totalCount++;
          
          if (entry.level === 'SUCCESS') {
            successCount++;
          } else if (entry.level === 'ERROR') {
            errorCount++;
          }
        } catch {
          // Skip invalid lines
        }
      });

      return {
        totalPayments: totalCount,
        successfulPayments: successCount,
        failedPayments: errorCount,
        successRate: totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Failed to calculate payment stats:', error);
      return {
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        successRate: 0
      };
    }
  }

  /**
   * Clean old log files (keep last N days)
   */
  cleanOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      [this.paymentLogFile, this.errorLogFile].forEach(logFile => {
        if (fs.existsSync(logFile)) {
          const stats = fs.statSync(logFile);
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(logFile);
            console.log(`🧹 Cleaned old log file: ${path.basename(logFile)}`);
          }
        }
      });
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }
}

// Create singleton instance
const paymentLogger = new PaymentLogger();

module.exports = {
  PaymentLogger,
  paymentLogger
};