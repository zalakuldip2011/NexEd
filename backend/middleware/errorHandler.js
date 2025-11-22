/**
 * Centralized Error Handling Middleware
 * Handles all types of errors with proper logging and responses
 */

const { logger } = require('../utils/errorLogger');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle CastError (Invalid MongoDB ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

/**
 * Handle Duplicate Field Error (MongoDB E11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = "${value}". Please use another value!`;
  return new AppError(message, 400, 'DUPLICATE_FIELD');
};

/**
 * Handle Validation Error (Mongoose)
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

/**
 * Handle JWT Invalid Error
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');
};

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');
};

/**
 * Handle Multer File Size Error
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Maximum size is 5MB', 400, 'FILE_TOO_LARGE');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum is 10 files', 400, 'TOO_MANY_FILES');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }
  return new AppError(err.message, 400, 'FILE_UPLOAD_ERROR');
};

/**
 * Handle Razorpay Errors
 */
const handleRazorpayError = (err) => {
  let message = 'Payment processing failed';
  let code = 'PAYMENT_ERROR';
  
  if (err.error && err.error.description) {
    message = err.error.description;
  }
  
  if (err.statusCode === 400) {
    code = 'PAYMENT_BAD_REQUEST';
  } else if (err.statusCode === 401) {
    code = 'PAYMENT_UNAUTHORIZED';
  }
  
  return new AppError(message, err.statusCode || 500, code);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, req, res) => {
  // Log error with context
  logger.error(err, {
    url: req.originalUrl,
    method: req.method,
    userId: req.user ? req.user.id : null,
    ip: req.ip,
    body: req.body,
    query: req.query,
    params: req.params
  });

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      code: err.code || 'ERROR',
      statusCode: err.statusCode || 500,
      stack: err.stack,
      details: err.errors || {}
    },
    request: {
      url: req.originalUrl,
      method: req.method,
      timestamp: err.timestamp || new Date().toISOString()
    }
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, req, res) => {
  // Log error with context
  logger.error(err, {
    url: req.originalUrl,
    method: req.method,
    userId: req.user ? req.user.id : null,
    ip: req.ip
  });

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code || 'ERROR'
    });
  } 
  // Programming or unknown error: don't leak error details
  else {
    console.error('💥 FATAL ERROR:', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Main Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Create a copy of error for manipulation
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastErrorDB(error);
  if (err.code === 11000) error = handleDuplicateFieldsDB(error);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MulterError') error = handleMulterError(error);
  if (err.error && err.error.source === 'razorpay') error = handleRazorpayError(error);

  // Send response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    logger.error(err, {
      type: 'unhandledRejection',
      fatal: true
    });
    
    // Give server time to finish pending requests
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    logger.error(err, {
      type: 'uncaughtException',
      fatal: true
    });
    
    process.exit(1);
  });
};

/**
 * Validation Error Helper
 */
const validationError = (message, field = null) => {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  if (field) {
    error.field = field;
  }
  return error;
};

/**
 * Not Found Error Helper
 */
const notFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Unauthorized Error Helper
 */
const unauthorizedError = (message = 'Unauthorized access') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden Error Helper
 */
const forbiddenError = (message = 'You do not have permission to perform this action') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

/**
 * Conflict Error Helper
 */
const conflictError = (message = 'Resource conflict') => {
  return new AppError(message, 409, 'CONFLICT');
};

/**
 * Bad Request Error Helper
 */
const badRequestError = (message = 'Bad request') => {
  return new AppError(message, 400, 'BAD_REQUEST');
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException,
  
  // Error helpers
  validationError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  conflictError,
  badRequestError
};
