const express = require('express');
const router = express.Router();
const { auth, requireRole, protect } = require('../middleware/auth');
const {
  // Public endpoints
  getCourses,
  getCoursesByCategory,
  getFeaturedCourses,
  getPopularCourses,
  getTrendingCourses,
  getPopularTags,
  getCourseById,
  getCategories,
  getPersonalizedCoursesForUser,
  getSmartRecommendations,
  
  // Instructor endpoints
  getInstructorCourses,
  getCourseStats,
  createCourse,
  getInstructorCourse,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  toggleCourseStatus,
  getCourseAnalytics,
  getStudentPerformance
} = require('../controllers/courseController');

// Public course routes (no authentication required)
router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/popular', getPopularCourses);
router.get('/trending', getTrendingCourses);
router.get('/categories', getCategories);
router.get('/tags/popular', getPopularTags);
router.get('/category/:category', getCoursesByCategory);
router.get('/public/:id', getCourseById);

// Protected routes (require authentication)
router.get('/personalized', protect, getPersonalizedCoursesForUser);
router.get('/smart-recommendations', protect, getSmartRecommendations);

// Instructor course routes (require authentication and instructor role)
router.get('/instructor/dashboard/stats', auth, requireRole('instructor'), getCourseStats);
router.get('/instructor/student-performance', auth, requireRole('instructor'), getStudentPerformance);
router.get('/instructor', auth, requireRole('instructor'), getInstructorCourses);
router.post('/instructor', auth, requireRole('instructor'), createCourse);
router.get('/instructor/:id', auth, requireRole('instructor'), getInstructorCourse);
router.get('/instructor/:id/analytics', auth, requireRole('instructor'), getCourseAnalytics);
router.put('/instructor/:id', auth, requireRole('instructor'), updateCourse);
router.put('/instructor/:id/publish', auth, requireRole('instructor'), togglePublishCourse);
router.delete('/instructor/:id', auth, requireRole('instructor'), deleteCourse);
router.patch('/instructor/:id/status', auth, requireRole('instructor'), toggleCourseStatus);

module.exports = router;