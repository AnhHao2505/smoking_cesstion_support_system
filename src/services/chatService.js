import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get WebSocket channels documentation
export const getWSChannelsDoc = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.CHAT.WS_CHANNELS);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all messages for a chat room
export const getChatRoomMessages = async (roomId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.CHAT.ROOM_MESSAGES(roomId));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all private chat rooms for a user
export const getAllPrivateChatRooms = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.CHAT.PRIVATE_ROOMS, {
      params: { userId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a chat message
export const deleteMessage = async (messageId) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.CHAT.DELETE_MESSAGE, {
      params: { messageId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};