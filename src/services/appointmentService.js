import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

// Get member appointments
export const getMemberAppointments = async (userId) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.APPOINTMENTS.GET_BY_MEMBER(userId));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching member appointments:', error);
    return handleApiError(error);
  }
};

// Get coach availability slots
export const getCoachAvailability = async (coachId, startDate, endDate) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.APPOINTMENTS.GET_AVAILABILITY(coachId),
      { params: { start_date: startDate, end_date: endDate } }
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching coach availability:', error);
    return handleApiError(error);
  }
};

// Book a new appointment
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.APPOINTMENTS.CREATE, appointmentData);
    const data = handleApiResponse(response);
    
    return {
      success: true,
      message: data.message || "Appointment booked successfully",
      appointment_id: data.appointment_id
    };
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw {
      success: false,
      message: error.message || "Failed to book appointment"
    };
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId, reason) => {
  try {
    const response = await axiosInstance.post(
      API_ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId),
      { reason }
    );
    const data = handleApiResponse(response);
    
    return {
      success: true,
      message: data.message || "Appointment cancelled successfully"
    };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw {
      success: false,
      message: error.message || "Failed to cancel appointment"
    };
  }
};