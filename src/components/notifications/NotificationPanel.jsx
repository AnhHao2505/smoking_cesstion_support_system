import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
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
                <h4>Reminders ({reminders.length})</h4>
                {reminders.length > 0 && (
                  <button 
                    className="clear-all-btn"
                    onClick={clearAllReminders}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="reminders-list">
                {reminders.length === 0 ? (
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
                            ⏰ Reminder
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
