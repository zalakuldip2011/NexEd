// Load environment variables FIRST before requiring any other modules
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const { initAccountDeletionJob } = require('./jobs/accountDeletion');
const { requestLogger, performanceMonitor } = require('./middleware/requestLogger');
const { 
  errorHandler, 
  notFound, 
  handleUnhandledRejection, 
  handleUncaughtException 
} = require('./middleware/errorHandler');
const { logger } = require('./utils/errorLogger');

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Allow access from local network
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
];

// Get local network IPs for CORS
const os = require('os');
const networkInterfaces = os.networkInterfaces();
Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      allowedOrigins.push(`http://${iface.address}:3000`);
    }
  });
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches local network pattern
    if (allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/.test(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, true); // Allow in development - change to false in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(requestLogger); // Custom request logger
app.use(performanceMonitor); // Performance monitoring
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/enroll', require('./routes/enroll')); // Razorpay enrollment routes
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/video', require('./routes/videoSecurity'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'NexEd Backend API',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check endpoints for monitoring
app.get('/api/logs/stats', (req, res) => {
  try {
    const stats = logger.getLogStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get log stats',
      error: error.message
    });
  }
});

app.get('/api/logs/recent-errors', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const errors = logger.getRecentErrors(limit);
    res.json({
      success: true,
      count: errors.length,
      data: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recent errors',
      error: error.message
    });
  }
});

// 404 handler - must be before error handler
app.use(notFound);

// Global error handling middleware - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Logging: Enabled (check /logs directory)`);
  
  // Log server startup
  logger.info('Server started successfully', {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  
  // Show local network IP for mobile access
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  console.log('\n📱 Access from other devices on your network:');
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   http://${iface.address}:${PORT}`);
      }
    });
  });
  
  // Initialize cron jobs
  initAccountDeletionJob();
  
  // Clean old logs on startup (keep last 30 days)
  logger.cleanOldLogs(30);
});