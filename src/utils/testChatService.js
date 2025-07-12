// Simple test file to verify chat service functions
import { 
  getAllPrivateChatRooms, 
  getChatRoomMessages, 
  sendMessage,
  createPrivateChatRoom,
  getWSChannelsDoc
} from '../services/chatService';

const testChatService = async () => {
  try {
    console.log('Testing chat service...');
    
    // Test WebSocket channels documentation
    const wsDoc = await getWSChannelsDoc();
    console.log('WebSocket channels doc:', wsDoc);
    
    // Test getting private chat rooms
    const chatRooms = await getAllPrivateChatRooms();
    console.log('Private chat rooms:', chatRooms);
    
    console.log('Chat service test completed');
  } catch (error) {
    console.error('Chat service test failed:', error);
  }
};

export default testChatService;
