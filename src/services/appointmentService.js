import axiosInstance from '../utils/axiosConfig';
import { handleApiResponse, handleApiError } from '../utils/apiEndpoints';
/**
 * Tạo lịch làm việc cho coach (admin/coach)
 * POST /api/appointments/create/schedules
 */
export const createCoachSchedule = async (scheduleData) => {
  try {
    const response = await axiosInstance.post('/api/appointments/create/schedules', scheduleData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Đặt lịch hẹn theo scheduleId (member)
 * POST /api/appointments/book/{scheduleId}
 */
export const bookAppointmentBySchedule = async (scheduleId) => {
  try {
    const response = await axiosInstance.post(`/api/appointments/book/${scheduleId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Lấy danh sách coach có lịch hẹn (admin/member)
 * GET /api/appointments/view-all-coaches
 */
export const getCoachesWithAppointments = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/appointments/view-all-coaches', { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Lấy lịch trống của coach (member)
 * GET /api/appointments/schedules/available-of-coach/{coachId}
 */
export const getAvailableSchedulesOfCoach = async (coachId) => {
  try {
    const response = await axiosInstance.get(`/api/appointments/schedules/available-of-coach/${coachId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Lấy tất cả cuộc hẹn của member
 * GET /api/appointments/appointments-of-member
 */
export const getAppointmentsOfMember = async () => {
  try {
    const response = await axiosInstance.get('/api/appointments/appointments-of-member');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Lấy tất cả cuộc hẹn của coach
 * GET /api/appointments/appointments-of-coach
 */
export const getAppointmentsOfCoach = async () => {
  try {
    const response = await axiosInstance.get('/api/appointments/appointments-of-coach');
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Lấy chi tiết cuộc hẹn (admin/coach/member)
 * GET /api/appointments/{appointmentId}/details
 */
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await axiosInstance.get(`/api/appointments/${appointmentId}/details`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Thành viên gửi feedback cho cuộc hẹn
 * PATCH /api/appointments/{appointmentId}/feedback-by-member
 */
export const giveFeedbackForAppointment = async (appointmentId, feedbackData) => {
  try {
    const response = await axiosInstance.patch(`/api/appointments/${appointmentId}/feedback-by-member`, feedbackData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Coach hoàn thành cuộc hẹn
 * PATCH /api/appointments/{appointmentId}/complete-by-coach
 */
export const completeAppointmentByCoach = async (appointmentId) => {
  try {
    const response = await axiosInstance.patch(`/api/appointments/${appointmentId}/complete-by-coach`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Thành viên huỷ cuộc hẹn
 * PATCH /api/appointments/{appointmentId}/cancel-by-member
 */
export const cancelAppointmentByMember = async (appointmentId) => {
  try {
    const response = await axiosInstance.patch(`/api/appointments/${appointmentId}/cancel-by-member`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Coach huỷ cuộc hẹn (có lý do)
 * PATCH /api/appointments/{appointmentId}/cancel-by-coach
 */
export const cancelAppointmentByCoach = async (appointmentId, absenceReason) => {
  try {
    const response = await axiosInstance.patch(`/api/appointments/${appointmentId}/cancel-by-coach`, null, {
      params: { absenceReason }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};


// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getAvailableTimeSlots = async (date) => {
//   try {
//     const response = await axiosInstance.get('/api/appointments/available-slots', {
//       params: { date }
//     });
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getBookedAppointments = async (date) => {
//   try {
//     const response = await axiosInstance.get('/api/appointments/booked', {
//       params: { date }
//     });
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

/**
 * Book an appointment
 */
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await axiosInstance.post('/api/appointments/book', appointmentData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getAvailableSlotsForDate = async (date) => {
//   try {
//     const response = await axiosInstance.get('/api/appointments/available-slots-by-date', {
//       params: { date }
//     });
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getBookedSlotsForDate = async (date) => {
//   try {
//     const response = await axiosInstance.get('/api/appointments/booked-slots', {
//       params: { date }
//     });
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getMyAppointments = async () => {
//   try {
//     const response = await axiosInstance.get('/api/appointments/my-appointments');
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const cancelAppointment = async (appointmentId) => {
//   try {
//     const response = await axiosInstance.delete(`/api/appointments/${appointmentId}`);
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getCoachWorkingHours = async (coachId, date) => {
//   try {
//     const response = await axiosInstance.get('/api/appointments/coach-hours', {
//       params: { coachId, date }
//     });
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

/**
 * Generate time slots based on coach working hours
 */
export const generateTimeSlots = (workingHours, bookedSlots = []) => {
  const slots = [];
  
  workingHours.forEach(schedule => {
    const startTime = schedule.startTime;
    const endTime = schedule.endTime;
    
    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    // Generate 30-minute slots
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const endSlotHour = currentMinute + 30 >= 60 ? currentHour + 1 : currentHour;
      const endSlotMinute = (currentMinute + 30) % 60;
      const endTimeSlot = `${endSlotHour.toString().padStart(2, '0')}:${endSlotMinute.toString().padStart(2, '0')}`;
      
      // Check if slot is not booked
      const isBooked = bookedSlots.some(booked => booked.startTime === timeSlot);
      
      slots.push({
        startTime: timeSlot,
        endTime: endTimeSlot,
        coachId: schedule.coachId,
        coachName: schedule.coachName,
        isBooked: isBooked,
        displayTime: `${timeSlot} - ${endTimeSlot}`
      });
      
      // Move to next 30-minute slot
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
  });
  
  return slots;
};

/**
 * Group time slots by morning/afternoon
 */
export const groupSlotsByPeriod = (slots) => {
  const morningSlots = slots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour < 12;
  });
  
  const afternoonSlots = slots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 12;
  });
  
  return {
    morning: morningSlots,
    afternoon: afternoonSlots
  };
};

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getAllAppointments = async (params = {}) => {
//   try {
//     const response = await axiosInstance.get('/api/appointments/all', { params });
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getAppointmentDetail = async (appointmentId) => {
//   try {
//     const response = await axiosInstance.get(`/api/appointments/${appointmentId}`);
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const updateAppointment = async (appointmentId, updateData) => {
//   try {
//     const response = await axiosInstance.put(`/api/appointments/${appointmentId}`, updateData);
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const submitAppointmentFeedback = async (appointmentId, feedbackData) => {
//   try {
//     const response = await axiosInstance.post(`/api/appointments/${appointmentId}/feedback`, feedbackData);
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };

// API này không có trong danh sách swagger, vui lòng kiểm tra lại
// export const getAppointmentFeedback = async (appointmentId) => {
//   try {
//     const response = await axiosInstance.get(`/api/appointments/${appointmentId}/feedback`);
//     return handleApiResponse(response);
//   } catch (error) {
//     throw handleApiError(error);
//   }
// };
