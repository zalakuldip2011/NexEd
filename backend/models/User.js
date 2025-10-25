const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    validate: {
      validator: function(username) {
        // Username must start with a letter or number (not underscore)
        return /^[a-zA-Z0-9][a-zA-Z0-9_]*$/.test(username);
      },
      message: 'Username must start with a letter or number and can only contain letters, numbers, and underscores'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password) {
        // Password must contain at least one uppercase, one lowercase, one number, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    dateOfBirth: {
      type: Date
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      mobile: {
        type: Boolean,
        default: true
      }
    }
  },
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    emailOTP: {
      type: String,
      select: false
    },
    otpExpires: {
      type: Date,
      select: false
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false
    }
  },
  security: {
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
      select: false
    },
    passwordChangedAt: {
      type: Date,
      select: false
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    lockUntil: {
      type: Date,
      select: false
    }
  },
  activity: {
    lastLogin: {
      type: Date
    },
    loginCount: {
      type: Number,
      default: 0
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set password changed timestamp
    if (!this.isNew) {
      this.security.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email,
      username: this.username,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE 
    }
  );
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.security.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.security.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        'security.lockUntil': 1,
      },
      $set: {
        'security.loginAttempts': 1,
      }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // If we have max attempts and no lock, lock account
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000, // Lock for 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      'security.loginAttempts': 1,
      'security.lockUntil': 1
    }
  });
};

// Instance method to update login activity
userSchema.methods.updateLoginActivity = function(ip, userAgent) {
  return this.updateOne({
    $set: {
      'activity.lastLogin': Date.now(),
      'activity.ipAddress': ip,
      'activity.userAgent': userAgent
    },
    $inc: {
      'activity.loginCount': 1
    }
  });
};

// Instance method to generate email OTP
userSchema.methods.generateEmailOTP = function() {
  const crypto = require('crypto');
  
  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // Set OTP and expiration (10 minutes from now)
  this.verification.emailOTP = otp;
  this.verification.otpExpires = Date.now() + (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000;
  this.verification.otpAttempts = 0;
  
  return otp;
};

// Instance method to verify email OTP
userSchema.methods.verifyEmailOTP = function(candidateOTP) {
  // Check if OTP has expired
  if (!this.verification.otpExpires || this.verification.otpExpires < Date.now()) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  // Check if too many attempts
  if (this.verification.otpAttempts >= 5) {
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  // Verify OTP
  if (this.verification.emailOTP === candidateOTP) {
    // Clear OTP data and mark email as verified
    this.verification.emailOTP = undefined;
    this.verification.otpExpires = undefined;
    this.verification.otpAttempts = 0;
    this.verification.isEmailVerified = true;
    
    return { success: true, message: 'Email verified successfully!' };
  } else {
    // Increment failed attempts
    this.verification.otpAttempts += 1;
    return { 
      success: false, 
      message: `Invalid OTP. ${5 - this.verification.otpAttempts} attempts remaining.` 
    };
  }
};

// Instance method to check if OTP can be resent
userSchema.methods.canResendOTP = function() {
  const lastOTPTime = this.verification.otpExpires 
    ? this.verification.otpExpires - (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000
    : 0;
  
  // Allow resend after 1 minute
  return Date.now() - lastOTPTime > 60 * 1000;
};

// Instance method to check if user can request password reset (rate limiting)
userSchema.methods.canRequestPasswordReset = function() {
  // Allow password reset request if no previous request or if 2 minutes have passed
  if (!this.security.passwordResetExpires) {
    return true;
  }
  
  // Check if at least 2 minutes have passed since last request
  const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
  return this.security.passwordResetExpires < twoMinutesAgo;
};

// Instance method to generate password reset OTP
userSchema.methods.generatePasswordResetOTP = function() {
  const crypto = require('crypto');
  
  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // Set OTP and expiration (10 minutes from now)
  this.security.passwordResetToken = otp;
  this.security.passwordResetExpires = Date.now() + (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000;
  
  return otp;
};

// Instance method to verify password reset OTP
userSchema.methods.verifyPasswordResetOTP = function(candidateOTP) {
  // Check if OTP has expired
  if (!this.security.passwordResetExpires || this.security.passwordResetExpires < Date.now()) {
    return { success: false, message: 'Reset code has expired. Please request a new one.' };
  }
  
  // Verify OTP
  if (this.security.passwordResetToken === candidateOTP) {
    // Mark as verified
    this.security.passwordResetVerified = true;
    return { success: true, message: 'Reset code verified successfully!' };
  } else {
    return { success: false, message: 'Invalid reset code. Please try again.' };
  }
};

// Instance method to reset password
userSchema.methods.resetPassword = function(newPassword) {
  this.password = newPassword;
  this.security.passwordResetToken = undefined;
  this.security.passwordResetExpires = undefined;
  this.security.passwordResetVerified = false;
  this.security.passwordChangedAt = Date.now() - 1000;
  this.security.loginAttempts = 0;
  this.security.lockUntil = undefined;
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password +security.loginAttempts +security.lockUntil');
};

// Static method to check if username exists
userSchema.statics.usernameExists = function(username) {
  return this.findOne({ username: username });
};

// Static method to check if email exists
userSchema.statics.emailExists = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.security;
  delete userObject.verification.emailVerificationToken;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;