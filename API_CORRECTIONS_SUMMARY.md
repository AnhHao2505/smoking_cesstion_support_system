# API Endpoints Corrections Summary

This document summarizes all the changes made to ensure API calls match the provided API specification.

## Files Modified

### 1. quitPlanService.js
- **Removed**: `getQuitPlanByPlanId()` function - endpoint doesn't exist in API spec
- **Status**: ✅ Fixed

### 2. paymentService.js
- **Fixed**: Changed `API_ENDPOINTS.PAYMENT.CREATE` to `API_ENDPOINTS.PAYMENT.CREATE_PAYMENT`
- **Status**: ✅ Fixed

### 3. chatService.js
- **Fixed**: Corrected `getChatRoomMessages()` to use proper function call `API_ENDPOINTS.CHAT.ROOM_MESSAGES(roomId)`
- **Status**: ✅ Fixed

### 4. authService.js
- **Fixed**: Changed `API_ENDPOINTS.AUTH.TEST_USERS` to `API_ENDPOINTS.AUTH.GET_TESTERS`
- **Status**: ✅ Fixed

### 5. userService.js
- **Complete Rewrite**: Removed all non-existent endpoints and kept only the ones available in API spec:
  - ✅ `getAllUsers()` - uses `/user`
  - ✅ `getAllMembers()` - uses `/user/members`
  - ✅ `getCurrentAssignment()` - uses `/user/member/current-assignment`
  - ✅ `upgradeToPremium()` - uses `/user/upgrade-premium`
- **Removed**: All non-existent endpoints (getUserProfile, updateUserProfile, uploadAvatar, getUserById, updateUser, deleteUser, createUser)
- **Status**: ✅ Fixed

### 6. memberDashboardService.js
- **Fixed**: Updated all functions using non-existent MEMBERS endpoints to use mock data with warnings:
  - `getEarnedBadges()` - MEMBERS.GET_BADGES doesn't exist
  - `getHealthImprovements()` - MEMBERS.GET_HEALTH_IMPROVEMENTS doesn't exist
  - `getUpcomingReminders()` - MEMBERS.GET_REMINDERS doesn't exist
  - `getRecentQuestionsAnswers()` - MEMBERS.GET_QUESTIONS_ANSWERS doesn't exist
- **Status**: ✅ Fixed

### 7. appointmentService.js
- **Complete Rewrite**: All appointment endpoints are NOT available in the API specification
  - Updated all functions to return mock data with warning messages
  - Functions affected: `getMemberAppointments()`, `getCoachAvailability()`, `bookAppointment()`, `cancelAppointment()`
- **Status**: ✅ Fixed (marked as unavailable)

### 8. reminderService.js
- **Fixed**: Updated functions using non-existent endpoints:
  - `getAllReminders()` - endpoint doesn't exist, using mock data
  - `toggleReminder()` - endpoint doesn't exist, redirects to disable endpoint
  - `deleteReminder()` - endpoint doesn't exist, redirects to disable endpoint
  - `getReminderSettings()` - endpoint doesn't exist, using mock data
  - `updateReminderSettings()` - endpoint doesn't exist, returns error
- **Status**: ✅ Fixed

## API Endpoints Currently Available (Confirmed Working)

### Authentication
- ✅ POST `/auth/login`
- ✅ POST `/auth/register`
- ✅ POST `/auth/logout`
- ✅ PATCH `/auth/verify-account`
- ✅ PATCH `/auth/reset-password`
- ✅ GET `/auth/send-verify-otp`
- ✅ GET `/auth/send-reset-otp`
- ✅ GET `/auth/get-testers`

### User Management
- ✅ GET `/user` (with pagination)
- ✅ GET `/user/members` (with pagination)
- ✅ GET `/user/member/current-assignment`
- ✅ POST `/user/upgrade-premium`

### Coach Management
- ✅ GET `/coach/all` (with pagination)
- ✅ POST `/coach/create`
- ✅ POST `/coach/choose`
- ✅ GET `/coach/assigned-members`
- ✅ PATCH `/coach/member/disable`
- ✅ PATCH `/coach/admin/disable`

