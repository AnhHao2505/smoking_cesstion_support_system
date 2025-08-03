import axiosInstance from "../utils/axiosConfig";
import { AGORA_API } from "../config/agoraConfig";

// Service để lấy token từ backend hoặc sử dụng temp token
const agoraTokenService = {
  // Sử dụng temp token mới từ user
  TEMP_TOKEN:
    "007eJxTYDjmlh80R2dBh/M6vUcLzArPJtqnf2oNUM8LMniqz871Z78Cg2laipFpaqKlZYqlhYmFkWWSpVmypVGakYmhpbmxaapJ09u+jIZARoaHRnUsjAwQCOJzMyQWFORn5pXkpuaVMDAAAOXrIYs=",

  // Cấu hình mặc định tương thích với backend
  DEFAULT_CONFIG: {
    appId: null, // Sẽ được lấy từ backend response
    channelName: "smoking_cessation_video_call",
    uid: null,
    role: 1, // Host role
  },

  /**
   * Lấy token cho video call từ backend API
   * @param {string} appointmentId - ID của cuộc hẹn (mặc định là 2)
   * @param {string} userId - ID của user
   * @returns {Promise<Object>} - Token data từ backend
   */
  async getVideoCallToken(appointmentId = "2", userId) {
    try {
      const finalAppointmentId = appointmentId || "2";
      const finalUserId = userId || `user_${Date.now()}`;
      const channelName = `appointment_${finalAppointmentId}`;

      console.log(
        `🚀 Lấy video call token cho appointment: ${finalAppointmentId}`
      );

      const response = await axiosInstance.get(
        AGORA_API.GET_VIDEO_TOKEN(finalAppointmentId, channelName, finalUserId)
      );

      if (response.data && response.data.data) {
        const tokenData = response.data.data;
        console.log(
          "✅ Lấy video call token thành công từ backend:",
          tokenData
        );

        return {
          appId: tokenData.app_id, // Mapping từ backend response
          channelName: tokenData.channelName,
          token: tokenData.token,
          uid: tokenData.uid.toString(), // Đảm bảo uid là string
          appointmentId: finalAppointmentId,
          expireTime: Date.now() + 3 * 60 * 60 * 1000, // 3 hours from now
        };
      } else {
        throw new Error("Invalid response format from backend");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy video call token từ backend:", error);

      // Fallback to temp token
      return this.getTempTokenConfig(
        `appointment_${finalAppointmentId || "2"}`,
        `user_${Date.now()}`
      );
    }
  },

  /**
   * Lấy token mặc định cho video call chung
   * @param {string} channelName - Tên channel (mặc định là "smoking_cessation_video_call")
   * @param {string} userId - ID của user
   * @returns {Promise<Object>} - Token data
   */
  async getDefaultVideoCallToken(channelName = null, userId = null) {
    try {
      const finalChannelName = channelName || this.DEFAULT_CONFIG.channelName;
      const finalUserId = userId || `user_${Date.now()}`;

      console.log("🔄 Đang lấy default token từ backend API...");

      const response = await axiosInstance.get(
        AGORA_API.GET_VIDEO_TOKEN("default", finalChannelName, finalUserId)
      );

      if (response.data && response.data.data) {
        const tokenData = response.data.data;
        console.log("✅ Lấy default token từ backend thành công:", tokenData);

        return {
          appId: tokenData.app_id, // Mapping từ backend response
          channelName: tokenData.channelName || finalChannelName,
          token: tokenData.token,
          uid: tokenData.uid.toString() || finalUserId,
          expireTime: Date.now() + 3 * 60 * 60 * 1000, // 3 hours from now
        };
      } else {
        throw new Error("Invalid response from backend");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy default token từ backend:", error);

      // Fallback to temp token
      return this.getTempTokenConfig(finalChannelName, finalUserId);
    }
  },

  /**
   * Lấy cấu hình token tạm thời (fallback)
   * @param {string} channelName - Tên channel
   * @param {string} userId - ID của user
   * @returns {Object} - Token config với temp token
   */
  getTempTokenConfig(channelName = null, userId = null) {
    const finalChannelName = channelName || this.DEFAULT_CONFIG.channelName;
    const finalUserId = userId || `user_${Date.now()}`;

    console.log("🔧 Sử dụng temp token cho video call");

    return {
      appId: "f2d8b0c9b86748f99c51d73be7f8e5a6", // Fallback appId khi backend offline
      channelName: finalChannelName,
      token: this.TEMP_TOKEN,
      uid: finalUserId,
      expireTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    };
  },

  /**
   * Kiểm tra token có hết hạn không
   * @param {number} expireTime - Thời gian hết hạn (timestamp)
   * @returns {boolean} - true nếu token đã hết hạn
   */
  isTokenExpired(expireTime) {
    if (!expireTime) return false;
    return Date.now() > expireTime;
  },

  /**
   * Làm mới token nếu cần thiết
   * @param {Object} currentTokenData - Token data hiện tại
   * @returns {Promise<Object>} - Token data mới hoặc hiện tại
   */
  async refreshTokenIfNeeded(currentTokenData) {
    if (!currentTokenData || this.isTokenExpired(currentTokenData.expireTime)) {
      console.log("🔄 Token đã hết hạn, đang làm mới...");
      return await this.getDefaultVideoCallToken(
        currentTokenData?.channelName,
        currentTokenData?.uid
      );
    }
    return currentTokenData;
  },
};

// Export các function để sử dụng trực tiếp
export const getVideoCallToken =
  agoraTokenService.getVideoCallToken.bind(agoraTokenService);
export const getDefaultVideoCallToken =
  agoraTokenService.getDefaultVideoCallToken.bind(agoraTokenService);
export const getTempTokenConfig =
  agoraTokenService.getTempTokenConfig.bind(agoraTokenService);
export const isTokenExpired =
  agoraTokenService.isTokenExpired.bind(agoraTokenService);
export const refreshTokenIfNeeded =
  agoraTokenService.refreshTokenIfNeeded.bind(agoraTokenService);

export default agoraTokenService;
