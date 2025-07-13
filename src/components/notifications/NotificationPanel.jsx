import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import * as authService from '../../services/authService';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    reminders,
    unreadCount,
    markNotificationAsRead,
    clearNotification,
    clearAllNotifications,
    clearReminder,
    clearAllReminders,
    isConnected
  } = useNotification();

  const [activeTab, setActiveTab] = useState('notifications');
  const [savedReminders, setSavedReminders] = useState([]);

  // Load saved reminders when panel opens
  useEffect(() => {
    if (isOpen) {
      loadSavedReminders();
    }
  }, [isOpen]);

  const loadSavedReminders = async () => {
    try {
      const allReminders = [];

      // Load login reminder
      const loginReminder = authService.getLoginReminder();
      if (loginReminder) {
        allReminders.push({
          id: 'login-reminder',
          content: loginReminder,
          message: loginReminder,
          type: 'login',
          category: 'system',
          timestamp: new Date().toISOString(),
          source: 'Login reminder'
        });
      }

      // Note: User reminders are not loaded here since getAllReminders is admin-only
      // User can view their reminders in the dedicated reminder pages

      setSavedReminders(allReminders);
    } catch (error) {
      console.error('Error loading saved reminders:', error);
    }
  };

  const clearLoginReminder = () => {
    authService.clearLoginReminder();
    setSavedReminders(prev => prev.filter(r => r.id !== 'login-reminder'));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification-panel-header">
          <h3>Notifications & Reminders</h3>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="notification-tabs">
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            Reminders
            {reminders.length > 0 && <span className="badge">{reminders.length}</span>}
          </button>
        </div>

        <div className="notification-content">
          {activeTab === 'notifications' && (
            <div className="notifications-tab">
              <div className="tab-header">
                <h4>Notifications ({notifications.length})</h4>
                {notifications.length > 0 && (
                  <button 
                    className="clear-all-btn"
                    onClick={clearAllNotifications}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-content">
                        <div className="notification-header">
                          <h5 className="notification-title">
                            {notification.title || 'Notification'}
                          </h5>
                          <span className="notification-time">
                            {formatTime(notification.timestamp || notification.createdAt)}
                          </span>
                        </div>
                        <p className="notification-message">
                          {notification.message || notification.content}
                        </p>
                        {notification.type && (
                          <span className={`notification-type ${notification.type}`}>
                            {notification.type}
                          </span>
                        )}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="reminders-tab">
              <div className="tab-header">
                <h4>Reminders ({reminders.length + savedReminders.length})</h4>
                {(reminders.length > 0 || savedReminders.length > 0) && (
                  <button 
                    className="clear-all-btn"
                    onClick={() => {
                      clearAllReminders();
                      setSavedReminders([]);
                      authService.clearLoginReminder();
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="reminders-list">
                {/* Show saved reminders first */}
                {savedReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="reminder-item"
                  >
                    <div className="reminder-content">
                      <div className="reminder-header">
                        <h5 className="reminder-title">
                          {reminder.source === 'Login reminder' ? '🔔' : '⏰'} {reminder.source}
                        </h5>
                        <span className="reminder-time">
                          {formatTime(reminder.timestamp)}
                        </span>
                      </div>
                      <p className="reminder-message">
                        {reminder.content || reminder.message}
                      </p>
                      {reminder.category && (
                        <span className={`reminder-category ${reminder.category}`}>
                          {reminder.category}
                        </span>
                      )}
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (reminder.id === 'login-reminder') {
                          clearLoginReminder();
                        } else {
                          setSavedReminders(prev => prev.filter(r => r.id !== reminder.id));
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Show WebSocket reminders */}
                {reminders.length === 0 && savedReminders.length === 0 ? (
                  <div className="empty-state">
                    <p>No reminders yet</p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="reminder-item"
                    >
                      <div className="reminder-content">
                        <div className="reminder-header">
                          <h5 className="reminder-title">
                            ⏰ Live Reminder
                          </h5>
                          <span className="reminder-time">
                            {formatTime(reminder.timestamp || reminder.createdAt)}
                          </span>
                        </div>
                        <p className="reminder-message">
                          {reminder.content || reminder.message}
                        </p>
                        {reminder.category && (
                          <span className={`reminder-category ${reminder.category}`}>
                            {reminder.category}
                          </span>
                        )}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearReminder(reminder.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
