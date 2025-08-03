// src/services/agoraService.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiEndpoints';

class AgoraService {
  /**
   * Lấy token từ backend
   * @param {string} channelName - Tên channel
   * @param {number} userId - User ID (default = 0)
   * @param {number} appointmentId - Appointment ID (default = 0)  
   * @returns {Promise<AgoraTokenResponse>}
   */
  async getToken(channelName, userId = 0, appointmentId = 0) {
    try {
      const response = await axios.get(`${API_BASE_URL}get-video-token`, {
        params: {
          channelName,
          userId,
          appointmentId
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting Agora token:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get token',
        status: error.response?.status
      };
    }
  }
}

// Export singleton instance
const agoraService = new AgoraService();
export default agoraService;

// Export class nếu cần tạo multiple instances
export { AgoraService };