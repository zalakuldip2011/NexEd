import api from './api';

class NotificationService {
  // Get notifications
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/notifications?${queryParams}`);
    return response.data;
  }

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  // Mark notifications as read
  async markAsRead(notificationIds) {
    const response = await api.put('/notifications/mark-read', {
      notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds]
    });
    return response.data;
  }

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  }

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  // Clear all notifications
  async clearAllNotifications() {
    const response = await api.delete('/notifications');
    return response.data;
  }

  // Get notification by ID
  async getNotificationById(notificationId) {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  }

  // Update notification
  async updateNotification(notificationId, updates) {
    const response = await api.put(`/notifications/${notificationId}`, updates);
    return response.data;
  }

  // Get notification preferences (if implemented)
  async getNotificationPreferences() {
    const response = await api.get('/notifications/preferences');
    return response.data;
  }

  // Update notification preferences (if implemented)
  async updateNotificationPreferences(preferences) {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  }

  // Helper method to format notification date
  formatNotificationDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Helper method to get notification icon by type
  getNotificationIconType(type) {
    const iconMap = {
      enrollment: 'book-open',
      course_completion: 'award',
      payment_success: 'credit-card',
      payment_failed: 'alert-circle',
      password_change: 'lock',
      account_security: 'shield',
      system_maintenance: 'wrench',
      system_update: 'download',
      course_reminder: 'calendar',
      certificate_earned: 'award',
      new_course_available: 'book',
      instructor_message: 'message-circle',
      welcome: 'smile'
    };

    return iconMap[type] || 'bell';
  }

  // Helper method to get notification priority color
  getPriorityColor(priority) {
    const colorMap = {
      low: 'blue',
      medium: 'yellow', 
      high: 'red'
    };

    return colorMap[priority] || 'blue';
  }
}

export default new NotificationService();