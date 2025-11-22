/**
 * Razorpay Configuration
 * Initialize Razorpay instance for payment processing
 */

const Razorpay = require('razorpay');

// Check if Razorpay credentials are configured
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  
  // Mock Razorpay for development/testing
  module.exports = {
    orders: {
      create: async (options) => {
        console.log('📝 Mock Razorpay Order Created:', options);
        return {
          id: `order_mock_${Date.now()}`,
          entity: 'order',
          amount: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          notes: options.notes
        };
      },
      fetch: async (orderId) => {
        console.log('📝 Mock Razorpay Order Fetched:', orderId);
        return {
          id: orderId,
          entity: 'order',
          amount: 50000,
          currency: 'INR',
          status: 'paid'
        };
      }
    },
    payments: {
      fetch: async (paymentId) => {
        console.log('📝 Mock Razorpay Payment Fetched:', paymentId);
        return {
          id: paymentId,
          entity: 'payment',
          amount: 50000,
          currency: 'INR',
          status: 'captured',
          order_id: `order_mock_${Date.now()}`,
          method: 'card'
        };
      }
    }
  };
}

// Initialize Razorpay with credentials
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('✅ Razorpay initialized successfully');

module.exports = razorpayInstance;
