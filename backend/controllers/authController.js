const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');
const emailService = require('../utils/emailService');

// Helper function to create and send token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
      token
    }
  });
};

// @desc    Register user and send OTP
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    console.log('=== SIGNUP REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    const { username, email, password } = req.body;
    console.log('Parsed values:', { username, email, password: password ? '***' : undefined });

    // Check if user already exists with email
    const existingEmail = await User.emailExists(email);
    if (existingEmail) {
      if (existingEmail.verification.isEmailVerified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please log in instead.',
          code: 'EMAIL_EXISTS',
          action: 'redirect_to_login'
        });
      } else {
        // Email exists but not verified, allow to resend OTP
        return res.status(400).json({
          success: false,
          message: 'An account with this email exists but is not verified. Please verify your email or request a new OTP.',
          code: 'EMAIL_NOT_VERIFIED',
          action: 'verify_email'
        });
      }
    }

    // Check if username already exists
    const existingUsername = await User.usernameExists(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken. Please choose a different one.',
        code: 'USERNAME_EXISTS',
        field: 'username'
      });
    }

    // Get client info for activity tracking
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create new user (not verified yet)
    const newUser = await User.create({
      username,
      email,
      password,
      activity: {
        ipAddress: clientIp,
        userAgent: userAgent
      }
    });

    // Generate and send OTP
    const otp = newUser.generateEmailOTP();
    await newUser.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      console.log(`Attempting to send OTP email to: ${email}`);
      const emailResult = await emailService.sendOTPEmail(email, username, otp);
      console.log('Email result:', emailResult);
      
      console.log(`OTP sent to new user: ${email} (${username})`);

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Please check your email for the verification code.',
        data: {
          userId: newUser._id,
          email: newUser.email,
          username: newUser.username,
          requiresVerification: true
        }
      });

    } catch (emailError) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(newUser._id);
      
      console.error('=== EMAIL SEND FAILED ===');
      console.error('Error name:', emailError.name);
      console.error('Error message:', emailError.message);
      console.error('Error code:', emailError.code);
      console.error('Full error:', emailError);
      console.error('========================');
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
        code: 'EMAIL_SEND_FAILED'
      });
    }

  } catch (error) {
    console.error('=== SIGNUP ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.error('===================');

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      
      let message = 'This account already exists.';
      let code = 'DUPLICATE_ENTRY';
      
      if (field === 'email') {
        message = 'An account with this email already exists. Please log in instead.';
        code = 'EMAIL_EXISTS';
      } else if (field === 'username') {
        message = 'Username is already taken. Please choose a different one.';
        code = 'USERNAME_EXISTS';
      }
      
      return res.status(409).json({
        success: false,
        message,
        code,
        field,
        action: field === 'email' ? 'redirect_to_login' : null
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username and explicitly select password
    const user = await User.findByEmailOrUsername(emailOrUsername);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email or username. Please create an account first.',
        code: 'ACCOUNT_NOT_FOUND',
        action: 'redirect_to_signup'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if email is verified
    if (!user.verification.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address to complete your account setup. Contact support if you need help.',
        code: 'EMAIL_NOT_VERIFIED',
        action: 'contact_support',
        data: {
          email: user.email,
          username: user.username
        }
      });
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password, user.password);

    if (!isPasswordCorrect) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Reset login attempts on successful login
    if (user.security.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update login activity
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    await user.updateLoginActivity(clientIp, userAgent);

    // Log successful login
    console.log(`User logged in: ${user.email} (${user.username})`);

    // Send token
    createSendToken(user, 200, res, 'Login successful! Welcome back.');

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'profile.firstName', 
      'profile.lastName', 
      'profile.bio', 
      'profile.phone',
      'preferences.theme',
      'preferences.language'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Please correct the following errors:',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Create password change notification
    try {
      await NotificationService.createPasswordChangeNotification(
        user._id,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent']
      );
    } catch (error) {
      console.error('Error creating password change notification:', error);
    }

    // Send new token
    createSendToken(user, 200, res, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// @desc    Check authentication status
// @route   GET /api/auth/check
// @access  Public
const checkAuth = async (req, res) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        message: 'No token found'
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        message: 'User not found or inactive'
      });
    }

    res.status(200).json({
      success: true,
      authenticated: true,
      data: {
        user
      }
    });

  } catch (error) {
    res.status(200).json({
      success: true,
      authenticated: false,
      message: 'Invalid token'
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+verification.emailOTP +verification.otpExpires +verification.otpAttempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    if (user.verification.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can login now.',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Verify OTP
    const verificationResult = user.verifyEmailOTP(otp);
    
    if (!verificationResult.success) {
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        code: 'INVALID_OTP'
      });
    }

    // Update login activity and log the user in after verification
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    user.activity.lastLogin = new Date();
    user.activity.loginCount = 1;
    user.activity.ipAddress = clientIp;
    user.activity.userAgent = userAgent;

    await user.save({ validateBeforeSave: false });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    console.log(`Email verified for user: ${user.email} (${user.username})`);

    // Auto-login user after email verification
    createSendToken(user, 200, res, 'Email verified successfully! Welcome to NexEd.');

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+verification.emailOTP +verification.otpExpires +verification.otpAttempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    if (user.verification.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can login now.',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Check if user can resend OTP (rate limiting)
    if (!user.canResendOTP()) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 1 minute before requesting a new OTP',
        code: 'TOO_MANY_REQUESTS'
      });
    }

    // Generate new OTP
    const otp = user.generateEmailOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await emailService.sendOTPEmail(user.email, user.username, otp);
      
      console.log(`OTP resent to user: ${user.email} (${user.username})`);

      res.status(200).json({
        success: true,
        message: 'New verification code sent to your email address'
      });

    } catch (emailError) {
      console.error('Failed to resend OTP email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
        code: 'EMAIL_SEND_FAILED'
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Forgot password - send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Check if account is active and verified
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (!user.verification.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address first before resetting your password.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check if user can request password reset (rate limiting)
    if (!user.canRequestPasswordReset()) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 2 minutes before requesting another password reset',
        code: 'TOO_MANY_REQUESTS'
      });
    }

    // Generate password reset OTP
    const otp = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.username, otp);
      
      console.log(`Password reset OTP sent to user: ${user.email} (${user.username})`);

      res.status(200).json({
        success: true,
        message: 'Password reset code sent to your email address. Please check your email.',
        data: {
          email: user.email
        }
      });

    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clear the OTP if email failed
      user.security.passwordResetToken = undefined;
      user.security.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again.',
        code: 'EMAIL_SEND_FAILED'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+security.passwordResetToken +security.passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Verify password reset OTP
    const verificationResult = user.verifyPasswordResetOTP(otp);
    
    if (!verificationResult.success) {
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        code: 'INVALID_OTP'
      });
    }

    // OTP is valid - mark as verified and save
    await user.save({ validateBeforeSave: false });

    console.log(`Password reset OTP verified for user: ${user.email} (${user.username})`);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      data: {
        email: user.email,
        resetToken: 'verified' // Simple flag for frontend
      }
    });

  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Reset password with new password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, new password, and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        code: 'PASSWORDS_MISMATCH'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+security.passwordResetToken +security.passwordResetExpires +security.passwordResetVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Check if OTP was verified and still valid
    if (!user.security.passwordResetVerified || 
        !user.security.passwordResetExpires || 
        user.security.passwordResetExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Password reset session has expired. Please request a new password reset.',
        code: 'RESET_SESSION_EXPIRED'
      });
    }

    // Reset the password
    const resetResult = user.resetPassword(newPassword);
    await user.save();

    console.log(`Password reset successful for user: ${user.email} (${user.username})`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
      data: {
        email: user.email
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Become an educator
// @route   POST /api/auth/become-educator
// @access  Private
const becomeEducator = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.role === 'instructor') {
      return res.status(400).json({
        success: false,
        message: 'You are already an instructor',
        code: 'ALREADY_INSTRUCTOR'
      });
    }

    // Make user an instructor
    await user.becomeInstructor();

    console.log(`User became instructor: ${user.email} (${user.username})`);

    res.status(200).json({
      success: true,
      message: 'Congratulations! You are now an educator on NexEd.',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Become educator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    console.log('🖼️  Upload Avatar Controller');
    console.log('   User ID:', req.user?.id);
    console.log('   File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
      console.error('   ❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    console.log('   File details:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('   ❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.profile.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.profile.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
        console.log('   ✅ Old avatar deleted');
      }
    }

    // Update avatar path
    user.profile.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    console.log('   ✅ Avatar updated successfully:', user.profile.avatar);

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        avatar: user.profile.avatar
      }
    });

  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/auth/remove-avatar
// @access  Private
const removeAvatar = async (req, res) => {
  try {
    console.log('🗑️  Remove Avatar Controller');
    console.log('   User ID:', req.user?.id);

    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('   ❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete avatar file if exists
    if (user.profile.avatar) {
      const avatarPath = path.join(__dirname, '..', user.profile.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
        console.log('   ✅ Avatar file deleted');
      }
    }

    // Clear avatar path
    user.profile.avatar = null;
    await user.save();

    console.log('   ✅ Avatar removed successfully');

    res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      data: {
        avatar: null
      }
    });

  } catch (error) {
    console.error('❌ Remove avatar error:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to remove profile photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user name
// @route   PUT /api/auth/update-name
// @access  Private
const updateName = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    if (!firstName && !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least first name or last name'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Name updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update name error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update name'
    });
  }
};

