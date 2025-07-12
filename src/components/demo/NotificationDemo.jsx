import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './NotificationDemo.css';

const NotificationDemo = () => {
  const { showToast } = useNotification();
  const [demoNotification, setDemoNotification] = useState({
    title: 'Test Notification',
    message: 'This is a test notification message',
    type: 'info'
  });
  
  const [demoReminder, setDemoReminder] = useState({
    content: 'Remember to take your medication',
    category: 'medication'
  });

  // Simulate receiving a notification
  const simulateNotification = () => {
    const notification = {
      id: Date.now(),
      title: demoNotification.title,
      message: demoNotification.message,
      type: demoNotification.type,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`,
      });
    }

    showToast(notification);
  };

  // Simulate receiving a reminder
  const simulateReminder = () => {
    const reminder = {
      id: Date.now(),
      content: demoReminder.content,
      category: demoReminder.category,
      timestamp: new Date().toISOString()
    };

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Reminder', {
        body: reminder.content,
        icon: '/favicon.ico',
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
      });
    }

    showToast(reminder, 'reminder');
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      alert(`Notification permission: ${permission}`);
    } else {
      alert('This browser does not support notifications');
    }
  };

  return (
    <div className="notification-demo">
      <h2>🔔 Notification & Reminder Demo</h2>
      
      <div className="demo-section">
        <h3>Browser Notification Permission</h3>
        <p>Current permission: <strong>{Notification.permission}</strong></p>
        <button 
          className="btn btn-primary"
          onClick={requestNotificationPermission}
        >
          Request Permission
        </button>
      </div>

      <div className="demo-section">
        <h3>📢 Test Notification</h3>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={demoNotification.title}
            onChange={(e) => setDemoNotification(prev => ({
              ...prev,
              title: e.target.value
            }))}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Message:</label>
          <textarea
            value={demoNotification.message}
            onChange={(e) => setDemoNotification(prev => ({
              ...prev,
              message: e.target.value
            }))}
            className="form-control"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Type:</label>
          <select
            value={demoNotification.type}
            onChange={(e) => setDemoNotification(prev => ({
              ...prev,
              type: e.target.value
            }))}
            className="form-control"
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <button 
          className="btn btn-success"
          onClick={simulateNotification}
        >
          Send Test Notification
        </button>
      </div>

      <div className="demo-section">
        <h3>⏰ Test Reminder</h3>
        <div className="form-group">
          <label>Content:</label>
          <textarea
            value={demoReminder.content}
            onChange={(e) => setDemoReminder(prev => ({
              ...prev,
              content: e.target.value
            }))}
            className="form-control"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Category:</label>
          <select
            value={demoReminder.category}
            onChange={(e) => setDemoReminder(prev => ({
              ...prev,
              category: e.target.value
            }))}
            className="form-control"
          >
            <option value="general">General</option>
            <option value="medication">Medication</option>
            <option value="health">Health</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        <button 
          className="btn btn-warning"
          onClick={simulateReminder}
        >
          Send Test Reminder
        </button>
      </div>

      <div className="demo-section">
        <h3>📋 Instructions</h3>
        <ol>
          <li>First, click "Request Permission" to allow browser notifications</li>
          <li>Customize the notification/reminder content above</li>
          <li>Click "Send Test Notification" or "Send Test Reminder" to test</li>
          <li>Check the notification bell icon in the navigation bar</li>
          <li>Browser notifications will appear if permission is granted</li>
        </ol>
        
        <div className="info-box">
          <h4>🔄 Real WebSocket Integration</h4>
          <p>
            In production, notifications and reminders will be received automatically 
            through WebSocket connections from the server:
          </p>
          <ul>
            <li><strong>Notifications:</strong> <code>/user/queue/notifications</code></li>
            <li><strong>Reminders:</strong> <code>/user/queue/reminders</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;
