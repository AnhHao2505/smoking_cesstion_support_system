import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as authService from '../services/authService';
import * as notificationService from '../services/notificationService';

// Create the context
const NotificationContext = createContext(null);

// Custom hook for using the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from backend API
  const fetchNotifications = useCallback(async (pageNo = 0, pageSize = 50) => {
    if (!isAuthenticated || !currentUser) return;

    try {
      setLoading(true);
      // Fetch only unread notifications for better UX - read notifications won't clutter the UI
      const [unreadResponse, importantResponse] = await Promise.all([
        notificationService.getUnreadNotifications(pageNo, pageSize),
        notificationService.getImportantNotifications(pageNo, pageSize)
      ]);
      
      // Backend already filters important notifications to unread only
      // Update notifications state with only unread notifications
      setNotifications(unreadResponse.content || []);
      setUnreadCount(unreadResponse.totalElements || 0);
      
      console.log('📢 Notifications loaded:', {
        unread: unreadResponse.totalElements,
        unreadImportant: importantResponse.totalElements,
        notifications: unreadResponse.content
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  // Refresh notifications (can be called manually)
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      console.log('🔄 Marking notification as read:', notificationId);
      
      // Check if the notification was unread before marking
      const notification = notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;
      
      await notificationService.markAsRead(notificationId);
      
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      // Decrease unread count only if it was previously unread
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Force refresh notifications after a short delay to ensure backend consistency
      setTimeout(() => {
        console.log('🔄 Refreshing notifications after mark-as-read');
        fetchNotifications();
      }, 1000);
      
      console.log('✅ Notification marked as read successfully');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, [fetchNotifications, notifications]);

  // Clear single notification (for UI purposes only)
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    // If it was unread, decrease the count
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  // Clear all notifications (for UI purposes only)
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Load saved reminders from local storage and other sources
  const loadSavedReminders = useCallback(async () => {
    if (!currentUser) return;

    try {
      const savedReminders = [];

      // Load login reminder if exists
      const loginReminder = authService.getLoginReminder();
      if (loginReminder) {
        savedReminders.push({
          id: 'login-reminder',
          content: loginReminder,
          message: loginReminder,
          type: 'login',
          category: 'system',
          timestamp: new Date().toISOString(),
          source: 'login'
        });
      }

      // Update reminders state with saved reminders
      setReminders(savedReminders);

    } catch (error) {
      console.error('Error loading saved reminders:', error);
    }
  }, [currentUser]);

  // Clear reminder
  const clearReminder = useCallback((reminderId) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  }, []);

  // Clear all reminders
  const clearAllReminders = useCallback(() => {
    setReminders([]);
  }, []);

  // Clear login reminder specifically
  const clearLoginReminder = useCallback(() => {
    authService.clearLoginReminder();
    setReminders(prev => prev.filter(r => r.id !== 'login-reminder'));
  }, []);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.isRead);
  }, [notifications]);

  // Get important notifications
  const getImportantNotifications = useCallback(() => {
    return notifications.filter(notification => notification.isImportant);
  }, [notifications]);

  // Fetch important notifications specifically
  const fetchImportantNotifications = useCallback(async (pageNo = 0, pageSize = 50) => {
    if (!isAuthenticated || !currentUser) return [];

    try {
      const response = await notificationService.getImportantNotifications(pageNo, pageSize);
      // Filter to return only unread important notifications
      const unreadImportant = (response.content || []).filter(n => !n.isRead);
      return unreadImportant;
    } catch (error) {
      console.error('Error fetching important notifications:', error);
      return [];
    }
  }, [isAuthenticated, currentUser]);

  // Show browser notification (for important notifications)
  const showBrowserNotification = useCallback((title, body, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        ...options
      });
    }
  }, []);

  // Initialize notification system
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('� Initializing notification system for user:', currentUser.id);
      
      // Load saved reminders
      loadSavedReminders();

      // Fetch notifications from backend
      fetchNotifications();

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 Notification permission:', permission);
        });
      }

      // Set up periodic refresh (every 30 seconds)
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 30000);

      // Cleanup interval on unmount
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isAuthenticated, currentUser, fetchNotifications, loadSavedReminders]);

  // Context value
  const value = {
    notifications,
    reminders,
    unreadCount,
    loading,
    fetchNotifications,
    refreshNotifications,
    markNotificationAsRead,
    clearNotification,
    clearAllNotifications,
    clearReminder,
    clearAllReminders,
    clearLoginReminder,
    loadSavedReminders,
    getUnreadNotifications,
    getImportantNotifications,
    fetchImportantNotifications,
    showBrowserNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
