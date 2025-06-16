// Appointment Management Service

// Get member appointments
export const getMemberAppointments = (userId) => {
  return [
    {
      appointment_id: 1,
      coach_id: 1,
      coach_name: "Dr. Sarah Johnson",
      photo_url: "https://randomuser.me/api/portraits/women/45.jpg",
      date: "2025-06-18",
      start_time: "14:00",
      end_time: "15:00",
      type: "Video Call",
      status: "confirmed",
      notes: "Monthly progress review"
    },
    {
      appointment_id: 2,
      coach_id: 1,
      coach_name: "Dr. Sarah Johnson",
      photo_url: "https://randomuser.me/api/portraits/women/45.jpg",
      date: "2025-07-01",
      start_time: "10:00",
      end_time: "11:00",
      type: "In-person",
      status: "pending",
      notes: "Discuss next steps and challenges"
    },
    {
      appointment_id: 3,
      coach_id: 1,
      coach_name: "Dr. Sarah Johnson",
      photo_url: "https://randomuser.me/api/portraits/women/45.jpg",
      date: "2025-05-15",
      start_time: "11:00",
      end_time: "12:00",
      type: "Video Call",
      status: "completed",
      notes: "Initial consultation"
    }
  ];
};

// Get coach availability slots
export const getCoachAvailability = (coachId, startDate, endDate) => {
  return [
    {
      date: "2025-06-20",
      slots: [
        { start_time: "09:00", end_time: "10:00", is_available: true },
        { start_time: "10:00", end_time: "11:00", is_available: true },
        { start_time: "11:00", end_time: "12:00", is_available: false },
        { start_time: "14:00", end_time: "15:00", is_available: true },
        { start_time: "15:00", end_time: "16:00", is_available: true }
      ]
    },
    {
      date: "2025-06-21",
      slots: [
        { start_time: "09:00", end_time: "10:00", is_available: false },
        { start_time: "10:00", end_time: "11:00", is_available: true },
        { start_time: "11:00", end_time: "12:00", is_available: true },
        { start_time: "14:00", end_time: "15:00", is_available: false },
        { start_time: "15:00", end_time: "16:00", is_available: true }
      ]
    }
  ];
};

// Book a new appointment
export const bookAppointment = (appointmentData) => {
  console.log("Booking appointment with data:", appointmentData);
  
  // In a real app, this would call an API
  return {
    success: true,
    message: "Appointment booked successfully",
    appointment_id: Math.floor(Math.random() * 1000) + 10
  };
};

// Cancel an appointment
export const cancelAppointment = (appointmentId, reason) => {
  console.log("Cancelling appointment", appointmentId, "with reason:", reason);
  
  // In a real app, this would call an API
  return {
    success: true,
    message: "Appointment cancelled successfully"
  };
};