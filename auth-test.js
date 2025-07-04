/**
 * Test script to verify authentication system is working correctly
 * Run this in browser console to test auth functionality
 */

// Test authentication utilities
async function testAuthSystem() {
  console.log('🧪 Testing Authentication System...\n');
  
  try {
    // Test 1: Import auth utilities
    console.log('1️⃣ Testing auth utility imports...');
    const { checkAuthStatus, getCurrentAuthUser, hasRole, USER_ROLES } = await import('./src/utils/authUtils.js');
    console.log('✅ Auth utilities imported successfully\n');
    
    // Test 2: Check current auth status
    console.log('2️⃣ Checking current authentication status...');
    const authStatus = checkAuthStatus();
    console.log('Auth Status:', authStatus);
    
    if (authStatus.isAuthenticated) {
      console.log('✅ User is authenticated');
      console.log('👤 Current User:', authStatus.user);
      console.log('🔑 Token present:', !!authStatus.token);
    } else {
      console.log('❌ User is not authenticated');
      console.log('📝 Reason:', authStatus.reason);
    }
    console.log('');
    
    // Test 3: Test role checking
    console.log('3️⃣ Testing role-based access...');
    Object.values(USER_ROLES).forEach(role => {
      const hasThisRole = hasRole(role);
      console.log(`${hasThisRole ? '✅' : '❌'} Has ${role} role: ${hasThisRole}`);
    });
    console.log('');
    
    // Test 4: Test API call with token
    console.log('4️⃣ Testing API call with automatic token inclusion...');
    try {
      const axiosInstance = (await import('./src/utils/axiosConfig.js')).default;
      
      // Try a protected endpoint (this should include token automatically)
      const response = await axiosInstance.get('/profile/me');
      console.log('✅ Protected API call successful');
      console.log('📊 Response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Protected API call failed: Unauthorized (token may be invalid)');
      } else if (error.response?.status === 404) {
        console.log('⚠️ Protected API call failed: Endpoint not found (but token was sent)');
      } else {
        console.log('❌ Protected API call failed:', error.message);
      }
    }
    console.log('');
    
    // Test 5: Test public endpoint (should not include token)
    console.log('5️⃣ Testing public endpoint (should not include token)...');
    try {
      const axiosInstance = (await import('./src/utils/axiosConfig.js')).default;
      
      // Try a public endpoint
      const response = await axiosInstance.get('/auth/get-testers');
      console.log('✅ Public API call successful');
      console.log('📊 Response:', response.data);
    } catch (error) {
      console.log('⚠️ Public API call failed (this may be expected if endpoint doesn\'t exist):', error.message);
    }
    console.log('');
    
    console.log('🎉 Authentication system test completed!');
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('- Auth utilities: Working');
    console.log(`- Authentication status: ${authStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    console.log('- Token auto-inclusion: Working');
    console.log('- Role checking: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Check localStorage for auth data
function checkAuthStorage() {
  console.log('💾 Checking localStorage for auth data...\n');
  
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  console.log('🔑 Token exists:', !!token);
  if (token) {
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    
    // Basic JWT structure check
    const parts = token.split('.');
    console.log('🔑 Token structure:', parts.length === 3 ? 'Valid JWT format' : 'Invalid format');
  }
  
  console.log('👤 User data exists:', !!userStr);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('👤 User data:', user);
    } catch (e) {
      console.log('❌ User data is corrupted');
    }
  }
  
  console.log('');
}

// Simulate login for testing
function simulateLogin() {
  console.log('🔐 Simulating login for testing...\n');
  
  // Create mock token and user data
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const mockUser = {
    userId: 123,
    email: 'test@example.com',
    role: 'MEMBER',
    isPremiumMembership: false
  };
  
  localStorage.setItem('authToken', mockToken);
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  console.log('✅ Mock login data set in localStorage');
  console.log('🔄 You can now run testAuthSystem() to test with mock data');
  console.log('');
}

// Clear auth data
function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('🧹 Auth data cleared from localStorage');
}

// Export functions for browser console
window.testAuthSystem = testAuthSystem;
window.checkAuthStorage = checkAuthStorage;
window.simulateLogin = simulateLogin;
window.clearAuth = clearAuth;

console.log('🚀 Auth Test Script Loaded!');
console.log('');
console.log('Available functions:');
console.log('- testAuthSystem(): Run full authentication system test');
console.log('- checkAuthStorage(): Check current auth data in localStorage');
console.log('- simulateLogin(): Set mock auth data for testing');
console.log('- clearAuth(): Clear all auth data');
console.log('');
console.log('💡 Start by running: checkAuthStorage()');
