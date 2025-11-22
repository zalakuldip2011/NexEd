/**
 * Enrollment Service
 * Handles all enrollment-related API calls
 */

import api from './api';

const enrollmentService = {
  /**
   * Get all user enrollments
   * @param {Object} filters - Optional filters (status, sortBy, order)
   */
  getEnrollments: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/enrollments?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get specific enrollment by ID
   * @param {string} enrollmentId - Enrollment ID
   */
  getEnrollment: async (enrollmentId) => {
    try {
      const response = await api.get(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get enrollment by course ID (check if enrolled)
   * @param {string} courseId - Course ID
   */
  getEnrollmentByCourse: async (courseId) => {
    try {
      const response = await api.get(`/enroll/check/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create enrollment (enroll in course)
   * @param {string} courseId - Course ID
   * @param {string} paymentId - Optional payment ID
   */
  createEnrollment: async (courseId, paymentId = null) => {
    try {
      const response = await api.post('/enrollments', { courseId, paymentId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update lecture progress
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} lectureId - Lecture ID
   * @param {number} timeSpent - Time spent in seconds
   * @param {boolean} completed - Whether lecture is completed
   */
  updateProgress: async (enrollmentId, lectureId, timeSpent = 0, completed = false) => {
    try {
      const response = await api.put(
        `/enrollments/${enrollmentId}/progress`,
        { lectureId, timeSpent, completed }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Complete lecture
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} lectureId - Lecture ID
   */
  completeLecture: async (enrollmentId, lectureId) => {
    try {
      const response = await api.post(
        `/enrollments/${enrollmentId}/complete-lecture`,
        { lectureId }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add note to lecture
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} lectureId - Lecture ID
   * @param {string} content - Note content
   */
  addNote: async (enrollmentId, lectureId, content) => {
    try {
      const response = await api.post(
        `/enrollments/${enrollmentId}/notes`,
        { lectureId, content }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update note
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} noteId - Note ID
   * @param {string} content - Updated content
   */
  updateNote: async (enrollmentId, noteId, content) => {
    try {
      const response = await api.put(
        `/enrollments/${enrollmentId}/notes/${noteId}`,
        { content }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete note
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} noteId - Note ID
   */
  deleteNote: async (enrollmentId, noteId) => {
    try {
      const response = await api.delete(
        `/enrollments/${enrollmentId}/notes/${noteId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add bookmark
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} lectureId - Lecture ID
   * @param {number} timestamp - Video timestamp
   * @param {string} title - Bookmark title
   */
  addBookmark: async (enrollmentId, lectureId, timestamp, title = '') => {
    try {
      const response = await api.post(
        `/enrollments/${enrollmentId}/bookmarks`,
        { lectureId, timestamp, title }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete bookmark
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} bookmarkId - Bookmark ID
   */
  deleteBookmark: async (enrollmentId, bookmarkId) => {
    try {
      const response = await api.delete(
        `/enrollments/${enrollmentId}/bookmarks/${bookmarkId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get certificate
   * @param {string} enrollmentId - Enrollment ID
   */
  getCertificate: async (enrollmentId) => {
    try {
      const response = await api.get(`/enrollments/${enrollmentId}/certificate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate/Issue certificate
   * @param {string} enrollmentId - Enrollment ID
   */
  generateCertificate: async (enrollmentId) => {
    try {
      const response = await api.post(`/enrollments/${enrollmentId}/certificate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user is enrolled in a specific course
   * @param {string} courseId - Course ID
   */
  checkEnrollment: async (courseId) => {
    try {
      const response = await api.get(`/enroll/check/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default enrollmentService;

