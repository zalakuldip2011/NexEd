import React, { useState } from 'react';
import { 
  BookOpenIcon as BookOpen, 
  CreditCardIcon as CreditCard, 
  TrophyIcon as Award, 
  ExclamationCircleIcon as AlertCircle, 
  CalendarIcon as Calendar,
  EyeIcon as Eye,
  TrashIcon as Trash2,
  ShieldCheckIcon as Shield,
  WrenchScrewdriverIcon as Wrench,
  ArrowDownTrayIcon as Download,
  ChatBubbleLeftRightIcon as MessageCircle,
  FaceSmileIcon as Smile
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';

const NotificationItem = ({ notification }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { markAsRead, deleteNotification } = useNotifications();

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5 flex-shrink-0";
    
    switch (type) {
      case 'enrollment':
        return <BookOpen className={`${iconClass} text-blue-500`} />;
      case 'course_completion':
        return <Award className={`${iconClass} text-green-500`} />;
      case 'payment_success':
      case 'payment_failed':
        return <CreditCard className={`${iconClass} ${type === 'payment_success' ? 'text-green-500' : 'text-red-500'}`} />;
      case 'password_change':
      case 'account_security':
        return <Shield className={`${iconClass} text-orange-500`} />;
      case 'system_maintenance':
        return <Wrench className={`${iconClass} text-yellow-500`} />;
      case 'system_update':
        return <Download className={`${iconClass} text-yellow-500`} />;
      case 'course_reminder':
        return <Calendar className={`${iconClass} text-purple-500`} />;
      case 'instructor_message':
        return <MessageCircle className={`${iconClass} text-blue-500`} />;
      case 'welcome':
        return <Smile className={`${iconClass} text-green-500`} />;
      default:
        return <AlertCircle className={`${iconClass} text-gray-500`} />;
    }
  };

  // Get notification priority styling
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  // Format relative time
  const formatTime = (dateString) => {
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
  };

  // Handle mark as read
  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (notification.isRead) return;
    
    try {
      await markAsRead([notification._id]);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      await deleteNotification(notification._id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setIsDeleting(false);
    }
  };

  // Handle click on notification (mark as read and navigate if applicable)
  const handleNotificationClick = async () => {
    if (!notification.isRead) {
      await handleMarkAsRead();
    }
    
    // Handle navigation based on notification type and metadata
    if (notification.metadata?.courseId) {
      // Navigate to course page
      window.location.href = `/courses/${notification.metadata.courseId}`;
    } else if (notification.metadata?.enrollmentId) {
      // Navigate to my learning
      window.location.href = '/my-learning';
    } else if (notification.metadata?.paymentId) {
      // Navigate to payment history or course
      window.location.href = '/my-learning';
    }
  };

  return (
    <div 
      className={`
        group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer
        ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}
        ${getPriorityStyles(notification.priority)}
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={`text-sm font-medium ${
            !notification.isRead 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-300'
          }`}>
            {notification.title}
          </h4>

          {/* Message */}
          <p className={`text-sm mt-1 ${
            !notification.isRead 
              ? 'text-gray-700 dark:text-gray-200' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {notification.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(notification.createdAt)}
            </span>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Mark as read"
                >
                  <Eye className="h-3 w-3" />
                </button>
              )}
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                title="Delete notification"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
        )}
      </div>

      {/* Loading overlay for delete */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;