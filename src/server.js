/**
 * Server Entry Point
 * Connects to MongoDB and starts Express server
 */

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./courses/utils/logger.util');

// Configuration
const PORT = process.env.COURSE_SERVICE_PORT || 5001;
// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/NexEd';
const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    logger.info('🔌 Connecting to MongoDB...', { uri: MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') });
    
    await mongoose.connect(MONGO_URI, mongoOptions);
    
    logger.info('✅ MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error', { error: err.message });
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed', { 
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

/**
 * Start Express server
 */
function startServer() {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`, {
      environment: NODE_ENV,
      port: PORT,
      pid: process.pid
    });
    
    logger.info('📋 Available endpoints:', {
      health: `http://localhost:${PORT}/health`,
      createCourse: `POST http://localhost:${PORT}/api/courses/instructor`,
      updateCourse: `PUT http://localhost:${PORT}/api/courses/:id`,
      publishCourse: `PATCH http://localhost:${PORT}/api/courses/:id/publish`,
      instructorCourses: `GET http://localhost:${PORT}/api/courses/instructor`,
      publicCourses: `GET http://localhost:${PORT}/api/courses/public`
    });
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('⚠️ SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('✅ HTTP server closed');
      mongoose.connection.close(false, () => {
        logger.info('✅ MongoDB connection closed');
        process.exit(0);
      });
    });
  });
  
  process.on('SIGINT', () => {
    logger.info('⚠️ SIGINT signal received: closing HTTP server');
    server.close(() => {
      logger.info('✅ HTTP server closed');
      mongoose.connection.close(false, () => {
        logger.info('✅ MongoDB connection closed');
        process.exit(0);
      });
    });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection', {
      reason,
      promise
    });
    process.exit(1);
  });
}

/**
 * Initialize application
 */
async function initialize() {
  try {
    logger.info('🎬 Starting NexEd Course Service...', {
      nodeVersion: process.version,
      platform: process.platform,
      environment: NODE_ENV
    });
    
    // Connect to database
    await connectDatabase();
    
    // Start server
    startServer();
    
  } catch (error) {
    logger.error('❌ Failed to initialize application', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Start the application
initialize();
