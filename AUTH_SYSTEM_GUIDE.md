# Authentication System Documentation

## Overview
This document explains how the authentication system works in the smoking cessation support system frontend.

## Key Components

### 1. Axios Configuration (`src/utils/axiosConfig.js`)
- Automatically adds Bearer token to all API requests (except public endpoints)
- Handles token validation and cleanup
- Manages authentication errors (401, 403)

### 2. Auth Service (`src/services/authService.js`)
- Handles login, register, logout operations
- Manages token storage and retrieval
- Provides user authentication status checking

### 3. Auth Utils (`src/utils/authUtils.js`)
- Provides utility functions for authentication management
- Token validation and user role checking
- Helper functions for auth state management

## Public Endpoints (No Token Required)
The following endpoints do NOT require authentication tokens:
- `/auth/login`
- `/auth/register`
- `/auth/send-verify-otp`
- `/auth/send-reset-otp`
- `/auth/verify-account`
- `/auth/reset-password`
- `/auth/get-testers`
- `/blog/*`
- `/public/*`
- `/api/feedbacks/published`

## Protected Endpoints (Token Required)
All other API endpoints require a valid Bearer token in the Authorization header.

## How Token Authentication Works

### 1. Login Process
```javascript
import { login } from '../services/authService';

const handleLogin = async (email, password) => {
  try {
    const result = await login(email, password);
    if (result.success) {
      // Token and user data are automatically stored in localStorage
      // Future API calls will include the token automatically
    }
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### 2. Automatic Token Inclusion
```javascript
import axiosInstance from '../utils/axiosConfig';

// This request will automatically include the Bearer token
const response = await axiosInstance.get('/api/member/profile');
```

### 3. Token Validation
```javascript
import { checkAuthStatus } from '../utils/authUtils';

const authStatus = checkAuthStatus();
if (authStatus.isAuthenticated) {
  // User is authenticated and token is valid
  console.log('Current user:', authStatus.user);
} else {
  // User is not authenticated or token is invalid
  console.log('Auth issue:', authStatus.reason);
}
```

### 4. Role-based Access
```javascript
import { hasRole, USER_ROLES } from '../utils/authUtils';

if (hasRole(USER_ROLES.ADMIN)) {
  // User is admin
} else if (hasRole(USER_ROLES.COACH)) {
  // User is coach
} else if (hasRole(USER_ROLES.MEMBER)) {
  // User is member
}
```

### 5. Premium Membership Check
```javascript
import { isPremiumMember } from '../utils/authUtils';

if (isPremiumMember()) {
  // User has premium membership
}
```

## Error Handling

### 401 Unauthorized
When a request returns 401 (Unauthorized):
- Token and user data are automatically cleared from localStorage
- User needs to login again

### 403 Forbidden
When a request returns 403 (Forbidden):
- User is authenticated but doesn't have permission for the resource
- Token remains valid

## Best Practices

### 1. Always Use axiosInstance
```javascript
// ✅ Good
import axiosInstance from '../utils/axiosConfig';
const response = await axiosInstance.get('/api/data');

// ❌ Bad
import axios from 'axios';
const response = await axios.get('https://api.example.com/data');
```

### 2. Check Authentication Status
```javascript
// ✅ Good - Check auth status before accessing protected features
import { checkAuthStatus } from '../utils/authUtils';

const authStatus = checkAuthStatus();
if (!authStatus.isAuthenticated) {
  // Redirect to login or show login prompt
  return;
}

// ✅ Good - Use utility functions instead of direct localStorage access
import { getCurrentUserId } from '../utils/authUtils';
const userId = getCurrentUserId();

// ❌ Bad - Direct localStorage access
const token = localStorage.getItem('authToken');
```

### 3. Handle Logout Properly
```javascript
// ✅ Good
import { logout } from '../services/authService';

const handleLogout = async () => {
  try {
    await logout(); // This clears localStorage and calls logout API
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

## Service File Requirements

All service files that make API calls must:
1. Import `axiosInstance` from `../utils/axiosConfig`
2. Use `axiosInstance` instead of raw axios
3. Not manually add Authorization headers (handled automatically)

Example:
```javascript
import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS, handleApiResponse, handleApiError } from '../utils/apiEndpoints';

export const getMemberProfile = async (memberId) => {
  try {
    // Token is automatically added to this request
    const response = await axiosInstance.get(API_ENDPOINTS.PROFILE.MEMBER, {
      params: { memberId }
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
```

## Debugging Token Issues

1. Check browser console for authentication logs
2. Verify token exists in localStorage: `localStorage.getItem('authToken')`
3. Check if endpoint is in public endpoints list
4. Verify token format (should be JWT with 3 parts separated by dots)

## Security Notes

1. Tokens are stored in localStorage (consider using httpOnly cookies for production)
2. Tokens are automatically cleared on 401 errors
3. All authenticated requests use Bearer token format
4. Public endpoints are clearly defined and don't receive tokens
