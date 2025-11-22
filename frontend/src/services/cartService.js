/**
 * Cart Service - Enhanced with Performance Optimizations
 * Handles all cart-related API calls with debouncing, retry logic, and bulk operations
 */

import api from './api';

// Debounce utility for rapid operations
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(null, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

// Retry utility for network errors
const withRetry = async (fn, maxRetries = 2, delay = 1000) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Check if error is retryable (network errors, 5xx errors)
const isRetryableError = (error) => {
  if (!error.response) return true; // Network error
  const status = error.response.status;
  return status >= 500 || status === 429; // Server errors or rate limiting
};

const cartService = {
  /**
   * Get user's cart with caching
   */
  getCart: async (useCache = false) => {
    const cacheKey = 'cart_cache';
    const cacheTime = 30000; // 30 seconds
    
    if (useCache) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheTime) {
          return data;
        }
      }
    }
    
    try {
      const response = await withRetry(() => api.get('/cart'));
      
      // Cache the response
      localStorage.setItem(cacheKey, JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      
      return response.data;
    } catch (error) {
      // Clear invalid cache on error
      localStorage.removeItem(cacheKey);
      throw error;
    }
  },

  /**
   * Add course to cart with validation
   */
  addToCart: async (courseId, options = {}) => {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    try {
      const response = await withRetry(() => api.post(`/cart/${courseId}`, options));
      
      // Clear cart cache after successful operation
      localStorage.removeItem('cart_cache');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove course from cart with retry
   */
  removeFromCart: async (courseId) => {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    try {
      const response = await withRetry(() => api.delete(`/cart/${courseId}`));
      
      // Clear cart cache after successful operation
      localStorage.removeItem('cart_cache');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear entire cart with confirmation
   */
  clearCart: async (force = false) => {
    try {
      const params = force ? { force: true } : {};
      const response = await withRetry(() => api.delete('/cart', { params }));
      
      // Clear all cart-related cache
      localStorage.removeItem('cart_cache');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk operations - Add multiple courses to cart
   */
  addMultipleToCart: async (courseIds) => {
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      throw new Error('Course IDs array is required');
    }
    
    try {
      const response = await withRetry(() => api.post('/cart/bulk-add', { courseIds }));
      
      // Clear cart cache after successful operation
      localStorage.removeItem('cart_cache');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk operations - Remove multiple courses from cart
   */
  removeMultipleFromCart: async (courseIds) => {
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      throw new Error('Course IDs array is required');
    }
    
    try {
      const response = await withRetry(() => api.delete('/cart/bulk-remove', { data: { courseIds } }));
      
      // Clear cart cache after successful operation
      localStorage.removeItem('cart_cache');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Validate cart items (check if courses still available, prices updated)
   */
  validateCart: async () => {
    try {
      const response = await withRetry(() => api.post('/cart/validate'));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get cart summary (count, total price)
   */
  getCartSummary: async () => {
    try {
      const response = await withRetry(() => api.get('/cart/summary'));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Debounced versions for rapid UI interactions
cartService.addToCartDebounced = debounce(cartService.addToCart, 300);
cartService.removeFromCartDebounced = debounce(cartService.removeFromCart, 300);

export default cartService;
