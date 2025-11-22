/**
 * Course Service
 * Handles all course-related API calls
 */

import api from './api';

const courseService = {
  /**
   * Get all courses with filters
   */
  getCourses: async (params = {}) => {
    try {
      const response = await api.get('/courses', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get course by ID (public)
   */
  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/courses/public/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get featured courses
   */
  getFeaturedCourses: async (limit = 8) => {
    try {
      const response = await api.get('/courses/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get courses by category
   */
  getCoursesByCategory: async (category, limit = 10) => {
    try {
      const response = await api.get(`/courses/category/${category}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get popular tags
   */
  getPopularTags: async () => {
    try {
      const response = await api.get('/courses/tags/popular');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('/courses/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get personalized courses
   */
  getPersonalizedCourses: async (limit = 12) => {
    try {
      const response = await api.get('/courses/personalized', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get batch courses by IDs
   */
  getBatchCourses: async (courseIds) => {
    try {
      const response = await api.post('/courses/batch', { courseIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Instructor endpoints
  
  /**
   * Get instructor's courses
   */
  getInstructorCourses: async () => {
    try {
      const response = await api.get('/courses/instructor');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get instructor's course stats
   */
  getCourseStats: async () => {
    try {
      const response = await api.get('/courses/instructor/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new course
   */
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses/instructor', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get instructor's course by ID
   */
  getInstructorCourse: async (courseId) => {
    try {
      const response = await api.get(`/courses/instructor/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update course
   */
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/courses/instructor/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Toggle course publish status
   */
  togglePublishCourse: async (courseId) => {
    try {
      const response = await api.put(`/courses/instructor/${courseId}/publish`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete course
   */
  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/courses/instructor/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get course analytics
   */
  getCourseAnalytics: async (courseId) => {
    try {
      const response = await api.get(`/courses/instructor/${courseId}/analytics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default courseService;
