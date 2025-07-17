import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { getCurrentAuthToken } from '../utils/authUtils';
import { API_BASE_URL } from '../utils/apiEndpoints';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageCallbacks = new Map();
    this.connectionCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Send message to private chat
   * @param {string} roomId - The room ID to send message to
   * @param {object} messageData - The message data to send
   * @returns {Promise} Promise that resolves when message is confirmed by server
   */
  sendPrivateMessage(roomId, messageData) {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.stompClient) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const destination = `/app/chat/coach/${roomId}`;
      console.log('📤 Sending private message to:', destination, messageData);

      try {
        // Generate unique message ID for tracking
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const messageWithId = {
          ...messageData,
          messageId: messageId,
          tempId: messageData.tempId || messageId,
          timestamp: new Date().toISOString()
        };

        // // Set timeout for send confirmation
        // const timeout = setTimeout(() => {
        //   if (this.pendingMessages && this.pendingMessages.has(messageId)) {
        //     this.pendingMessages.delete(messageId);
        //     reject(new Error('Message send timeout - no confirmation received'));
        //   } 
        // }, 10000); // 10 seconds timeout

        // // Store the resolve/reject functions for this message
        // if (!this.pendingMessages) {
        //   this.pendingMessages = new Map();
        // }
        
        // this.pendingMessages.set(messageId, {
        //   resolve: (confirmedMessage) => {
        //     clearTimeout(timeout);
        //     console.log('✅ Message confirmed:', messageId);
        //     resolve(confirmedMessage || messageWithId);
        //   },
        //   reject: (error) => {
        //     clearTimeout(timeout);
        //     console.error('❌ Message failed:', messageId, error);
        //     reject(error);
        //   },
        //   timeout,
        //   originalMessage: messageWithId
        // });

        // Send message with receipt header for confirmation
        this.stompClient.publish({
          destination: destination,
          body: messageData.content,
        });


      } catch (error) {
        console.error('❌ Error publishing message:', error);
        reject(error);
      }
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const token = getCurrentAuthToken();
        console.log('🔑 Token found:', !!token);
        
        if (!token) {
          reject(new Error('No authentication token found'));
          return;
        }

        // Debug: Log API_BASE_URL
        console.log('🌐 API_BASE_URL:', API_BASE_URL);
        
        // Fix WebSocket URL construction - handle different API_BASE_URL formats
        let wsBaseUrl = API_BASE_URL;
        
        // Remove /api suffix if present
        if (wsBaseUrl.endsWith('/api')) {
          wsBaseUrl = wsBaseUrl.slice(0, -4);
        }
        
        // Remove trailing slash if present
        wsBaseUrl = wsBaseUrl.replace(/\/$/, '');
        
        // For production, keep HTTPS for WSS (secure WebSocket)
        // Only use HTTP for local development
        if (wsBaseUrl.includes('localhost') || wsBaseUrl.includes('127.0.0.1')) {
          wsBaseUrl = wsBaseUrl.replace('https://', 'http://');
        }
        
        const socketUrl = `${wsBaseUrl}/ws?token=${encodeURIComponent(token)}`;
        console.log('🔌 Connecting to WebSocket:', socketUrl);

        // Create SockJS connection
        const socket = new SockJS(socketUrl);
        this.stompClient = Stomp.over(socket);

        // Disable debug in production, enable in development
        if (process.env.NODE_ENV === 'development') {
          this.stompClient.debug = (str) => {
            console.log('📡 STOMP Debug:', str);
          };
        } else {
          this.stompClient.debug = () => {}; // Disable debug in production
        }

        // Configure STOMP client with better settings
        this.stompClient.configure({
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 10000, // 10 seconds
          heartbeatOutgoing: 10000, // 10 seconds
          // Add connection headers
          connectHeaders: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        // Set up connection handlers
        this.stompClient.onConnect = (frame) => {
          console.log('✅ WebSocket connected successfully:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          
          // Set up receipt handler for message confirmation
          this.stompClient.onStompError = this.stompClient.onStompError; // Keep existing error handler
          
          // Notify connection callbacks
          this.connectionCallbacks.forEach(callback => {
            try {
              callback(true);
            } catch (error) {
              console.error('❌ Error in connection callback:', error);
            }
          });

          resolve(frame);
        };

        // Handle receipts for message confirmation
        this.stompClient.onStompReceipt = (receipt) => {
          console.log('📨 Received receipt:', receipt);
          const receiptId = receipt.receiptId;
          
          if (this.pendingMessages && this.pendingMessages.has(receiptId)) {
            const pendingMessage = this.pendingMessages.get(receiptId);
            pendingMessage.resolve(pendingMessage.originalMessage);
            this.pendingMessages.delete(receiptId);
            console.log('✅ Message delivery confirmed via receipt:', receiptId);
          }
        };

        this.stompClient.onStompError = (frame) => {
          console.error('❌ STOMP Error:', frame);
          console.error('❌ Error details:', frame.headers);
          console.error('❌ Error body:', frame.body);
          this.connected = false;
          
          // Handle specific error types
          let errorMessage = 'WebSocket connection failed';
          if (frame.headers && frame.headers.message) {
            errorMessage = frame.headers.message;
          } else if (frame.body) {
            errorMessage = frame.body;
          }
          
          // Check for authentication errors
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            errorMessage = 'Authentication failed - please login again';
          }
          
          // Notify connection callbacks about failure
          this.connectionCallbacks.forEach(callback => {
            try {
              callback(false);
            } catch (error) {
              console.error('❌ Error in connection callback:', error);
            }
          });
          
          reject(new Error(errorMessage));
        };

        this.stompClient.onWebSocketError = (error) => {
          console.error('❌ WebSocket Error:', error);
          this.connected = false;
          
          // Notify connection callbacks
          this.connectionCallbacks.forEach(callback => {
            try {
              callback(false);
            } catch (error) {
              console.error('❌ Error in connection callback:', error);
            }
          });
          
          reject(error);
        };

        this.stompClient.onDisconnect = () => {
          console.log('🔌 WebSocket disconnected');
          this.connected = false;
          this.handleDisconnection();
        };

        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.connected) {
            console.error('❌ WebSocket connection timeout');
            this.stompClient?.deactivate();
            reject(new Error('Connection timeout - please check your network connection'));
          }
        }, 15000); // 15 seconds timeout for slower networks

        // Override onConnect to clear timeout
        const originalOnConnect = this.stompClient.onConnect;
        this.stompClient.onConnect = (frame) => {
          clearTimeout(connectionTimeout);
          originalOnConnect(frame);
        };

        // Activate the connection
        this.stompClient.activate();

      } catch (error) {
        console.error('❌ Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  handleDisconnection() {
    this.connected = false;
    
    // Notify connection callbacks
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(false);
      } catch (error) {
        console.error('❌ Error in disconnection callback:', error);
      }
    });

    // Attempt reconnection if within retry limit
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('❌ Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to private chat room
   * @param {string} roomId - The room ID to subscribe to
   * @param {function} messageCallback - Callback function for received messages
   */
  subscribeToPrivateChat(roomId, messageCallback) {
    if (!this.connected || !this.stompClient) {
      console.error('❌ Cannot subscribe: WebSocket not connected');
      return;
    }

    const destination = `/topic/chat/coach/${roomId}`;
    console.log('📨 Subscribing to private chat:', destination);

    try {
      const subscription = this.stompClient.subscribe(destination, (message) => {
        console.log('📩 Received message from private chat:', message);
        try {
          const parsedMessage = JSON.parse(message.body);
          
          // Check if this is a confirmation for a pending message
          if (parsedMessage.messageId && this.pendingMessages && this.pendingMessages.has(parsedMessage.messageId)) {
            console.log('✅ Received server confirmation for message:', parsedMessage.messageId);
            const pendingMessage = this.pendingMessages.get(parsedMessage.messageId);
            pendingMessage.resolve(parsedMessage);
            this.pendingMessages.delete(parsedMessage.messageId);
          }
          
          // Always call the message callback for UI updates
          messageCallback(parsedMessage);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      });

      this.subscriptions.set(destination, subscription);
      this.messageCallbacks.set(destination, messageCallback);
      
      console.log('✅ Successfully subscribed to private chat:', destination);
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to private chat:', error);
      throw error;
    }
  }

  /**
   * Subscribe to community chat room
   * @param {string} roomId - The room ID to subscribe to
   * @param {function} messageCallback - Callback function for received messages
   */
  subscribeToCommunityChat(roomId, messageCallback) {
    if (!this.connected || !this.stompClient) {
      console.error('❌ Cannot subscribe: WebSocket not connected');
      return;
    }

    const destination = `/topic/community/${roomId}`;
    console.log('📨 Subscribing to community chat:', destination);

    try {
      const subscription = this.stompClient.subscribe(destination, (message) => {
        console.log('📩 Received message from community chat:', message);
        try {
          const parsedMessage = JSON.parse(message.body);
          messageCallback(parsedMessage);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      });

      this.subscriptions.set(destination, subscription);
      this.messageCallbacks.set(destination, messageCallback);
      
      console.log('✅ Successfully subscribed to community chat:', destination);
    } catch (error) {
      console.error('❌ Error subscribing to community chat:', error);
    }
  }

  /**
   * Send message to community chat
   * @param {string} roomId - The room ID to send message to
   * @param {object} messageData - The message data to send
   */
  sendCommunityMessage(roomId, messageData) {
    if (!this.connected || !this.stompClient) {
      throw new Error('WebSocket not connected');
    }

    const destination = `/app/chat/community/${roomId}`;
    console.log('📤 Sending community message to:', destination, messageData);

    this.stompClient.publish({
      destination: destination,
      body: JSON.stringify(messageData)
    });
  }

  /**
   * Subscribe to user notifications
   * @param {function} notificationCallback - Callback function for received notifications
   */
  subscribeToNotifications(notificationCallback) {
    if (!this.connected || !this.stompClient) {
      console.error('❌ Cannot subscribe: WebSocket not connected');
      return;
    }

    const destination = '/user/queue/notifications';
    console.log('📨 Subscribing to notifications:', destination);

    try {
      const subscription = this.stompClient.subscribe(destination, (message) => {
        console.log('📩 Received notification:', message);
        try {
          const notification = JSON.parse(message.body);
          notificationCallback(notification);
        } catch (error) {
          console.error('❌ Error parsing notification:', error);
        }
      });

      this.subscriptions.set(destination, subscription);
      this.messageCallbacks.set(destination, notificationCallback);
      
      console.log('✅ Successfully subscribed to notifications:', destination);
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user reminders
   * @param {function} reminderCallback - Callback function for received reminders
   */
  subscribeToReminders(reminderCallback) {
    if (!this.connected || !this.stompClient) {
      console.error('❌ Cannot subscribe: WebSocket not connected');
      return;
    }

    const destination = '/user/queue/reminders';
    console.log('📨 Subscribing to reminders:', destination);

    try {
      const subscription = this.stompClient.subscribe(destination, (message) => {
        console.log('📩 Received reminder:', message);
        try {
          const reminder = JSON.parse(message.body);
          reminderCallback(reminder);
        } catch (error) {
          console.error('❌ Error parsing reminder:', error);
        }
      });

      this.subscriptions.set(destination, subscription);
      this.messageCallbacks.set(destination, reminderCallback);
      
      console.log('✅ Successfully subscribed to reminders:', destination);
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to reminders:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a destination
   * @param {string} destination - The destination to unsubscribe from
   */
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      this.messageCallbacks.delete(destination);
      console.log('✅ Unsubscribed from:', destination);
    }
  }

  /**
   * Unsubscribe from private chat room
   * @param {string} roomId - The room ID to unsubscribe from
   */
  unsubscribeFromPrivateChat(roomId) {
    const destination = `/topic/chat/coach/${roomId}`;
    this.unsubscribe(destination);
  }

  /**
   * Unsubscribe from community chat room
   * @param {string} roomId - The room ID to unsubscribe from
   */
  unsubscribeFromCommunityChat(roomId) {
    const destination = `/topic/community/${roomId}`;
    this.unsubscribe(destination);
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribeFromNotifications() {
    const destination = '/user/queue/notifications';
    this.unsubscribe(destination);
  }

  /**
   * Unsubscribe from reminders
   */
  unsubscribeFromReminders() {
    const destination = '/user/queue/reminders';
    this.unsubscribe(destination);
  }

  /**
   * Add connection status callback
   * @param {function} callback - Callback function (receives boolean connected status)
   */
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Remove connection status callback
   * @param {function} callback - Callback function to remove
   */
  removeConnectionCallback(callback) {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.stompClient) {
      console.log('🔌 Disconnecting WebSocket...');
      this.stompClient.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      this.messageCallbacks.clear();
    }
  }

  /**
   * Get all active subscriptions
   * @returns {Array} List of active subscription destinations
   */
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

// Export specific functions for easier usage
export const {
  connect,
  disconnect,
  subscribeToPrivateChat,
  subscribeToCommunityChat,
  sendPrivateMessage,
  sendCommunityMessage,
  unsubscribeFromPrivateChat,
  unsubscribeFromCommunityChat,
  onConnectionChange,
  removeConnectionCallback,
  isConnected,
  getActiveSubscriptions,
  subscribeToNotifications,
  subscribeToReminders,
  unsubscribeFromNotifications,
  unsubscribeFromReminders
} = webSocketService;
