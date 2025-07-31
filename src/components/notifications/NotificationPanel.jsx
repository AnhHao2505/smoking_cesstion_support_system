import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import * as authService from '../../services/authService';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    reminders,
    unreadCount,
    loading,
    markNotificationAsRead,
    clearNotification,
    clearAllNotifications,
    clearReminder,
    clearAllReminders,
    refreshNotifications,
    getImportantNotifications,
    fetchImportantNotifications
  } = useNotification();

  const [activeTab, setActiveTab] = useState('notifications');
  const [savedReminders, setSavedReminders] = useState([]);
  const [importantNotifications, setImportantNotifications] = useState([]);

  // Load saved reminders when panel opens
  useEffect(() => {
    if (isOpen) {
      loadSavedReminders();
      refreshNotifications(); // Refresh notifications when panel opens
      
      // Load important notifications
      const loadImportantNotifications = async () => {
        const important = await fetchImportantNotifications();
        // Backend already filters unread important notifications, no need to filter again
        setImportantNotifications(important);
      };
      loadImportantNotifications();
    }
  }, [isOpen, refreshNotifications, fetchImportantNotifications]);

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
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log('🔄 Marking notification as read from panel:', notificationId);
      await markNotificationAsRead(notificationId);
      
      // Remove notification immediately from current view
      if (activeTab === 'important') {
        // Remove from important notifications list
        setImportantNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
      }
      
      // Refresh both main notifications and important notifications to ensure consistency
      refreshNotifications();
      
      console.log('✅ Notification marked as read and removed from view');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
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
          <h3>Thông báo & Nhắc nhở</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="notification-tabs">
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Chưa đọc
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'important' ? 'active' : ''}`}
            onClick={() => setActiveTab('important')}
          >
            Quan trọng
            {importantNotifications.length > 0 && 
              <span className="badge important">{importantNotifications.length}</span>
            }
          </button>
          <button
            className={`tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            Nhắc nhở
            {(reminders.length + savedReminders.length) > 0 && 
              <span className="badge">{reminders.length + savedReminders.length}</span>
            }
          </button>
        </div>

        <div className="notification-content">
          {activeTab === 'notifications' && (
            <div className="notifications-tab">
              <div className="tab-header">
                <h4>Thông báo chưa đọc ({notifications.length})</h4>
                <div className="header-actions">
                  {loading && <span className="loading-text">Đang tải...</span>}
                  <button 
                    className="refresh-btn"
                    onClick={refreshNotifications}
                    disabled={loading}
                  >
                    🔄
                  </button>
                  {notifications.length > 0 && (
                    <button 
                      className="clear-all-btn"
                      onClick={clearAllNotifications}
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>
              
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <p>Không có thông báo mới</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.isImportant ? 'important' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-content">
                        <div className="notification-header">
                          <h5 className="notification-title">
                            {notification.isImportant && '🚨 '}
                            Thông báo
                          </h5>
                          <span className="notification-time">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="notification-message">
                          {notification.content}
                        </p>
                        {!notification.isRead && (
                          <div className="notification-actions">
                            <button
                              className="mark-read-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              Đánh dấu đã đọc
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        className="remove-btn"
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

          {activeTab === 'important' && (
            <div className="important-tab">
              <div className="tab-header">
                <h4>Thông báo quan trọng ({importantNotifications.length})</h4>
                <div className="header-actions">
                  {loading && <span className="loading-text">Đang tải...</span>}
                  <button 
                    className="refresh-btn"
                    onClick={async () => {
                      const important = await fetchImportantNotifications();
                      // Backend already filters unread important notifications
                      setImportantNotifications(important);
                    }}
                    disabled={loading}
                  >
                    🔄
                  </button>
                </div>
              </div>
              
              <div className="notifications-list">
                {importantNotifications.length === 0 ? (
                  <div className="empty-state">
                    <p>Không có thông báo quan trọng</p>
                  </div>
                ) : (
                  importantNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item important ${!notification.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-content">
                        <div className="notification-header">
                          <h5 className="notification-title">
                            🚨 Thông báo quan trọng
                            <span className="important-indicator">Quan trọng</span>
                          </h5>
                          <span className="notification-time">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="notification-message">
                          {notification.content}
                        </p>
                        {!notification.isRead && (
                          <div className="notification-actions">
                            <button
                              className="mark-read-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              Đánh dấu đã đọc
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImportantNotifications(prev => 
                            prev.filter(n => n.id !== notification.id)
                          );
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
                <h4>Nhắc nhở ({reminders.length + savedReminders.length})</h4>
                {(reminders.length > 0 || savedReminders.length > 0) && (
                  <button 
                    className="clear-all-btn"
                    onClick={() => {
                      clearAllReminders();
                      setSavedReminders([]);
                      authService.clearLoginReminder();
                    }}
                  >
                    Xóa tất cả
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

                {/* Show other reminders */}
                {reminders.map((reminder) => (
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
                ))}

                {/* Empty state */}
                {reminders.length === 0 && savedReminders.length === 0 && (
                  <div className="empty-state">
                    <p>Chưa có nhắc nhở nào</p>
                  </div>
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
