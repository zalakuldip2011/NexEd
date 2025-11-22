const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, requireRole } = require('../middleware/auth');
const {
  // Public endpoints
  submitFeedback,
  getPublicFeedback,
  getFeaturedFeedback,
  
  // Admin endpoints
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats
} = require('../controllers/feedbackController');

// Validation middleware
const validateFeedback = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('type')
    .optional()
    .isIn(['website_experience', 'course_quality', 'instructor_feedback', 'platform_feature', 'technical_issue', 'general'])
    .withMessage('Invalid feedback type')
];

// Public routes (no authentication required)
router.post('/', validateFeedback, submitFeedback);
router.get('/public', getPublicFeedback);
router.get('/featured', getFeaturedFeedback);

// Admin routes (require authentication and admin role)
router.get('/admin', protect, requireRole('admin'), getAllFeedback);
router.get('/admin/stats', protect, requireRole('admin'), getFeedbackStats);
router.put('/admin/:id/status', protect, requireRole('admin'), updateFeedbackStatus);
router.delete('/admin/:id', protect, requireRole('admin'), deleteFeedback);

module.exports = router;