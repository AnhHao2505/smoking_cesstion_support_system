# WebSocket Chat Implementation Guide

## Overview
Đã tích hợp WebSocket service vào ChatPage để hỗ trợ real-time messaging theo WebSocket hub URLs được cung cấp.

## Files Updated/Created

### 1. **Created Files:**
- `src/services/websocketService.js` - WebSocket service chính
- `src/utils/testWebSocketService.js` - Test utilities cho WebSocket

### 2. **Updated Files:**
- `src/components/member/ChatPage.jsx` - Tích hợp WebSocket vào chat page

## WebSocket Channels Implementation

### Private Chat Channels:
- **Send to Private Chat:** `/app/chat/coach/{roomId}`
- **Subscribe to Private Chat:** `/topic/chat/coach/{roomId}`

### Community Chat Channels:
- **Send to Community Chat:** `/app/chat/community/{roomId}`
- **Subscribe to Community Chat:** `/topic/community/{roomId}`

### Authentication:
- JWT token được truyền qua query parameter: `?token=YOUR_JWT`
- Tự động lấy token từ `getCurrentAuthToken()` utility

## Features Implemented

### 1. **WebSocket Connection Management**
- Auto-connect khi component mount
- Reconnection logic với exponential backoff
- Connection status monitoring
- Graceful disconnection khi component unmount

### 2. **Real-time Messaging**
- Subscribe to private chat rooms automatically khi chọn coach
- Send messages qua WebSocket
- Receive messages real-time
- Duplicate message prevention

### 3. **UI Enhancements**
- Connection status indicator trong sidebar
- Online/offline status cho coaches
- Reconnect button khi connection fails
- Disable send button khi WebSocket disconnected

### 4. **Error Handling**
- WebSocket connection errors
- Message sending failures
- Subscription errors
- Automatic reconnection attempts

## API Integration

### Available Chat APIs (từ chatService.js):
```javascript
// Get WebSocket channels documentation
getWSChannelsDoc()

// Get messages for a chat room
getChatRoomMessages(roomId)

// Get user's private chat rooms
getAllPrivateChatRooms()

// Delete a message
deleteMessage(senderId, messageId)
```

### WebSocket Service Usage:
```javascript
import webSocketService from '../services/websocketService';

// Connect to WebSocket
await webSocketService.connect();

// Subscribe to private chat
webSocketService.subscribeToPrivateChat(roomId, (message) => {
  console.log('Received:', message);
});

// Send message
webSocketService.sendPrivateMessage(roomId, messageData);

// Check connection status
const isConnected = webSocketService.isConnected();

// Disconnect
webSocketService.disconnect();
```

## Message Format

### Sent Messages:
```javascript
{
  content: "Message content",
  type: "text",
  senderId: "user-id",
  senderName: "User Name",
  receiverId: "coach-id", 
  receiverName: "Coach Name",
  timestamp: "2025-07-12T10:30:00.000Z"
}
```

### Received Messages:
```javascript
{
  id: "message-id",
  content: "Message content",
  senderId: "sender-id",
  senderName: "Sender Name",
  receiverId: "receiver-id",
  receiverName: "Receiver Name",
  timestamp: "2025-07-12T10:30:00.000Z",
  type: "text"
}
```

## Testing

### Manual Testing:
1. Mở ChatPage trong browser
2. Kiểm tra connection status trong sidebar
3. Chọn một coach
4. Gửi tin nhắn và kiểm tra real-time updates
5. Test reconnection bằng cách refresh page

### Console Testing:
```javascript
// Test WebSocket service
import testWebSocketService from './src/utils/testWebSocketService.js';
testWebSocketService();

// Or use window function
testWebSocketService();
```

## Connection Status States

- **connecting**: Đang kết nối WebSocket
- **connected**: Kết nối thành công
- **disconnected**: Chưa kết nối hoặc bị ngắt
- **failed**: Kết nối thất bại

## Next Steps / Future Enhancements

### 1. **Room Management**
- API để tạo private chat rooms
- Room participant management
- Room metadata handling

### 2. **Message Features**
- Message status (sent, delivered, read)
- Typing indicators
- File/image sharing
- Message reactions/emoji

### 3. **Notifications**
- Push notifications cho new messages
- Sound notifications
- Unread message counters

### 4. **Performance**
- Message pagination
- Virtual scrolling for large message lists
- Message caching strategy

### 5. **Security**
- Message encryption
- User blocking/reporting
- Admin moderation tools

## Troubleshooting

### Common Issues:

1. **WebSocket connection fails**
   - Check JWT token validity
   - Verify server WebSocket endpoint
   - Check network connectivity

2. **Messages not sending**
   - Ensure WebSocket is connected
   - Check message format
   - Verify room subscription

3. **Duplicate messages**
   - Message deduplication is implemented
   - Check message ID uniqueness

4. **Reconnection issues**
   - Manual reconnect button available
   - Check server availability
   - Verify token expiration

## Dependencies

### Required packages:
```json
{
  "sockjs-client": "^1.6.1",
  "@stomp/stompjs": "^7.0.0"
}
```

### Installation:
```bash
npm install sockjs-client @stomp/stompjs
```

---

**✅ Status:** Implemented and ready for testing
**🔗 Dependencies:** WebSocket server with STOMP protocol
**🎯 Next Steps:** Add room creation API and enhanced message features
