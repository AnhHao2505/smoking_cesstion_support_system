// Simple test file to verify WebSocket service functions
import webSocketService from '../services/websocketService';

const testWebSocketService = async () => {
  try {
    console.log('🚀 Testing WebSocket service...');
    
    // Test connection
    console.log('📡 Connecting to WebSocket...');
    await webSocketService.connect();
    console.log('✅ WebSocket connected successfully');
    
    // Test subscription
    console.log('📺 Testing subscription to private chat...');
    webSocketService.subscribeToPrivateChat('test-room-123', (message) => {
      console.log('📨 Received message:', message);
    });
    
    // Test sending message
    console.log('📤 Testing send message...');
    webSocketService.sendPrivateMessage('test-room-123', {
      content: 'Hello from test!',
      type: 'text',
      senderId: 'test-user',
      senderName: 'Test User',
      timestamp: new Date().toISOString()
    });
    
    // Test connection status
    console.log('🔍 Connection status:', webSocketService.isConnected());
    console.log('📋 Active subscriptions:', webSocketService.getActiveSubscriptions());
    
    console.log('✅ WebSocket service test completed');
    
    // Cleanup after 10 seconds
    setTimeout(() => {
      console.log('🧹 Cleaning up test...');
      webSocketService.unsubscribeFromPrivateChat('test-room-123');
      webSocketService.disconnect();
      console.log('✅ Test cleanup completed');
    }, 10000);
    
  } catch (error) {
    console.error('❌ WebSocket service test failed:', error);
  }
};

// Export for browser console testing
window.testWebSocketService = testWebSocketService;

console.log('🔧 WebSocket Test Script Loaded!');
console.log('💡 Run testWebSocketService() in console to test WebSocket connection');

export default testWebSocketService;
