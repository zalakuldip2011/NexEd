const Notification = require('../models/Notification');

class NotificationService {
  // Create enrollment notification
  static async createEnrollmentNotification(userId, course, enrollmentType = 'paid') {
    try {
      const data = {
        user: userId,
        type: 'enrollment',
        title: '🎉 Successfully Enrolled!',
        message: `You have been enrolled in "${course.title}". Start learning now!`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          courseThumbnail: course.thumbnail,
          enrollmentType
        },
        priority: 'high',
        actionUrl: `/learn/${course._id}`,
        actionText: 'Start Learning'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating enrollment notification:', error);
    }
  }

  // Create password change notification
  static async createPasswordChangeNotification(userId, ipAddress, userAgent) {
    try {
      const data = {
        user: userId,
        type: 'password_change',
        title: '🔐 Password Changed',
        message: 'Your account password has been successfully changed. If this wasn\'t you, please contact support immediately.',
        data: {
          ipAddress,
          userAgent,
          timestamp: new Date()
        },
        priority: 'high',
        actionUrl: '/profile/security',
        actionText: 'Review Security'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating password change notification:', error);
    }
  }

  // Create profile update notification
  static async createProfileUpdateNotification(userId, changes) {
    try {
      const data = {
        user: userId,
        type: 'profile_update',
        title: '👤 Profile Updated',
        message: 'Your profile information has been successfully updated.',
        data: { changes },
        priority: 'medium',
        actionUrl: '/profile',
        actionText: 'View Profile'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating profile update notification:', error);
    }
  }

  // Create payment success notification
  static async createPaymentSuccessNotification(userId, payment, courses) {
    try {
      const courseNames = courses.map(c => c.title).join(', ');
      
      const data = {
        user: userId,
        type: 'payment_success',
        title: '💳 Payment Successful',
        message: `Your payment of ₹${payment.amount} for ${courseNames} has been processed successfully.`,
        data: {
          paymentId: payment._id,
          amount: payment.amount,
          courses: courses.map(c => ({
            id: c._id,
            title: c.title,
            thumbnail: c.thumbnail
          }))
        },
        priority: 'high',
        actionUrl: '/my-learning',
        actionText: 'View Courses'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating payment success notification:', error);
    }
  }

  // Create payment failed notification
  static async createPaymentFailedNotification(userId, payment, reason) {
    try {
      const data = {
        user: userId,
        type: 'payment_failed',
        title: '❌ Payment Failed',
        message: `Your payment of ₹${payment.amount} could not be processed. Reason: ${reason}`,
        data: {
          paymentId: payment._id,
          amount: payment.amount,
          reason
        },
        priority: 'high',
        actionUrl: '/cart',
        actionText: 'Retry Payment'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating payment failed notification:', error);
    }
  }

  // Create course completion notification
  static async createCourseCompletionNotification(userId, course, completionPercentage) {
    try {
      const data = {
        user: userId,
        type: 'course_completed',
        title: '🎓 Course Completed!',
        message: `Congratulations! You have completed "${course.title}". Your certificate is ready!`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          courseThumbnail: course.thumbnail,
          completionPercentage
        },
        priority: 'high',
        actionUrl: `/certificates/${course._id}`,
        actionText: 'View Certificate'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating course completion notification:', error);
    }
  }

  // Create certificate issued notification
  static async createCertificateNotification(userId, course, certificateId) {
    try {
      const data = {
        user: userId,
        type: 'certificate_issued',
        title: '🏆 Certificate Issued',
        message: `Your certificate for "${course.title}" has been issued and is ready for download.`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          certificateId
        },
        priority: 'high',
        actionUrl: `/certificates/${certificateId}`,
        actionText: 'Download Certificate'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating certificate notification:', error);
    }
  }

  // Create course update notification
  static async createCourseUpdateNotification(userId, course, updateType) {
    try {
      const updateMessages = {
        'new_content': `New content has been added to "${course.title}". Check it out!`,
        'content_updated': `"${course.title}" has been updated with improved content.`,
        'new_assignment': `A new assignment has been added to "${course.title}".`
      };

      const data = {
        user: userId,
        type: 'course_update',
        title: '📚 Course Updated',
        message: updateMessages[updateType] || `"${course.title}" has been updated.`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          updateType
        },
        priority: 'medium',
        actionUrl: `/learn/${course._id}`,
        actionText: 'View Updates'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating course update notification:', error);
    }
  }

  // Create security alert notification
  static async createSecurityAlert(userId, alertType, details) {
    try {
      const alertMessages = {
        'suspicious_login': 'Suspicious login attempt detected from a new device.',
        'multiple_failed_attempts': 'Multiple failed login attempts detected.',
        'account_locked': 'Your account has been temporarily locked due to security concerns.'
      };

      const data = {
        user: userId,
        type: 'security_alert',
        title: '🚨 Security Alert',
        message: alertMessages[alertType] || 'Security alert for your account.',
        data: details,
        priority: 'urgent',
        actionUrl: '/profile/security',
        actionText: 'Review Security'
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  // Create system update notification
  static async createSystemUpdateNotification(userId, updateInfo) {
    try {
      const data = {
        user: userId,
        type: 'system_update',
        title: '🔄 System Update',
        message: updateInfo.message || 'NexEd has been updated with new features and improvements.',
        data: updateInfo,
        priority: 'low',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
      };

      return await Notification.createNotification(data);
    } catch (error) {
      console.error('Error creating system update notification:', error);
    }
  }

  // Bulk create notifications for multiple users
  static async bulkCreateNotifications(notifications) {
    try {
      const results = await Notification.insertMany(notifications);
      
      // Emit socket events for each notification
      if (global.io) {
        results.forEach(notification => {
          global.io.to(notification.user.toString()).emit('newNotification', notification);
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error bulk creating notifications:', error);
    }
  }

  // Get notification stats for admin
  static async getNotificationStats(timeframe = '30d') {
    try {
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const stats = await Notification.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            readCount: {
              $sum: { $cond: ['$isRead', 1, 0] }
            }
          }
        },
        {
          $addFields: {
            readRate: {
              $multiply: [
                { $divide: ['$readCount', '$count'] },
                100
              ]
            }
          }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return [];
    }
  }
}

module.exports = NotificationService;