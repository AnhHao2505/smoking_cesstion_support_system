import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import webSocketService from '../services/websocketService';
import { useAuth } from './AuthContext';

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
  const [isConnected, setIsConnected] = useState(false);

  // Handle new notification received
  const handleNotification = useCallback((notification) => {
    console.log('📢 New notification received:', notification);
    
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    
    // Update unread count if notification is unread
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'Smoking Cessation Support', {
        body: notification.message || notification.content,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`,
      });
    }

    // Show toast notification (you can customize this)
    showToast(notification);
  }, []);

  // Handle new reminder received
  const handleReminder = useCallback((reminder) => {
    console.log('⏰ New reminder received:', reminder);
    
    // Add to reminders list
    setReminders(prev => [reminder, ...prev]);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Reminder', {
        body: reminder.content || reminder.message,
        icon: '/favicon.ico',
        tag: `reminder-${reminder.id}`,
        requireInteraction: true, // Keeps notification visible until user interacts
      });
    }

    // Show toast notification (you can customize this)
    showToast(reminder, 'reminder');
  }, []);

  // Show toast notification (simple implementation)
  const showToast = (data, type = 'notification') => {
    // You can integrate with a toast library like react-toastify here
    console.log(`🔔 ${type}:`, data.content || data.message);
  };

  // Handle WebSocket connection status
  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
    if (connected) {
      console.log('✅ WebSocket connected - subscribing to notifications and reminders');
      
      // Subscribe to notifications and reminders when connected
      try {
        webSocketService.subscribeToNotifications(handleNotification);
        webSocketService.subscribeToReminders(handleReminder);
      } catch (error) {
        console.error('❌ Error subscribing to notifications/reminders:', error);
      }
    }
  }, [handleNotification, handleReminder]);

  // Initialize WebSocket connection and subscriptions
  useEffect(() => {
    if (isAuthenticated() && currentUser) {
      console.log('🔌 Initializing notification system for user:', currentUser.id);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 Notification permission:', permission);
        });
      }

      // Set up connection change listener
      webSocketService.onConnectionChange(handleConnectionChange);

      // Connect to WebSocket if not already connected
      if (!webSocketService.isConnected()) {
        webSocketService.connect()
          .then(() => {
            console.log('✅ WebSocket connected successfully');
          })
          .catch(error => {
            console.error('❌ Failed to connect WebSocket:', error);
          });
      } else {
        // Already connected, just subscribe
        handleConnectionChange(true);
      }

      // Cleanup function
      return () => {
        webSocketService.removeConnectionCallback(handleConnectionChange);
        webSocketService.unsubscribeFromNotifications();
        webSocketService.unsubscribeFromReminders();
      };
    }
  }, [isAuthenticated, currentUser, handleConnectionChange]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Clear reminder
  const clearReminder = useCallback((reminderId) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  }, []);

  // Clear all reminders
  const clearAllReminders = useCallback(() => {
    setReminders([]);
  }, []);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Context value
  const value = {
    notifications,
    reminders,
    unreadCount,
    isConnected,
    markNotificationAsRead,
    clearNotification,
    clearAllNotifications,
    clearReminder,
    clearAllReminders,
    getUnreadNotifications,
    showToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
