import axiosInstance from "../utils/axiosConfig";

/**
 * Gọi backend lấy Agora token qua GET.
 * @param {string} channelName
 * @param {number|string} userId
 * @param {number} appointmentId
 * @returns {Promise<{ app_id: string, channelName: string, token: string, uid: number }>}
 */
export const getDefaultVideoCallToken = async (
  channelName,
  userId,
  appointmentId
) => {
  console.log("🔄 Lấy token từ /get-video-token");

  try {
    const response = await axiosInstance.get("/api/agora/get-video-token", {
      params: {
        channelName,
        uid: userId,
        appointmentId,
      },
    });

    return response.data; // { app_id, channelName, token, uid }
  } catch (error) {
    console.error("❌ Lỗi lấy token:", error.message);

    // Fallback token cho dev
    return {
      app_id: "TEMP_APP_ID",
      channelName,
      token: "TEMP_TOKEN",
      uid: userId,
    };
  }
};
