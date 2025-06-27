import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError, buildUrlWithParams } from '../utils/apiEndpoints';

// Create a new service file for user management
export const getAllUsers = (params = {}) => {
  // In a real app, this would call an API with the filters
  // For now, we'll filter the mock data
  
  const mockUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', role: 'Member', status: 'Active', joined: '2025-06-10' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0901234568', role: 'Member', status: 'Active', joined: '2025-06-09' },
    { id: 3, name: 'Dr. James Wilson', email: 'james.wilson@example.com', phone: '0901234569', role: 'Coach', status: 'Active', joined: '2025-06-08' },
    { id: 4, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0901234570', role: 'Member', status: 'Inactive', joined: '2025-06-07' },
    { id: 5, name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0901234571', role: 'Member', status: 'Active', joined: '2025-06-05' },
    { id: 6, name: 'Admin User', email: 'admin@example.com', phone: '0901234572', role: 'Admin', status: 'Active', joined: '2025-01-01' },
    { id: 7, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@example.com', phone: '0901234573', role: 'Coach', status: 'Active', joined: '2025-05-10' },
    { id: 8, name: 'Dr. Michael Chen', email: 'michael.chen@example.com', phone: '0901234574', role: 'Coach', status: 'Active', joined: '2025-05-15' },
    { id: 9, name: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '0901234575', role: 'Member', status: 'Active', joined: '2025-06-01' },
    { id: 10, name: 'Trịnh Thị F', email: 'trinhthif@example.com', phone: '0901234576', role: 'Member', status: 'Inactive', joined: '2025-05-20' }
  ];
  
  let filteredUsers = [...mockUsers];
  
  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) || 
      user.email.toLowerCase().includes(searchLower) ||
      user.phone.includes(params.search)
    );
  }
  
  // Apply role filter
  if (params.role && params.role !== 'All') {
    filteredUsers = filteredUsers.filter(user => user.role === params.role);
  }
  
  // Apply status filter
  if (params.status && params.status !== 'All') {
    filteredUsers = filteredUsers.filter(user => user.status === params.status);
  }
  
  return {
    total: filteredUsers.length,
    data: filteredUsers
  };
};

export const createUser = (userData) => {
  console.log('Creating user with data:', userData);
  // In a real app, this would make an API call
  return {
    success: true,
    message: 'User created successfully',
    user: {
      id: Math.floor(Math.random() * 1000) + 11,
      ...userData,
      joined: new Date().toISOString().split('T')[0]
    }
  };
};

export const updateUser = (userId, userData) => {
  console.log(`Updating user ${userId} with data:`, userData);
  // In a real app, this would make an API call
  return {
    success: true,
    message: 'User updated successfully',
    user: {
      id: userId,
      ...userData
    }
  };
};

export const deleteUser = (userId) => {
  console.log(`Deleting user ${userId}`);
  // In a real app, this would make an API call
  return {
    success: true,
    message: 'User deleted successfully'
  };
};

export const getRoles = () => {
  return [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Coach' },
    { id: 3, name: 'Member' }
  ];
};