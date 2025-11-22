/**
 * Payment Service
 * Handles all payment-related API calls including Razorpay integration
 */

import api from './api';

const paymentService = {
  /**
   * Create Razorpay order for course enrollment
   * @param {string} courseId - Single course ID
   * @param {Array<string>} courseIds - Multiple course IDs (for cart)
   */
  createOrder: async ({ courseId, courseIds }) => {
    try {
      console.log('📝 Creating order with:', { courseId, courseIds });
      
      const response = await api.post('/enroll/create-order', {
        courseId,
        courseIds
      });
      
      console.log('✅ Order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create order error:', error);
      
      // Extract meaningful error message
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        const errorMessage = error.response.data?.message 
          || error.response.data?.error 
          || `Server error (${error.response.status})`;
        
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to create order');
      }
    }
  },

  /**
   * Verify Razorpay payment after successful payment
   * @param {Object} paymentData - Payment verification data
   */
  verifyPayment: async (paymentData) => {
    try {
      console.log('🔐 Verifying payment:', paymentData);
      
      const response = await api.post('/enroll/verify', paymentData);
      
      console.log('✅ Payment verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Verify payment error:', error);
      
      // Extract meaningful error message
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        const errorMessage = error.response.data?.message 
          || error.response.data?.error 
          || `Verification failed (${error.response.status})`;
        
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to verify payment');
      }
    }
  },

  /**
   * Check enrollment status for a course
   * @param {string} courseId - Course ID
   */
  checkEnrollment: async (courseId) => {
    try {
      const response = await api.get(`/enroll/check/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment by ID
   */
  getPayment: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default paymentService;

