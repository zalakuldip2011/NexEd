const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/notifications
// @desc    Get user notifications with pagination
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/notifications/mark-read
// @desc    Mark specific notifications as read
// @access  Private
router.put('/mark-read', markAsRead);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete specific notification
// @access  Private
router.delete('/:id', deleteNotification);

// @route   DELETE /api/notifications
// @desc    Clear all notifications
// @access  Private
router.delete('/', clearAllNotifications);

module.exports = router;