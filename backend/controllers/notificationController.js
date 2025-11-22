const Notification = require('../models/Notification');
const { createLogger } = require('../utils/logger');

const logger = createLogger('NOTIFICATION');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.id;

    const query = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    // Add timeAgo for each notification
    notifications.forEach(notification => {
      const now = new Date();
      const diff = now - notification.createdAt;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (minutes < 1) notification.timeAgo = 'Just now';
      else if (minutes < 60) notification.timeAgo = `${minutes}m ago`;
      else if (hours < 24) notification.timeAgo = `${hours}h ago`;
      else if (days < 7) notification.timeAgo = `${days}d ago`;
      else notification.timeAgo = notification.createdAt.toLocaleDateString();
    });

    logger.success('Notifications retrieved successfully', {
      userId,
      count: notifications.length,
      unreadCount
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    logger.error('Error getting notifications', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    logger.error('Error getting unread count', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count'
    });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.id;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs are required'
      });
    }

    const result = await Notification.markAsRead(userId, notificationIds);
    const unreadCount = await Notification.getUnreadCount(userId);

    logger.info('Notifications marked as read', {
      userId,
      count: result.modifiedCount
    });

    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: { 
        modifiedCount: result.modifiedCount,
        unreadCount 
      }
    });
  } catch (error) {
    logger.error('Error marking notifications as read', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    logger.info('All notifications marked as read', {
      userId,
      count: result.modifiedCount
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { 
        modifiedCount: result.modifiedCount,
        unreadCount: 0
      }
    });
  } catch (error) {
    logger.error('Error marking all notifications as read', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.getUnreadCount(userId);

    logger.info('Notification deleted', { userId, notificationId: id });

    res.json({
      success: true,
      message: 'Notification deleted',
      data: { unreadCount }
    });
  } catch (error) {
    logger.error('Error deleting notification', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({ user: userId });

    logger.info('All notifications cleared', {
      userId,
      deletedCount: result.deletedCount
    });

    res.json({
      success: true,
      message: 'All notifications cleared',
      data: { 
        deletedCount: result.deletedCount,
        unreadCount: 0
      }
    });
  } catch (error) {
    logger.error('Error clearing all notifications', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing notifications'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};