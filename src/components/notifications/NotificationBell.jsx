import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';
import './NotificationBell.css';

const NotificationBell = () => {
  const { unreadCount, isConnected } = useNotification();
  const [showPanel, setShowPanel] = useState(false);

  const handleBellClick = () => {
    setShowPanel(!showPanel);
  };

  return (
    <div className="notification-bell-container">
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={handleBellClick}
        title="Notifications & Reminders"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M13.73 21a2 2 0 0 1-3.46 0" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
      </button>

      <NotificationPanel 
        isOpen={showPanel} 
        onClose={() => setShowPanel(false)} 
      />
    </div>
  );
};

export default NotificationBell;
