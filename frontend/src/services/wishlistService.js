/**
 * Wishlist Service
 * Handles all wishlist-related API calls
 */

import api from './api';

const wishlistService = {
  /**
   * Get user's wishlist
   */
  getWishlist: async () => {
    try {
      const response = await api.get('/api/wishlist');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add course to wishlist
   */
  addToWishlist: async (courseId) => {
    try {
      const response = await api.post('/api/wishlist', { courseId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove course from wishlist
   */
  removeFromWishlist: async (courseId) => {
    try {
      const response = await api.delete(`/api/wishlist/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Move course from wishlist to cart
   */
  moveToCart: async (courseId) => {
    try {
      const response = await api.post(`/api/wishlist/${courseId}/move-to-cart`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default wishlistService;
