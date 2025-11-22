const express = require('express');
const router = express.Router();
const {
  createPayment,
  confirmPayment,
  handlePayPalWebhook,
  requestRefund,
  getPayment,
  getMyPayments,
  getInstructorRevenue,
  getPlatformRevenue,
  generateReceipt
} = require('../controllers/paymentController');
const { auth, requireRole } = require('../middleware/auth');

/**
 * @route   POST /api/payments/create
 * @desc    Create a payment order for course enrollment
 * @access  Private (Student/Instructor - anyone can purchase)
 */
router.post('/create', auth, createPayment);

/**
 * @route   POST /api/payments/:id/confirm
 * @desc    Confirm payment and complete enrollment
 * @access  Private (Student/Instructor - anyone can purchase)
 */
router.post('/:id/confirm', auth, confirmPayment);

/**
 * @route   POST /api/payments/webhook/paypal
 * @desc    Handle PayPal webhooks
 * @access  Public (PayPal only)
 */
router.post('/webhook/paypal', handlePayPalWebhook);

/**
 * @route   GET /api/payments/my-payments
 * @desc    Get payment history for current user
 * @access  Private (Student/Instructor - anyone can view their payments)
 */
router.get('/my-payments', auth, getMyPayments);

/**
 * @route   GET /api/payments/instructor/revenue
 * @desc    Get revenue for instructor's courses
 * @access  Private (Instructor)
 */
router.get('/instructor/revenue', auth, requireRole('instructor'), getInstructorRevenue);

/**
 * @route   GET /api/payments/admin/platform-revenue
 * @desc    Get platform-wide revenue statistics
 * @access  Private (Admin)
 */
router.get('/admin/platform-revenue', auth, requireRole('admin'), getPlatformRevenue);

/**
 * @route   GET /api/payments/:id
 * @desc    Get specific payment details
 * @access  Private (Owner/Instructor/Admin)
 */
router.get('/:id', auth, getPayment);

/**
 * @route   GET /api/payments/:id/receipt
 * @desc    Generate payment receipt
 * @access  Private (Anyone who made the payment)
 */
router.get('/:id/receipt', auth, generateReceipt);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Request refund for a payment
 * @access  Private (Student/Admin)
 */
router.post('/:id/refund', auth, requestRefund);

module.exports = router;
