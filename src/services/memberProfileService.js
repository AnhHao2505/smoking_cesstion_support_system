// Member Profile Service - provides member details

export const getMemberDetails = (userId) => {
  // In a real app, this would fetch from API based on userId
  return {
    user_id: 101,
    full_name: "Nguyễn Văn A",
    email_address: "nguyenvana@example.com",
    phone_number: "0901234567",
    photo_url: "https://randomuser.me/api/portraits/men/22.jpg",
    joined_date: "2025-03-15",
    membership_status: "Premium",
    membership: {
      membership_id: 201,
      start_date: "2025-03-15", 
      end_date: "2026-03-15",
      payment_method: "Credit Card",
      auto_renew: true
    },
    earned_badges: [
      {
        badge_id: 1,
        badge_name: "1-Week Milestone",
        badge_description: "Completed one week without smoking",
        earned_date: "2025-03-22"
      },
      {
        badge_id: 3,
        badge_name: "Health Improver",
        badge_description: "Significant health improvements detected",
        earned_date: "2025-04-10"
      }
    ]
  };
};

export const updateMemberProfile = (userId, profileData) => {
  console.log("Updating profile for user", userId, "with data:", profileData);
  
  // In a real app, this would call an API
  return {
    success: true,
    message: "Profile updated successfully"
  };
};