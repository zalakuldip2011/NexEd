/**
 * Enrollment Service
 * Handles all enrollment-related API calls
 */

import api from './api';

const enrollmentService = {
  /**
   * Get all user enrollments
   */
  getEnrollments: async () => {
    try {
      const response = await api.get('/api/enrollments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get specific enrollment
   */
  getEnrollment: async (enrollmentId) => {
    try {
      const response = await api.get(`/api/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get enrollment by course ID
   */
  getEnrollmentByCourse: async (courseId) => {
    try {
      const response = await api.get(`/api/enrollments/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create enrollment (enroll in course)
   */
  createEnrollment: async (courseId) => {
    try {
      const response = await api.post('/api/enrollments', { courseId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update lecture progress
   */
  updateProgress: async (enrollmentId, lectureId, completed = true) => {
    try {
      const response = await api.put(
        `/api/enrollments/${enrollmentId}/progress`,
        { lectureId, completed }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Complete lecture
   */
  completeLecture: async (enrollmentId, lectureId) => {
    try {
      const response = await api.put(
        `/api/enrollments/${enrollmentId}/complete-lecture`,
        { lectureId }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get certificate
   */
  getCertificate: async (enrollmentId) => {
    try {
      const response = await api.get(`/api/enrollments/${enrollmentId}/certificate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate certificate
   */
  generateCertificate: async (enrollmentId) => {
    try {
      const response = await api.post(`/api/enrollments/${enrollmentId}/certificate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default enrollmentService;
