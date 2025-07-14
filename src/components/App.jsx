import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import * as authService from '../services/authService';

// Layout components
import Navbar from './layout/Navbar';
// import Footer from './common/Footer'; // Commented out as Footer component doesn't exist

// Public pages
// import HomePage from '../pages/HomePage'; // Commented out as HomePage doesn't exist

// Auth pages
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import ResetPasswordOtpPage from './auth/ResetPasswordOtpPage';
import ResetPasswordPage from './auth/ResetPasswordPage';

// Dashboard pages
import MemberDashboard from './member/MemberDashboard';
import CoachDashboard from './coach/CoachDashboard';

// Member components
import MemberProfile from './member/MemberProfile';
import QuitPlanDetail from './member/QuitPlanDetail';
import QuitPlanCreation from './coach/QuitPlanCreation';
import QuitPlanEdit from './member/QuitPlanEdit';
import MemberQuitPlanFlow from './member/MemberQuitPlanFlow';
import DailyRecordForm from './member/DailyRecordForm';
import AppointmentManagement from './member/AppointmentManagement';
import CoachSelection from './member/CoachSelection';
import QuitPlanHistory from './member/QuitPlanHistory';
import PhaseDetail from './member/PhaseDetail';
import PhaseProgress from './member/PhaseProgress';
import PhaseTaskManager from './member/PhaseTaskManager';
import ChatPage from './member/ChatPage';

// Reminder components
import ReminderSettings from './member/ReminderSettings';
import ReminderList from './member/ReminderList';
import ReminderCreation from './member/ReminderCreation';
import ReminderCalendar from './member/ReminderCalendar';

// Daily Tracking Flow components - ADD THESE IMPORTS
import DailyCheckIn from './member/DailyCheckin';
import SmokingStatusTracker from './member/SmokingStatusTracker';
import ProgressChart from './member/ProgressChart';
import CravingLogger from './member/CravingLogger';

// Import blog pages
import BlogListPage from '../pages/blog/BlogListPage';
import BlogDetailPage from '../pages/blog/BlogDetailPage';

// Coach components  
import QuitPlanApproval from './coach/QuitPlanApproval';
import QuitPlanApprovalNewFlow from './coach/QuitPlanApprovalNewFlow';
import CoachScheduleManagement from './coach/CoachScheduleManagement';
import CoachQnA from './coach/CoachQnA';

// Admin components
import AdminDashboard from './admin/AdminDashboard';
import CoachManagement from './admin/CoachManagement';
import CoachList from './admin/CoachList';
import CoachAssignment from './admin/CoachAssignment';
import CoachPerformance from './admin/CoachPerformance';
import TransactionHistory from './admin/TransactionHistory';

// Import new components
import PremiumUpgrade from './member/PremiumUpgrade';
import UserSettings from './member/UserSettings';
import AccountManagement from './member/AccountManagement';
import MembershipStatus from './member/MembershipStatus';

// Import QnA pages
import { QAForumPage, AskQuestionPage, QuestionListPage, AnswerQuestionPage } from '../pages/qna';

import LandingPage from './public/LandingPage';
import WelcomePage from './public/WelcomePage';

// Import demo components
import NotificationDemo from './demo/NotificationDemo';

// Import payment components
import PaymentCallback from './payment/PaymentCallback';

// Auth protection component
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If roles are specified, check if the user has the required role
  if (allowedRoles.length > 0 && (!currentUser || !allowedRoles.includes(currentUser.role))) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Load VNPay test helpers in development
