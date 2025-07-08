import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get WebSocket channels documentation - Updated to match new API
export const getWSChannelsDoc = async () => {
  try {
    const response = await axiosInstance.get('/chat/ws-channels');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all messages for a chat room - Updated to match new API
export const getChatRoomMessages = async (roomId) => {
  try {
    const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all private chat rooms for a user - Updated to match new API
export const getAllPrivateChatRooms = async () => {
  try {
    const response = await axiosInstance.get('/chat/rooms/private');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a chat message - Updated to match new API
export const deleteMessage = async (senderId, messageId) => {
  try {
    const response = await axiosInstance.delete('/chat/delete/message', {
      params: { senderId, messageId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};