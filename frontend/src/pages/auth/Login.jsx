import React, { useState, useEffect, useCallback } from 'react';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email or Username validation
    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or username is required';
    } else if (formData.emailOrUsername.length < 3) {
      newErrors.emailOrUsername = 'Email or username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.emailOrUsername, formData.password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    // Clear previous errors and success messages
    setErrors({});
    setSuccess('');
    clearError();
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.emailOrUsername, formData.password);
      
      if (result.success) {
        setSuccess(result.message || 'Login successful!');
        // Clear password for security
        setFormData(prev => ({ ...prev, password: '' }));
        // Keep isSubmitting true - redirect will happen via useEffect
      } else {
        setIsSubmitting(false);
        // Handle different types of errors - KEEP FORM DATA, SHOW ERROR MESSAGE
        if (result.code === 'ACCOUNT_NOT_FOUND') {
          setErrors({ 
            submit: result.message || 'No account found with this email/username. Please check your credentials or sign up.'
          });
        } else if (result.code === 'EMAIL_NOT_VERIFIED') {
          setErrors({ 
            submit: result.message || 'Please verify your email before logging in. Check your inbox for the verification code.'
          });
        } else if (result.code === 'INVALID_CREDENTIALS' || result.code === 'INVALID_PASSWORD') {
          setErrors({ 
            password: 'Incorrect password. Please try again.',
            submit: result.message || 'Invalid password. Please check your password and try again.'
          });
        } else if (result.code === 'ACCOUNT_LOCKED') {
          setErrors({ 
            submit: result.message || 'Your account has been locked due to multiple failed login attempts. Please contact support or try again later.'
          });
        } else if (result.code === 'ACCOUNT_DELETED') {
          setErrors({ 
            submit: result.message || 'This account has been deleted. Please create a new account.'
          });
        } else if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ 
            submit: result.message || 'Login failed. Please check your credentials and try again.' 
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsSubmitting(false);
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      });
    }
  }, [isSubmitting, validateForm, clearError, login, formData.emailOrUsername, formData.password]);

  return (
    <div className="min-h-screen theme-auth-container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold mb-2 theme-text-accent">NexEd</h1>
          </Link>
          <h2 className="text-3xl font-bold mb-2 theme-text-primary">Welcome back</h2>
          <p className="theme-text-tertiary">Sign in to continue your learning journey</p>
        </div>

        {/* Login Form */}
        <div className="theme-auth-card">{/* Rest of form content follows */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email or Username Field */}
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium mb-2 theme-text-secondary">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 theme-text-tertiary" />
                </div>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  autoComplete="username"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  className={`theme-input block w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.emailOrUsername ? 'border-red-500 focus:ring-red-500/50' : 'focus:ring-purple-500/50'
                  }`}
                  placeholder="Enter your email or username"
                />
              </div>
              {errors.emailOrUsername && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {errors.emailOrUsername}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 theme-text-secondary">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 theme-text-tertiary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`theme-input block w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.password ? 'border-red-500 focus:ring-red-500/50' : 'focus:ring-purple-500/50'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center theme-text-tertiary hover:theme-text-secondary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className="font-medium theme-text-accent hover:opacity-80 transition-opacity"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Success */}
            {success && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
                <p className="text-sm text-green-400 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {success}
                </p>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <p className="text-sm text-red-400 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm theme-text-tertiary">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium theme-text-accent hover:opacity-80 transition-opacity">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium theme-text-accent hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;