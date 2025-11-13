const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * Middleware to verify that a user is enrolled in a course before accessing course content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId || req.body.courseId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Allow course instructors to access their own course content
    if (course.instructor.toString() === userId) {
      req.isInstructor = true;
      return next();
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course. Please enroll to access the content.',
        requiresEnrollment: true
      });
    }

    // Check if enrollment is active
    if (enrollment.status === 'cancelled' || enrollment.status === 'refunded') {
      return res.status(403).json({
        success: false,
        message: 'Your enrollment has been cancelled or refunded. Please re-enroll to access the content.',
        enrollmentStatus: enrollment.status
      });
    }

    // Attach enrollment to request for use in route handlers
    req.enrollment = enrollment;
    req.isInstructor = false;
    next();
  } catch (error) {
    console.error('Enrollment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify enrollment',
      error: error.message
    });
  }
};

/**
 * Middleware to verify lecture access (checks if lecture is preview or requires enrollment)
 */
const verifyLectureAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const lectureId = req.params.lectureId;

    if (!courseId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and Lecture ID are required'
      });
    }

    // Get course and check lecture details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find the lecture in course sections
    let lecture = null;
    let isPreview = false;

    for (const section of course.sections) {
      const foundLecture = section.lectures.find(
        l => l._id.toString() === lectureId
      );
      if (foundLecture) {
        lecture = foundLecture;
        isPreview = foundLecture.isPreview || false;
        break;
      }
    }

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    // Allow preview lectures for everyone
    if (isPreview) {
      req.isPreview = true;
      return next();
    }

    // Allow course instructors to access all lectures
    if (course.instructor.toString() === userId) {
      req.isInstructor = true;
      return next();
    }

    // For non-preview lectures, check enrollment
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must enroll in this course to access this lecture.',
        requiresEnrollment: true,
        isPreview: false
      });
    }

    if (enrollment.status === 'cancelled' || enrollment.status === 'refunded') {
      return res.status(403).json({
        success: false,
        message: 'Your enrollment has been cancelled or refunded.',
        enrollmentStatus: enrollment.status
      });
    }

    // Attach data to request
    req.enrollment = enrollment;
    req.lecture = lecture;
    req.isPreview = false;
    req.isInstructor = false;
    next();
  } catch (error) {
    console.error('Lecture access verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify lecture access',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user has completed required prerequisites
 */
const verifyPrerequisites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).populate('prerequisites');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If no prerequisites, continue
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return next();
    }

    // Check if user has completed all prerequisites
    const prerequisiteIds = course.prerequisites.map(p => p._id);
    const completedEnrollments = await Enrollment.find({
      student: userId,
      course: { $in: prerequisiteIds },
      status: 'completed'
    });

    const completedIds = completedEnrollments.map(e => e.course.toString());
    const missingPrereqs = course.prerequisites.filter(
      p => !completedIds.includes(p._id.toString())
    );

    if (missingPrereqs.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'You must complete the required prerequisite courses first.',
        missingPrerequisites: missingPrereqs.map(p => ({
          id: p._id,
          title: p.title
        }))
      });
    }

    next();
  } catch (error) {
    console.error('Prerequisites verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify prerequisites',
      error: error.message
    });
  }
};

module.exports = {
  verifyEnrollment,
  verifyLectureAccess,
  verifyPrerequisites
};
