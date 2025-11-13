/**
 * Payment Service
 * Handles all payment-related API calls
 */

import api from './api';

const paymentService = {
  /**
   * Create checkout session
   */
  createCheckoutSession: async (courseIds) => {
    try {
      const response = await api.post('/api/payments/create-checkout-session', {
        courseIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify payment
   */
  verifyPayment: async (sessionId) => {
    try {
      const response = await api.get(`/api/payments/verify/${sessionId}`);
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
      const response = await api.get('/api/payments/history');
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
      const response = await api.get(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default paymentService;
