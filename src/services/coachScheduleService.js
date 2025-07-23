// Mock data for coach schedule management

// Get supported members overview
// Mock: Lấy danh sách thành viên đang được huấn luyện viên hỗ trợ
// Dữ liệu trả về là mảng các object, mỗi object là một thành viên mẫu
// Các trường gồm: user_id, full_name, photo_url, progress, current_phase, days_smoke_free, next_appointment
export const getSupportedMembers = (coachId) => {
  // return [
  //   {
  //     user_id: 101, // ID thành viên mẫu
  //     full_name: "Nguyễn Văn A", // Tên thành viên mẫu
  //     photo_url: "https://randomuser.me/api/portraits/men/22.jpg", // Ảnh đại diện mẫu
  //     progress: 35, // % tiến độ kế hoạch cai thuốc
  //     current_phase: "Preparation", // Giai đoạn hiện tại
  //     days_smoke_free: 14, // Số ngày không hút thuốc
  //     next_appointment: "2025-06-18" // Ngày hẹn tiếp theo
  //   },
  //   {
  //     user_id: 102,
  //     full_name: "Trần Thị B",
  //     photo_url: "https://randomuser.me/api/portraits/women/32.jpg",
  //     progress: 42,
  //     current_phase: "Action",
  //     days_smoke_free: 30,
  //     next_appointment: "2025-06-17"
  //   },
  //   {
  //     user_id: 103,
  //     full_name: "Lê Văn C",
  //     photo_url: "https://randomuser.me/api/portraits/men/43.jpg",
  //     progress: 75,
  //     current_phase: "Maintenance",
  //     days_smoke_free: 66,
  //     next_appointment: "2025-06-20"
  //   }
  // ];
};

// Get upcoming appointments
// Mock: Lấy danh sách lịch hẹn sắp tới của huấn luyện viên
// Dữ liệu trả về là mảng các object, mỗi object là một lịch hẹn mẫu
// Các trường gồm: appointment_id, member_id, member_name, photo_url, date, time, type, status, notes
export const getUpcomingAppointments = (coachId) => {
  // return [
  //   {
  //     appointment_id: 1, // ID lịch hẹn mẫu
  //     member_id: 102, // ID thành viên
  //     member_name: "Trần Thị B", // Tên thành viên
  //     photo_url: "https://randomuser.me/api/portraits/women/32.jpg", // Ảnh đại diện thành viên
  //     date: "2025-06-17", // Ngày hẹn
  //     time: "09:00 - 10:00", // Thời gian hẹn
  //     type: "Video Call", // Loại hình hẹn
  //     status: "confirmed", // Trạng thái xác nhận
  //     notes: "Weekly progress review" // Ghi chú
  //   },
  //   {
  //     appointment_id: 2,
  //     member_id: 101,
  //     member_name: "Nguyễn Văn A",
  //     photo_url: "https://randomuser.me/api/portraits/men/22.jpg",
  //     date: "2025-06-18",
  //     time: "14:00 - 15:00",
  //     type: "In-person",
  //     status: "confirmed",
  //     notes: "First meeting - creating quit plan"
  //   },
  //   {
  //     appointment_id: 3,
  //     member_id: 103,
  //     member_name: "Lê Văn C",
  //     photo_url: "https://randomuser.me/api/portraits/men/43.jpg",
  //     date: "2025-06-20",
  //     time: "11:00 - 12:00",
  //     type: "Video Call",
  //     status: "pending",
  //     notes: "Maintenance phase check-in"
  //   }
  // ];
};

// Get important notifications
export const getImportantNotifications = (coachId) => {
  // return [
  //   {
  //     notification_id: 1,
  //     content: "Nguyễn Văn A đã 3 ngày không cập nhật tiến trình",
  //     type: "warning",
  //     sent_at: "2025-06-15",
  //     is_read: false
  //   },
  //   {
  //     notification_id: 2,
  //     content: "Trần Thị B báo cáo mức độ thèm thuốc tăng cao",
  //     type: "alert",
  //     sent_at: "2025-06-15",
  //     is_read: false
  //   },
  //   {
  //     notification_id: 3,
  //     content: "Lịch hẹn mới với Hoàng Văn E vào ngày 22/06/2025",
  //     type: "info",
  //     sent_at: "2025-06-14",
  //     is_read: true
  //   }
  // ];
};

// Get available schedule slots
export const getAvailableScheduleSlots = (coachId) => {
  // return [
  //   {
  //     day_of_week: "Monday",
  //     slots: [
  //       { start_time: "08:00", end_time: "10:00", is_available: true },
  //       { start_time: "10:00", end_time: "12:00", is_available: true },
  //       { start_time: "13:00", end_time: "15:00", is_available: false },
  //       { start_time: "15:00", end_time: "17:00", is_available: true }
  //     ]
  //   },
  //   {
  //     day_of_week: "Tuesday",
  //     slots: [
  //       { start_time: "08:00", end_time: "10:00", is_available: true },
  //       { start_time: "10:00", end_time: "12:00", is_available: false },
  //       { start_time: "13:00", end_time: "15:00", is_available: true },
  //       { start_time: "15:00", end_time: "17:00", is_available: true }
  //     ]
  //   },
  //   {
  //     day_of_week: "Wednesday",
  //     slots: [
  //       { start_time: "08:00", end_time: "10:00", is_available: false },
  //       { start_time: "10:00", end_time: "12:00", is_available: true },
  //       { start_time: "13:00", end_time: "15:00", is_available: true },
  //       { start_time: "15:00", end_time: "17:00", is_available: false }
  //     ]
  //   },
  //   {
  //     day_of_week: "Thursday",
  //     slots: [
  //       { start_time: "08:00", end_time: "10:00", is_available: true },
  //       { start_time: "10:00", end_time: "12:00", is_available: true },
  //       { start_time: "13:00", end_time: "15:00", is_available: true },
  //       { start_time: "15:00", end_time: "17:00", is_available: true }
  //     ]
  //   },
  //   {
  //     day_of_week: "Friday",
  //     slots: [
  //       { start_time: "08:00", end_time: "10:00", is_available: true },
  //       { start_time: "10:00", end_time: "12:00", is_available: true },
  //       { start_time: "13:00", end_time: "15:00", is_available: false },
  //       { start_time: "15:00", end_time: "17:00", is_available: true }
  //     ]
  //   }
  // ];
};

// Update availability status
export const updateAvailabilityStatus = (
  coachId,
  dayOfWeek,
  slotIndex,
  isAvailable
) => {
  console.log(
    `Updating availability for coach ${coachId}, ${dayOfWeek}, slot ${slotIndex} to ${isAvailable}`
  );
  // In a real app, this would make an API call
  return {
    success: true,
    message: "Availability updated successfully",
  };
};

// Create new appointment
export const createAppointment = (appointmentData) => {
  console.log("Creating new appointment with data:", appointmentData);
  // In a real app, this would make an API call
  return {
    success: true,
    message: "Appointment created successfully",
    appointment_id: Math.floor(Math.random() * 1000) + 10,
  };
};
