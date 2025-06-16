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
    return <Navigate to="/" />;
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
              
              {/* Protected Routes */}
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
                    {/* <ProfilePage /> */}
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
              
              <Route path="/member/quit-progress" element={<QuitProgressOverview />} />
              
              <Route path="/member/create-quit-plan" element={<QuitPlanCreation />} />
              
              {/* Coach Routes */}
              <Route 
                path="/coach/dashboard" 
                element={
                    <CoachDashboard />
                  // <PrivateRoute allowedRoles={['coach']}>
                  // </PrivateRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <div className="container py-5">
                      <h1>Admin Dashboard</h1>
                      <p>Administration panel</p>
                    </div>
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