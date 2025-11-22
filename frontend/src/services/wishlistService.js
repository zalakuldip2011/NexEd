/**
 * Wishlist Service
 * Handles all wishlist-related API calls with comprehensive error handling
 */

import api from './api';

// Helper function to log errors
const logError = (action, error) => {
  console.error(`[WISHLIST SERVICE] ${action} failed:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    url: error.config?.url
  });
};

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

const wishlistService = {
  /**
   * Get user's wishlist
   */
  getWishlist: async () => {
    try {
      console.log('[WISHLIST SERVICE] Getting wishlist...');
      const response = await api.get('/wishlist');
      console.log('[WISHLIST SERVICE] Wishlist retrieved:', response.data);
      return response.data;
    } catch (error) {
      logError('GET_WISHLIST', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Add course to wishlist
   */
  addToWishlist: async (courseId) => {
    try {
      console.log('[WISHLIST SERVICE] Adding to wishlist:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const response = await api.post(`/wishlist/${courseId}`);
      console.log('[WISHLIST SERVICE] Added to wishlist:', response.data);
      return response.data;
    } catch (error) {
      logError('ADD_TO_WISHLIST', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Remove course from wishlist
   */
  removeFromWishlist: async (courseId) => {
    try {
      console.log('[WISHLIST SERVICE] Removing from wishlist:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const response = await api.delete(`/wishlist/${courseId}`);
      console.log('[WISHLIST SERVICE] Removed from wishlist:', response.data);
      return response.data;
    } catch (error) {
      logError('REMOVE_FROM_WISHLIST', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Move course from wishlist to cart
   */
  moveToCart: async (courseId) => {
    try {
      console.log('[WISHLIST SERVICE] Moving to cart:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const response = await api.post(`/wishlist/${courseId}/move-to-cart`);
      console.log('[WISHLIST SERVICE] Moved to cart:', response.data);
      return response.data;
    } catch (error) {
      logError('MOVE_TO_CART', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Check if course is in wishlist
   */
  checkIfInWishlist: async (courseId) => {
    try {
      console.log('[WISHLIST SERVICE] Checking wishlist for:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const response = await api.get(`/wishlist/check/${courseId}`);
      console.log('[WISHLIST SERVICE] Check result:', response.data);
      return response.data;
    } catch (error) {
      logError('CHECK_WISHLIST', error);
      throw new Error(getErrorMessage(error));
    }
  }
};

export default wishlistService;