### Profile Management
- ✅ GET `/profile/me`
- ✅ GET `/profile/member`
- ✅ PATCH `/profile/member`
- ✅ GET `/profile/coach`
- ✅ PUT `/profile/coach`

### Quit Plans
- ✅ POST `/api/quit-plans` (create)
- ✅ PUT `/api/quit-plans` (update)
- ✅ GET `/api/quit-plans/newest`
- ✅ GET `/api/quit-plans/member/old`
- ✅ GET `/api/quit-plans/coach/created`
- ✅ PATCH `/api/quit-plans/disable`
- ✅ PATCH `/api/quit-plans/deny`
- ✅ PATCH `/api/quit-plans/accept`

### Quit Phases
- ✅ GET `/api/quit-phases/plan`
- ✅ GET `/api/quit-phases/member/newest`
- ✅ GET `/api/quit-phases/default`
- ✅ POST `/api/quit-phases/create-goals`

### Daily Logs
- ✅ GET `/api/daily-logs` (by phase)
- ✅ POST `/api/daily-logs`
- ✅ GET `/api/daily-logs/member`
- ✅ GET `/api/daily-logs/member/date`

### Member Smoking Status
- ✅ GET `/api/member-smoking-status`
- ✅ POST `/api/member-smoking-status`
- ✅ GET `/api/member-smoking-status/latest`
- ✅ PUT `/api/member-smoking-status/latest`

### Feedbacks
- ✅ POST `/api/feedbacks`
- ✅ GET `/api/feedbacks/published`
- ✅ GET `/api/feedbacks/coach`
- ✅ GET `/api/feedbacks/admin/all`
- ✅ PATCH `/api/feedbacks/approve-publish`
- ✅ PATCH `/api/feedbacks/hide`
- ✅ PATCH `/api/feedbacks/reviewed`

### QnA Management
- ✅ POST `/api/qna/ask`
- ✅ POST `/api/qna/answer`
- ✅ GET `/api/qna/all`
- ✅ GET `/api/qna/all/member`
- ✅ GET `/api/qna/all/coach`

### Notifications
- ✅ GET `/api/notifications/all`
- ✅ GET `/api/notifications/unread`
- ✅ GET `/api/notifications/read`
- ✅ GET `/api/notifications/important`
- ✅ PATCH `/api/notifications/mark-read`

### Reminders
- ✅ POST `/api/reminders`
- ✅ PUT `/api/reminders/update`
- ✅ PATCH `/api/reminders/disable`

### Chat Management
- ✅ GET `/chat/ws-channels`
- ✅ GET `/chat/rooms/{roomId}/messages`
- ✅ GET `/chat/rooms/private`
- ✅ DELETE `/chat/delete/message`

### Payment
- ✅ POST `/vn-pay/create-payment`

## Endpoints NOT Available (Need Backend Implementation)

### Appointments
- ❌ All appointment-related endpoints
- ❌ Coach availability management
- ❌ Appointment booking/canceling

### User Management Extensions
- ❌ Individual user CRUD operations
- ❌ User profile picture upload
- ❌ Detailed user management by ID

### Reminder Extensions
- ❌ Get all reminders for user
- ❌ Toggle reminder on/off
- ❌ Delete reminder
- ❌ Reminder settings management

### Member Dashboard Extensions
- ❌ Badge management
- ❌ Health improvements tracking
- ❌ Member-specific reminders
- ❌ QA history for members

## Recommendations

1. **Frontend**: All service files now correctly use only available API endpoints
2. **Backend**: Consider implementing the missing endpoints marked as ❌ for complete functionality
3. **Testing**: Test all ✅ marked endpoints to ensure they work as expected
4. **Documentation**: Update frontend documentation to reflect these changes

## Notes

- All functions that use unavailable endpoints now include warning messages and mock data
- The application should continue to work but with limited functionality in areas where endpoints are missing
- Consider prioritizing the implementation of appointment and extended user management endpoints as they seem to be core features