if (process.env.NODE_ENV === 'development') {
  import('../utils/vnpayTestHelper');
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              
              {/* Demo Routes */}
              <Route 
                path="/demo/notifications" 
                element={
                  <PrivateRoute>
                    <NotificationDemo />
                  </PrivateRoute>
                }
              />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password-otp" element={<ResetPasswordOtpPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Payment Routes */}
              <Route 
                path="/vn-pay/callback" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <PaymentCallback />
                  </PrivateRoute>
                }
              />
              
              {/* Member Routes */}
              <Route 
                path="/member/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <MemberDashboard />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <MemberProfile />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/quit-plan/:planId" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH']}>
                    <QuitPlanDetail />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/member/quit-plan" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <QuitPlanDetail />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/member/quit-plan-flow" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <MemberQuitPlanFlow />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/coach/create-quit-plan" 
                element={
                  <PrivateRoute allowedRoles={['COACH']}>
                    <QuitPlanCreation />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/member/quit-plan-edit/:planId" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH']}>
                    <QuitPlanEdit />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/daily-record" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <DailyRecordForm />
                  </PrivateRoute>
                }
              />

              {/* Daily Tracking Flow Routes - ADD THESE */}
              <Route 
                path="/member/daily-checkin" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <DailyCheckIn />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/smoking-status" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <SmokingStatusTracker />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/progress-chart" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <ProgressChart />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/craving-logger" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <CravingLogger />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/appointments" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <AppointmentManagement />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/coach-selection" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <CoachSelection />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/chat" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH']}>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/quit-plan-history" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <QuitPlanHistory />
                  </PrivateRoute>
                }
              />
              
              {/* Phase Management Routes */}
              <Route 
                path="/member/phase/:phaseId/:planId" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH']}>
                    <PhaseDetail />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/phase-progress/:planId" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH']}>
                    <PhaseProgress />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/phase-tasks/:phaseId/:planId" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH']}>
                    <PhaseTaskManager />
                  </PrivateRoute>
                }
              />

              {/* Reminder Routes */}
              <Route 
                path="/member/reminders" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <ReminderList />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/reminders/create" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <ReminderCreation />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/reminders/settings" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <ReminderSettings />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/reminders/calendar" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <ReminderCalendar />
                  </PrivateRoute>
                }
              />
              
              {/* Transaction History Route */}
              <Route 
                path="/member/transactions" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <TransactionHistory />
                  </PrivateRoute>
                }
              />
              
              {/* Coach Routes */}
              <Route 
                path="/coach/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['COACH', 'ADMIN']}>
                    <CoachDashboard />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/coach/quit-plan-approval" 
                element={
                  <PrivateRoute allowedRoles={['COACH']}>
                    <QuitPlanApproval />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/coach/member-management" 
                element={
                  <PrivateRoute allowedRoles={['COACH']}>
                    <QuitPlanApprovalNewFlow />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/coach/schedule" 
                element={
                  <PrivateRoute allowedRoles={['COACH']}>
                    <CoachScheduleManagement />
                  </PrivateRoute>
                }
              />

              <Route 
                path="/coach/qna" 
                element={
                  <PrivateRoute allowedRoles={['COACH']}>
                    <CoachQnA />
                  </PrivateRoute>
                }
              />

              {/* Q&A Forum Routes */}
              <Route 
                path="/qna" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH', 'ADMIN']}>
                    <QAForumPage />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/ask-question" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER']}>
                    <AskQuestionPage />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/questions" 
                element={
                  <PrivateRoute allowedRoles={['MEMBER', 'COACH', 'ADMIN']}>
                    <QuestionListPage />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/answer-question/:questionId" 
                element={
                  <PrivateRoute allowedRoles={['COACH', 'ADMIN']}>
                    <AnswerQuestionPage />
                  </PrivateRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/admin/coaches" 
                element={
                  <PrivateRoute allowedRoles={['ADMIN']}>
                    <CoachManagement />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/admin/coaches/list" 
                element={
                  <PrivateRoute allowedRoles={['ADMIN']}>
                    <CoachList />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/admin/coaches/assignment" 
                element={
                  <PrivateRoute allowedRoles={['ADMIN']}>
                    <CoachAssignment />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/admin/coaches/performance" 
                element={
                  <PrivateRoute allowedRoles={['ADMIN']}>
                    <CoachPerformance />
                  </PrivateRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          {/* <Footer /> */}
        </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;