const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { 
  validateSignup, 
  validateLogin,
  validateEmailVerification,
  validateResendOTP,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again in 15 minutes.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  }
});

// Public routes
router.post('/signup', authLimiter, validateSignup, handleValidationErrors, authController.signup);
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, authController.login);
router.post('/verify-email', authLimiter, validateEmailVerification, handleValidationErrors, authController.verifyEmail);
router.post('/resend-otp', authLimiter, validateResendOTP, handleValidationErrors, authController.resendOTP);
router.post('/forgot-password', authLimiter, validateForgotPassword, handleValidationErrors, authController.forgotPassword);
router.post('/verify-reset-otp', authLimiter, validateEmailVerification, handleValidationErrors, authController.verifyResetOTP);
router.post('/reset-password', authLimiter, validateResetPassword, handleValidationErrors, authController.resetPassword);
router.get('/check', authController.checkAuth);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/update-profile', authController.updateProfile);
router.put('/update-name', authController.updateName);
router.post('/upload-avatar', uploadAvatar, authController.uploadAvatar);
router.put('/change-password', validateChangePassword, handleValidationErrors, authController.changePassword);
router.post('/request-password-change', authLimiter, authController.requestPasswordChange);
router.put('/change-password-with-otp', authLimiter, authController.changePasswordWithOTP);
router.post('/become-educator', authController.becomeEducator);
router.post('/request-delete-account', authController.requestDeleteAccount);
router.post('/cancel-delete-account', authController.cancelDeleteAccount);

module.exports = router;