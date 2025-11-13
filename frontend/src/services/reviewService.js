/**
 * Review Service
 * Handles all review-related API calls
 */

import api from './api';

const reviewService = {
  /**
   * Get reviews for a course
   */
  getCourseReviews: async (courseId, params = {}) => {
    try {
      const response = await api.get(`/api/reviews/course/${courseId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's reviews
   */
  getUserReviews: async () => {
    try {
      const response = await api.get('/api/reviews/my-reviews');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a review
   */
  createReview: async (courseId, rating, comment) => {
    try {
      const response = await api.post('/api/reviews', {
        course: courseId,
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId, rating, comment) => {
    try {
      const response = await api.put(`/api/reviews/${reviewId}`, {
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get review by ID
   */
  getReview: async (reviewId) => {
    try {
      const response = await api.get(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default reviewService;
