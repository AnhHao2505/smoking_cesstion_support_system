import axiosInstance from "../utils/axiosConfig";

/**
 * Service để tích hợp với AppointmentController backend
 */
export const appointmentService = {
  /**
   * Lấy chi tiết appointment trước khi join video call
   * @param {number} appointmentId
   * @returns {Promise<Object>} Appointment details
   */
  async getAppointmentDetails(appointmentId) {
    try {
      console.log(`🔍 Getting appointment details for ID: ${appointmentId}`);
      const response = await axiosInstance.get(
        `/api/appointments/${appointmentId}/details`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting appointment details:", error);
      throw new Error(`Không thể lấy thông tin cuộc hẹn: ${error.message}`);
    }
  },

  /**
   * Đánh dấu appointment hoàn thành (chỉ coach)
   * @param {number} appointmentId
   * @returns {Promise<Object>} Success response
   */
  async completeAppointment(appointmentId) {
    try {
      console.log(`✅ Completing appointment ID: ${appointmentId}`);
      const response = await axiosInstance.patch(
        `/api/appointments/${appointmentId}/complete-by-coach`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error completing appointment:", error);
      throw new Error(`Không thể hoàn thành cuộc hẹn: ${error.message}`);
    }
  },

  /**
   * Member gửi feedback sau cuộc gọi video
   * @param {number} appointmentId
   * @param {Object} feedbackData - {rating: number, feedback: string}
   * @returns {Promise<Object>} Success response
   */
  async giveFeedback(appointmentId, feedbackData) {
    try {
      console.log(`📝 Giving feedback for appointment ID: ${appointmentId}`);
      console.log(`📊 Feedback data:`, feedbackData);

      // Validation trước khi gửi
      if (
        !feedbackData.rating ||
        feedbackData.rating < 1 ||
        feedbackData.rating > 5
      ) {
        throw new Error("Rating phải là số từ 1 đến 5");
      }

      const response = await axiosInstance.patch(
        `/api/appointments/${appointmentId}/feedback-by-member`,
        feedbackData
      );

      console.log(`✅ Feedback sent successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error giving feedback:", error);
      console.error("📊 Failed feedback data:", feedbackData);
      throw new Error(`Không thể gửi đánh giá: ${error.message}`);
    }
  },

  /**
   * Member hủy appointment
   * @param {number} appointmentId
   * @returns {Promise<Object>} Success response
   */
  async cancelByMember(appointmentId) {
    try {
      console.log(`❌ Member canceling appointment ID: ${appointmentId}`);
      const response = await axiosInstance.patch(
        `/api/appointments/${appointmentId}/cancel-by-member`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error canceling appointment by member:", error);
      throw new Error(`Không thể hủy cuộc hẹn: ${error.message}`);
    }
  },

  /**
   * Coach hủy appointment với lý do
   * @param {number} appointmentId
   * @param {string} absenceReason
   * @returns {Promise<Object>} Success response
   */
  async cancelByCoach(appointmentId, absenceReason) {
    try {
      console.log(`❌ Coach canceling appointment ID: ${appointmentId}`);
      const response = await axiosInstance.patch(
        `/api/appointments/${appointmentId}/cancel-by-coach?absenceReason=${encodeURIComponent(
          absenceReason
        )}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error canceling appointment by coach:", error);
      throw new Error(`Không thể hủy cuộc hẹn: ${error.message}`);
    }
  },

  /**
   * Lấy danh sách appointments của coach
   * @returns {Promise<Array>} List of appointments
   */
  async getAppointmentsByCoach() {
    try {
      console.log("📋 Getting appointments for coach");
      const response = await axiosInstance.get(
        "/api/appointments/appointments-of-coach"
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting coach appointments:", error);
      throw new Error(`Không thể lấy danh sách cuộc hẹn: ${error.message}`);
    }
  },

  /**
   * Lấy danh sách appointments của member
   * @returns {Promise<Array>} List of appointments
   */
  async getAppointmentsByMember() {
    try {
      console.log("📋 Getting appointments for member");
      const response = await axiosInstance.get(
        "/api/appointments/appointments-of-member"
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting member appointments:", error);
      throw new Error(`Không thể lấy danh sách cuộc hẹn: ${error.message}`);
    }
  },

  /**
   * Lấy danh sách coaches để book appointment
   * @param {number} pageNo
   * @param {number} pageSize
   * @returns {Promise<Object>} Paginated coach list
   */
  async getCoachesToBook(pageNo = 0, pageSize = 10) {
    try {
      console.log("👥 Getting coaches to book appointment");
      const response = await axiosInstance.get(
        `/api/appointments/view-all-coaches?pageNo=${pageNo}&pageSize=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting coaches:", error);
      throw new Error(`Không thể lấy danh sách chuyên viên: ${error.message}`);
    }
  },

  /**
   * Book một schedule thành appointment
   * @param {number} scheduleId
   * @returns {Promise<Object>} Success response
   */
  async bookSchedule(scheduleId) {
    try {
      console.log(`📅 Booking schedule ID: ${scheduleId}`);
      const response = await axiosInstance.post(
        `/api/appointments/book/${scheduleId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error booking schedule:", error);
      throw new Error(`Không thể đặt lịch hẹn: ${error.message}`);
    }
  },
};

export default appointmentService;
