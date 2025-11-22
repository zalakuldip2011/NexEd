const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  updateProgress,
  completeLecture,
  issueCertificate,
  addNote,
  updateNote,
  deleteNote,
  addBookmark,
  deleteBookmark,
  getCourseStats,
  getInstructorEnrollments
} = require('../controllers/enrollmentController');
const { auth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Enrollment routes (both students and instructors can enroll and learn)
router.post('/', enrollCourse);
router.get('/', getMyEnrollments);
router.get('/:id', getEnrollment);
router.put('/:id/progress', updateProgress);
router.post('/:id/complete-lecture', completeLecture);

// Notes routes (anyone enrolled can take notes)
router.post('/:id/notes', addNote);
router.put('/:id/notes/:noteId', updateNote);
router.delete('/:id/notes/:noteId', deleteNote);

// Bookmarks routes (anyone enrolled can bookmark)
router.post('/:id/bookmarks', addBookmark);
router.delete('/:id/bookmarks/:bookmarkId', deleteBookmark);

// Certificate routes
router.post('/:id/certificate', issueCertificate);

// Instructor routes
router.get('/course/:courseId/stats', requireRole('instructor'), getCourseStats);
router.get('/instructor/students', requireRole('instructor'), getInstructorEnrollments);

module.exports = router;
