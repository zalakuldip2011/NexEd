/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api, { setAuthToken, clearAuth } from './api';

const authService = {
  /**
   * Check authentication status
   */
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (emailOrUsername, password) => {
    try {
      const response = await api.post('/auth/login', {
        emailOrUsername,
        password
      });
      
      // Set token if login successful
      if (response.data.success && response.data.data?.token) {
        setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sign up new user
   */
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify email with OTP
   */
  verifyEmail: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-email', {
        email,
        otp
      });
      
      // Set token if verification successful
      if (response.data.success && response.data.data?.token) {
        setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Resend OTP
   */
  resendOTP: async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
      clearAuth();
    } catch (error) {
      // Even if API call fails, clear local auth
      clearAuth();
      throw error;
    }
  },

  /**
   * Get current user
   */
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/update-profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user name
   */
  updateName: async (firstName, lastName) => {
    try {
      const response = await api.put('/auth/update-name', {
        firstName,
        lastName
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (formData) => {
    try {
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      });
      
      // Update token if password change successful
      if (response.data.success && response.data.data?.token) {
        setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify reset OTP
   */
  verifyResetOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', {
        email,
        otp
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Become educator
   */
  becomeEducator: async () => {
    try {
      const response = await api.post('/auth/become-educator');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update interests
   */
  updateInterests: async (interests) => {
    try {
      const response = await api.put('/auth/interests', interests);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get interests
   */
  getInterests: async () => {
    try {
      const response = await api.get('/auth/interests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password change with OTP
   */
  requestPasswordChange: async () => {
    try {
      const response = await api.post('/auth/request-password-change');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password with OTP
   */
  changePasswordWithOTP: async (otp, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/auth/change-password-with-otp', {
        otp,
        newPassword,
        confirmPassword
      });
      
      // Update token if password change successful
      if (response.data.success && response.data.data?.token) {
        setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request account deletion
   */
  requestDeleteAccount: async (reason, password) => {
    try {
      const response = await api.post('/auth/request-delete-account', {
        reason,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel account deletion
   */
  cancelDeleteAccount: async () => {
    try {
      const response = await api.post('/auth/cancel-delete-account');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
