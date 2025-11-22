import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (options = {}) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 20,
        ...(options.unreadOnly && { unreadOnly: true })
      });

      const response = await api.get(`/notifications?${queryParams}`);
      
      if (response.data.success) {
        const { notifications: fetchedNotifications, unreadCount: fetchedUnreadCount } = response.data.data;
        
        if (options.append) {
          setNotifications(prev => [...prev, ...fetchedNotifications]);
        } else {
          setNotifications(fetchedNotifications);
        }
        
        setUnreadCount(fetchedUnreadCount);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds) => {
    if (!isAuthenticated || !notificationIds || notificationIds.length === 0) return;

    try {
      const response = await api.put('/notifications/mark-read', {
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds]
      });

      if (response.data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notificationIds.includes(notification._id)
              ? { ...notification, isRead: true, readAt: new Date() }
              : notification
          )
        );
        setUnreadCount(response.data.data.unreadCount);
        return response.data;
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }, [isAuthenticated]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.put('/notifications/mark-all-read');

      if (response.data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date()
          }))
        );
        setUnreadCount(0);
        return response.data;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }, [isAuthenticated]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated || !notificationId) return;

    try {
      const response = await api.delete(`/notifications/${notificationId}`);

      if (response.data.success) {
        // Update local state
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(response.data.data.unreadCount);
        return response.data;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }, [isAuthenticated]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.delete('/notifications');

      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
        return response.data;
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }, [isAuthenticated]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((newNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Initial fetch when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications({ limit: 10 });
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, fetchNotifications, fetchUnreadCount]);

  // Setup real-time updates (WebSocket/Socket.IO integration can be added here)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;