// @desc    Request password change with OTP
// @route   POST /api/auth/request-password-change
// @access  Private
const requestPasswordChange = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check rate limiting
    if (!user.canRequestPasswordReset()) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 2 minutes before requesting another code',
        code: 'TOO_MANY_REQUESTS'
      });
    }

    // Generate OTP
    const otp = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await emailService.sendPasswordChangeOTPEmail(user.email, user.username, otp);
      
      console.log(`Password change OTP sent to user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Verification code sent to your email address'
      });

    } catch (emailError) {
      console.error('Failed to send password change email:', emailError);
      
      // Clear the OTP if email failed
      user.security.passwordResetToken = undefined;
      user.security.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.'
      });
    }

  } catch (error) {
    console.error('Request password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// @desc    Change password with OTP verification
// @route   PUT /api/auth/change-password-with-otp
// @access  Private
const changePasswordWithOTP = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;

    if (!otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'OTP, new password, and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        code: 'PASSWORDS_MISMATCH'
      });
    }

    const user = await User.findById(req.user.id)
      .select('+security.passwordResetToken +security.passwordResetExpires +password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const verificationResult = user.verifyPasswordResetOTP(otp);
    
    if (!verificationResult.success) {
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        code: 'INVALID_OTP'
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await user.correctPassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password'
      });
    }

    // Update password
    user.password = newPassword;
    user.security.passwordResetToken = undefined;
    user.security.passwordResetExpires = undefined;
    user.security.passwordResetVerified = false;
    await user.save();

    console.log(`Password changed successfully for user: ${user.email}`);

    // Send new token
    createSendToken(user, 200, res, 'Password changed successfully');

  } catch (error) {
    console.error('Change password with OTP error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// @desc    Request account deletion
// @route   POST /api/auth/request-delete-account
// @access  Private
const requestDeleteAccount = async (req, res) => {
  try {
    const { reason, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check if user has published courses (for instructors)
    let hasPublishedCourses = false;
    let enrollmentCount = 0;
    
    if (user.role === 'instructor') {
      const Course = require('../models/Course');
      const courses = await Course.find({ instructor: user._id });
      hasPublishedCourses = courses.some(course => course.isPublished);
      enrollmentCount = courses.reduce((total, course) => total + (course.enrollmentCount || 0), 0);
    }

    // Schedule deletion
    const deletionDate = user.scheduleAccountDeletion(reason);
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendAccountDeletionEmail(
        user.email, 
        user.username, 
        deletionDate, 
        hasPublishedCourses
      );
    } catch (emailError) {
      console.error('Failed to send deletion confirmation email:', emailError);
    }

    console.log(`Account deletion requested for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Account deletion has been scheduled',
      data: {
        scheduledFor: deletionDate,
        gracePeriodDays: 14,
        hasPublishedCourses,
        enrollmentCount
      }
    });

  } catch (error) {
    console.error('Request delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process account deletion request'
    });
  }
};

