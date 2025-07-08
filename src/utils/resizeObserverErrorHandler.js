// ResizeObserver Error Handler Utility
// This utility helps suppress the common ResizeObserver loop error in React applications
import React from 'react';

// Debounce function to prevent rapid function calls
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function to limit function calls
export const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Suppress ResizeObserver errors
export const suppressResizeObserverErrors = () => {
  // Override console.error to filter out ResizeObserver errors
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('ResizeObserver loop completed with undelivered notifications') ||
       args[0].includes('ResizeObserver loop limit exceeded'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // Handle window error events
  const handleWindowError = (event) => {
    if (
      event.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      event.message === 'ResizeObserver loop limit exceeded'
    ) {
      event.stopImmediatePropagation();
      
      // Hide webpack dev server error overlay if present
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      const overlayDiv = document.getElementById('webpack-dev-server-client-overlay-div');
      
      if (overlay) {
        overlay.style.display = 'none';
      }
      if (overlayDiv) {
        overlayDiv.style.display = 'none';
      }
      
      return true; // Prevent default error handling
    }
    return false;
  };

  // Add error event listeners
  window.addEventListener('error', handleWindowError);
  
  // Handle unhandled promise rejections that might contain ResizeObserver errors
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason && 
      typeof event.reason.message === 'string' &&
      (event.reason.message.includes('ResizeObserver loop completed') ||
       event.reason.message.includes('ResizeObserver loop limit'))
    ) {
      event.preventDefault();
    }
  });

  // Return cleanup function
  return () => {
    console.error = originalError;
    window.removeEventListener('error', handleWindowError);
  };
};

// Initialize ResizeObserver error suppression when imported
let cleanup = null;

export const initResizeObserverErrorHandler = () => {
  if (!cleanup) {
    cleanup = suppressResizeObserverErrors();
  }
};

export const cleanupResizeObserverErrorHandler = () => {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
};

// Auto-initialize when module is imported
initResizeObserverErrorHandler();

// React Error Boundary HOC for ResizeObserver errors
export const withResizeObserverErrorBoundary = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      // Check if it's a ResizeObserver error
      if (
        error.message && 
        (error.message.includes('ResizeObserver') || 
         error.message.includes('loop completed'))
      ) {
        // Don't render error state for ResizeObserver errors
        return { hasError: false };
      }
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      // Log non-ResizeObserver errors
      if (
        !error.message || 
        (!error.message.includes('ResizeObserver') && 
         !error.message.includes('loop completed'))
      ) {
        console.error('Component Error:', error, errorInfo);
      }
    }

    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Có lỗi xảy ra</h3>
            <p>Vui lòng tải lại trang hoặc thử lại sau.</p>
            <button onClick={() => window.location.reload()}>
              Tải lại trang
            </button>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

export default {
  debounce,
  throttle,
  suppressResizeObserverErrors,
  initResizeObserverErrorHandler,
  cleanupResizeObserverErrorHandler,
  withResizeObserverErrorBoundary
};
