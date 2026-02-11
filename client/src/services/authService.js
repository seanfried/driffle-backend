import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authService = {
  // Create axios instance
  api: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // Add token to requests
  setAuthHeader: (token) => {
    if (token) {
      authService.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete authService.api.defaults.headers.common['Authorization'];
    }
  },

  // Register user
  register: async (userData) => {
    const response = await authService.api.post('/auth/register', userData);
    if (response.data.success) {
      authService.setAuthHeader(response.data.data.token);
    }
    return response.data;
  },

  // Login user
  login: async (userData) => {
    const response = await authService.api.post('/auth/login', userData);
    if (response.data.success) {
      authService.setAuthHeader(response.data.data.token);
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await authService.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.setAuthHeader(null);
    }
  },

  // Get user profile
  getProfile: async (token) => {
    authService.setAuthHeader(token);
    const response = await authService.api.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData, token) => {
    authService.setAuthHeader(token);
    const response = await authService.api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData, token) => {
    authService.setAuthHeader(token);
    const response = await authService.api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await authService.api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await authService.api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await authService.api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (email) => {
    const response = await authService.api.post('/auth/resend-verification', { email });
    return response.data;
  },
};

export default authService;