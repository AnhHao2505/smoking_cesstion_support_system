// Mock authentication service

// Mock user data
const users = [
  { 
    id: 1, 
    email: 'member@example.com', 
    password: 'password123', 
    fullName: 'John Doe',
    role: 'member' 
  },
  { 
    id: 2, 
    email: 'coach@example.com', 
    password: 'password123', 
    fullName: 'Jane Smith',
    role: 'coach' 
  },
  { 
    id: 3, 
    email: 'admin@example.com', 
    password: 'password123', 
    fullName: 'Admin User',
    role: 'admin' 
  },
];

// Mock login function
export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Create a token (in a real app this would come from the server)
        const token = `mock-jwt-token-${Date.now()}`;
        
        // In a real app we would store this token in localStorage or sessionStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }));
        
        resolve({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          },
          token
        });
      } else {
        reject({ success: false, message: 'Invalid email or password' });
      }
    }, 800); // Simulate network delay
  });
};

// Mock registration function
export const register = (userData) => {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        reject({ success: false, message: 'Email already in use' });
        return;
      }
      
      // In a real app we would send this data to the server
      // For now we'll just simulate a successful registration
      resolve({
        success: true,
        message: 'Registration successful! You can now log in.'
      });
    }, 1000);
  });
};

// Mock logout function
export const logout = () => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      resolve({ success: true, message: 'Logged out successfully' });
    }, 300);
  });
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};