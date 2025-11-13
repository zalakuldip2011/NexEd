import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // ✅ SAFE: Validate prev before spreading
      const safePrev = prev && typeof prev === 'object' ? prev : {};
      return {
        ...safePrev,
        [name]: value
      };
    });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        // ✅ SAFE: Validate prev before spreading
        const safePrev = prev && typeof prev === 'object' ? prev : {};
        return {
          ...safePrev,
          [name]: ''
        };
      });
    }
  };

  const validateForm = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Clear previous errors and success messages
    setErrors({});
    setSuccess('');
    clearError();
    
    try {
      const result = await login(formData.emailOrUsername, formData.password);
      
      if (result.success) {
        setSuccess(result.message || 'Login successful!');
        // Redirect will happen automatically via useEffect when isAuthenticated changes
      } else {
        // Handle different types of errors
        if (result.code === 'ACCOUNT_NOT_FOUND' && result.action === 'redirect_to_signup') {
          setErrors({ 
            submit: `${result.message} Redirecting to signup...` 
          });
          setTimeout(() => navigate('/signup'), 2000);
        } else if (result.code === 'EMAIL_NOT_VERIFIED') {
          setErrors({ 
            submit: result.message || 'Please verify your email before logging in.'
          });
        } else if (result.code === 'INVALID_CREDENTIALS') {
          // Show error on password field specifically
          setErrors({ 
            password: result.message || 'Invalid password. Please try again.' 
          });
        } else if (result.code === 'ACCOUNT_LOCKED') {
          setErrors({ 
            submit: result.message || 'Your account has been locked. Please contact support.'
          });
        } else if (result.errors) {
          // Handle validation errors from backend
          setErrors(result.errors);
        } else {
          // Generic error
          setErrors({ 
            submit: result.message || 'Login failed. Please check your credentials and try again.' 
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      });
    }
  };

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
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  required
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
                  required
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm theme-text-tertiary">
                  Remember me
                </label>
              </div>

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
            {(errors.submit || error) && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <p className="text-sm text-red-400 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  {errors.submit || error?.message || 'An error occurred'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
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

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t theme-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 theme-bg-primary theme-text-tertiary">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-3 px-4 border theme-border rounded-lg shadow-sm theme-bg-secondary text-sm font-medium theme-text-secondary hover:theme-bg-tertiary transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button className="w-full inline-flex justify-center py-3 px-4 border theme-border rounded-lg shadow-sm theme-bg-secondary text-sm font-medium theme-text-secondary hover:theme-bg-tertiary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                <span className="ml-2">Twitter</span>
              </button>
            </div>
          </div>

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