// @desc    Cancel account deletion
// @route   POST /api/auth/cancel-delete-account
// @access  Private
const cancelDeleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.accountDeletion.isScheduled) {
      return res.status(400).json({
        success: false,
        message: 'No account deletion request found'
      });
    }

    // Cancel deletion
    user.cancelAccountDeletion();
    await user.save();

    console.log(`Account deletion cancelled for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Account deletion has been cancelled successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Cancel delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel account deletion'
    });
  }
};

// @desc    Update user interests
// @route   PUT /api/auth/interests
// @access  Private
const updateInterests = async (req, res) => {
  try {
    console.log('📚 Update Interests Controller');
    console.log('   User ID:', req.user?.id);
    console.log('   Request body:', req.body);

    const { categories, skillLevel, goals } = req.body;

    // Validation
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one category'
      });
    }

    if (categories.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'You can select maximum 10 categories'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update interests
    user.interests = {
      categories: categories,
      skillLevel: skillLevel || 'beginner',
      goals: goals || [],
      hasCompletedInterests: true,
      lastUpdated: new Date()
    };

    await user.save();

    console.log('   ✅ Interests updated successfully');

    res.status(200).json({
      success: true,
      message: 'Your interests have been saved successfully',
      data: {
        interests: user.interests
      }
    });

  } catch (error) {
    console.error('❌ Update interests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interests. Please try again.'
    });
  }
};

// @desc    Get user interests
// @route   GET /api/auth/interests
// @access  Private
const getInterests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('interests');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        interests: user.interests
      }
    });

  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interests'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  verifyEmail,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  updateProfile,
  changePassword,
  checkAuth,
  becomeEducator,
  uploadAvatar,
  removeAvatar,
  updateName,
  requestPasswordChange,
  changePasswordWithOTP,
  requestDeleteAccount,
  cancelDeleteAccount,
  updateInterests,
  getInterests
};