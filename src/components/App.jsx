import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import * as authService from '../services/authService';

// Layout components
import Navbar from './layout/Navbar';

// Public pages
import LandingPage from './public/LandingPage';
import AboutPage from './public/AboutPage';

// Auth pages
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';

// Dashboard pages
import Dashboard from './dashboard/Dashboard';
import CoachDashboard from './coach/CoachDashboard';
import MemberDashboard from './member/MemberDashboard';

// Member components
import QuitProgressOverview from './member/QuitProgressOverview';
import QuitPlanCreation from './member/QuitPlanCreation';
import CoachScheduleManagement from './coach/CoachScheduleManagement';
import MemberProfile from './member/MemberProfile';
import QuitPlanDetail from './member/QuitPlanDetail';
import DailyRecordForm from './member/DailyRecordForm';
import AppointmentManagement from './member/AppointmentManagement';

// Import blog pages
import BlogListPage from '../pages/blog/BlogListPage';
import BlogDetailPage from '../pages/blog/BlogDetailPage';

// Admin components
import AdminDashboard from './admin/AdminDashboard';

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

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={
                <div className="container py-5 text-center">
                  <h1>Unauthorized Access</h1>
                  <p>You don't have permission to access this page.</p>
                </div>
              } />
              
              {/* Blog Routes - Public but with different interactions based on auth */}
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/featured" element={<BlogListPage featuredOnly={true} />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              <Route path="/blog/category/:categoryId" element={<BlogListPage />} />
              <Route path="/blog/author/:authorId" element={<BlogListPage />} />
              
              {/* Authenticated Routes - Any authenticated user */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <MemberProfile />
                  </PrivateRoute>
                } 
              />
              
              {/* Member Routes */}
              <Route 
                path="/member/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['member']}>
                    <MemberDashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/member/quit-progress" 
                element={
                  <PrivateRoute allowedRoles={['member']}>
                    <QuitProgressOverview />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/create-quit-plan" 
                element={
                  <PrivateRoute allowedRoles={['member']}>
                    <QuitPlanCreation />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/quit-plan" 
                element={
                  <PrivateRoute allowedRoles={['member']}>
                    <QuitPlanDetail />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/daily-record" 
                element={
                  <PrivateRoute allowedRoles={['member']}>
                    <DailyRecordForm userId={101} />
                  </PrivateRoute>
                }
              />
              
              <Route 
                path="/member/appointments" 
                element={
                  <PrivateRoute allowedRoles={['member']}>
                    <AppointmentManagement />
                  </PrivateRoute>
                }
              />
              
              {/* Coach Routes */}
              <Route 
                path="/coach/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['coach']}>
                    <CoachDashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/coach/schedule" 
                element={
                  <PrivateRoute allowedRoles={['coach']}>
                    <CoachScheduleManagement />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/coach/appointments" 
                element={
                  <PrivateRoute allowedRoles={['coach']}>
                    <AppointmentManagement />
                  </PrivateRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;