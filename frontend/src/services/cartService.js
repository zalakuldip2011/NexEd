/**
 * Cart Service
 * Handles all cart-related API calls
 */

import api from './api';

const cartService = {
  /**
   * Get user's cart
   */
  getCart: async () => {
    try {
      const response = await api.get('/api/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add course to cart
   */
  addToCart: async (courseId) => {
    try {
      const response = await api.post('/api/cart', { courseId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove course from cart
   */
  removeFromCart: async (courseId) => {
    try {
      const response = await api.delete(`/api/cart/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    try {
      const response = await api.delete('/api/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default cartService;
