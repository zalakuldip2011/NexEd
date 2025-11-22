import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

// Use the centralized API service
const axios = api;

// Add axios interceptor to suppress expected 401 errors on login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console error for expected 401 on login endpoint
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/login')) {
      // Expected error - wrong password, just return rejected promise silently
      return Promise.reject(error);
    }
    // For other errors, log them normally
    if (error.response && process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.status);
    }
    return Promise.reject(error);
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SIGNUP_START: 'SIGNUP_START',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_COMPLETE: 'SIGNUP_COMPLETE',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGNUP_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.SIGNUP_COMPLETE:
      return {
        ...state,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      // DON'T clear token/user on login failure - keep existing state
      // User might already be logged in with another account
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
      
    case AUTH_ACTIONS.SIGNUP_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
    
    try {
      const response = await axios.get('/auth/check');
      
      if (response.data.authenticated) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: response.data.data
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
    }
  }, []);

  // Login function
  const login = useCallback(async (emailOrUsername, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await axios.post('/auth/login', { emailOrUsername, password });
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data.data
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data || { message: 'Login failed. Please try again.' };
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorData
      });
      
      return { 
        success: false, 
        message: errorData.message || 'Login failed. Please check your credentials.',
        code: errorData.code,
        action: errorData.action,
        errors: errorData.errors
      };
    }
  }, []);

  // Signup function
  const signup = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SIGNUP_START });
    
    try {
      const response = await axios.post('/auth/signup', userData);
      
      dispatch({ type: AUTH_ACTIONS.SIGNUP_COMPLETE });
      
      return { 
        success: true, 
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      const errorData = error.response?.data || { message: 'Signup failed' };
      
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: errorData
      });
      
      return { 
        success: false, 
        message: errorData.message,
        code: errorData.code,
        action: errorData.action,
        errors: errorData.errors,
        field: errorData.field
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await axios.put('/auth/update-profile', profileData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: response.data.data.user
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data || { message: 'Update failed' };
      return { 
        success: false, 
        message: errorData.message,
        errors: errorData.errors
      };
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (passwordData) => {
    try {
      const response = await axios.put('/auth/change-password', passwordData);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data.data
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data || { message: 'Password change failed' };
      return { 
        success: false, 
        message: errorData.message,
        code: errorData.code,
        errors: errorData.errors
      };
    }
  }, []);

  // Update user in state
  const updateUser = useCallback((userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_PROFILE,
      payload: userData
    });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Verify email with OTP
  const verifyEmail = useCallback(async (email, otp) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await axios.post('/auth/verify-email', { email, otp });
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data.data
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data || { message: 'Email verification failed' };
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorData
      });
      
      return { 
        success: false, 
        message: errorData.message,
        code: errorData.code
      };
    }
  }, []);

  // Resend OTP
  const resendOTP = useCallback(async (email) => {
    try {
      const response = await axios.post('/auth/resend-otp', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data || { message: 'Failed to resend verification code' };
      return { 
        success: false, 
        message: errorData.message,
        code: errorData.code
      };
    }
  }, []);

  const value = useMemo(() => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    signup,
    logout,
    verifyEmail,
    resendOTP,
    updateProfile,
    updateUser,
    changePassword,
    clearError,
    checkAuth
  }), [
    state.user,
    state.token,
    state.isAuthenticated,
    state.isLoading,
    state.error,
    login,
    signup,
    logout,
    verifyEmail,
    resendOTP,
    updateProfile,
    updateUser,
    changePassword,
    clearError,
    checkAuth
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export both as named and default export for flexibility
export { AuthContext };
export default AuthContext;