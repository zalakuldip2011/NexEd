const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');
const { asyncHandler, notFoundError, badRequestError } = require('../middleware/errorHandler');

/**
 * @desc    Enroll in a course
 * @route   POST /api/enrollments
 * @access  Private
 */
const enrollCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw notFoundError('Course not found');
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  });

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: 'Already enrolled in this course'
    });
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    instructor: course.instructor,
    enrolledAt: new Date(),
    status: 'active'
  });

  // Update course student count
  await Course.findByIdAndUpdate(courseId, {
    $inc: { studentCount: 1 }
  });

  await enrollment.populate('course', 'title description thumbnail');

  // Create enrollment notification
  try {
    await NotificationService.createEnrollmentNotification(
      studentId,
      enrollment.course,
      'paid'
    );
  } catch (error) {
    console.error('Error creating enrollment notification:', error);
    // Don't fail enrollment if notification fails
  }

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    data: { enrollment }
  });
});

/**
 * @desc    Get user's enrollments
 * @route   GET /api/enrollments
 * @access  Private
 */
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user.id,
    status: { $in: ['active', 'completed'] }
  })
  .populate('course', 'title description thumbnail category level duration studentCount totalLectures totalDuration averageRating')
  .populate('instructor', 'username profile.firstName profile.lastName profile.avatar')
  .sort({ 'progress.lastAccessedAt': -1, enrolledAt: -1 });

  // Transform data to match frontend expectations
  const transformedEnrollments = enrollments.map(enrollment => ({
    _id: enrollment._id,
    student: enrollment.student,
    course: enrollment.course,
    instructor: enrollment.instructor,
    enrolledAt: enrollment.enrolledAt,
    status: enrollment.status,
    progress: enrollment.progress.percentage || 0,
    lastAccessedAt: enrollment.progress.lastAccessedAt,
    lastAccessedLecture: enrollment.progress.lastAccessedLecture,
    totalWatchTime: enrollment.progress.totalWatchTime || 0,
    completedLectures: enrollment.progress.completedLectures || [],
    notes: enrollment.notes || [],
    bookmarks: enrollment.bookmarks || [],
    certificate: enrollment.certificate
  }));

  res.json({
    success: true,
    count: transformedEnrollments.length,
    data: { enrollments: transformedEnrollments }
  });
});

/**
 * @desc    Get single enrollment
 * @route   GET /api/enrollments/:id
 * @access  Private
 */
const getEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate({
      path: 'course',
      populate: {
        path: 'instructor',
        select: 'username profile.firstName profile.lastName profile.avatar'
      }
    })
    .populate('instructor', 'username profile.firstName profile.lastName profile.avatar');

  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this enrollment'
    });
  }

  // Transform enrollment data to match frontend expectations
  const responseData = {
    _id: enrollment._id,
    student: enrollment.student,
    course: enrollment.course,
    instructor: enrollment.instructor,
    enrolledAt: enrollment.enrolledAt,
    status: enrollment.status,
    progress: enrollment.progress || { percentage: 0, totalWatchTime: 0, completedLectures: [] },
    lastAccessedAt: enrollment.progress?.lastAccessedAt,
    lastAccessedLecture: enrollment.progress?.lastAccessedLecture,
    totalWatchTime: enrollment.progress?.totalWatchTime || 0,
    completedLectures: enrollment.progress?.completedLectures || [],
    notes: enrollment.notes || [],
    bookmarks: enrollment.bookmarks || [],
    certificate: enrollment.certificate
  };

  res.json({
    success: true,
    data: { enrollment: responseData }
  });
});

/**
 * @desc    Update course progress
 * @route   PUT /api/enrollments/:id/progress
 * @access  Private
 */
const updateProgress = asyncHandler(async (req, res) => {
  const { progress, lectureId, timeSpent, completed } = req.body;
  
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this enrollment'
    });
  }

  // Update overall progress if provided
  if (progress !== undefined) {
    enrollment.progress.percentage = Math.min(100, Math.max(0, progress));
    if (enrollment.progress.percentage === 100) {
      enrollment.status = 'completed';
    }
  }

  // Update lecture-specific progress if lectureId provided
  if (lectureId) {
    // Update last accessed lecture
    enrollment.progress.lastAccessedLecture = lectureId;
    enrollment.progress.lastAccessedAt = new Date();

    // Update total watch time
    if (timeSpent !== undefined) {
      enrollment.progress.totalWatchTime = (enrollment.progress.totalWatchTime || 0) + timeSpent;
    }
  }

  await enrollment.save();

  // Transform response to match frontend expectations
  const responseData = {
    _id: enrollment._id,
    student: enrollment.student,
    course: enrollment.course,
    progress: enrollment.progress.percentage || 0,
    lastAccessedAt: enrollment.progress.lastAccessedAt,
    lastAccessedLecture: enrollment.progress.lastAccessedLecture,
    status: enrollment.status
  };

  res.json({
    success: true,
    message: 'Progress updated successfully',
    data: { enrollment: responseData }
  });
});

/**
 * @desc    Complete a lecture
 * @route   POST /api/enrollments/:id/complete-lecture
 * @access  Private
 */
const completeLecture = asyncHandler(async (req, res) => {
  const { lectureId, watchTime = 0 } = req.body;
  
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this enrollment'
    });
  }

  // Use the model method to complete lecture
  await enrollment.completeLecture(lectureId, watchTime);
  
  // Update overall progress based on completed lectures
  await enrollment.updateProgress(enrollment.course);

  // Check if course is completed and create notification
  if (enrollment.status === 'completed') {
    try {
      await enrollment.populate('course', 'title thumbnail');
      await NotificationService.createCourseCompletionNotification(
        enrollment.student,
        enrollment.course,
        enrollment.progress.percentage || 100
      );
    } catch (error) {
      console.error('Error creating course completion notification:', error);
    }
  }

  res.json({
    success: true,
    message: 'Lecture marked as completed',
    data: { 
      enrollment: {
        _id: enrollment._id,
        progress: enrollment.progress.percentage || 0,
        completedLectures: enrollment.progress.completedLectures,
        status: enrollment.status
      }
    }
  });
});

/**
 * @desc    Issue certificate
 * @route   POST /api/enrollments/:id/certificate
 * @access  Private
 */
const issueCertificate = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('course', 'title')
    .populate('student', 'username profile.firstName profile.lastName');

  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if course is completed
  if (enrollment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Course must be completed to issue certificate'
    });
  }

  // Generate certificate (placeholder - implement actual certificate generation)
  const certificate = {
    id: `cert_${enrollment._id}`,
    studentName: enrollment.student.profile?.firstName ? 
      `${enrollment.student.profile.firstName} ${enrollment.student.profile.lastName}` : 
      enrollment.student.username,
    courseName: enrollment.course.title,
    completedAt: enrollment.completedAt,
    issuedAt: new Date()
  };

  res.json({
    success: true,
    message: 'Certificate issued successfully',
    data: { certificate }
  });
});

/**
 * @desc    Add note to enrollment
 * @route   POST /api/enrollments/:id/notes
 * @access  Private
 */
const addNote = asyncHandler(async (req, res) => {
  const { content, lectureId } = req.body;
  
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add notes to this enrollment'
    });
  }

  const note = {
    content,
    lectureId,
    createdAt: new Date()
  };

  enrollment.notes.push(note);
  await enrollment.save();

  res.status(201).json({
    success: true,
    message: 'Note added successfully',
    notes: enrollment.notes,
    data: { note }
  });
});

/**
 * @desc    Update note
 * @route   PUT /api/enrollments/:id/notes/:noteId
 * @access  Private
 */
const updateNote = asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update notes in this enrollment'
    });
  }

  const note = enrollment.notes.id(req.params.noteId);
  if (!note) {
    throw notFoundError('Note not found');
  }

  note.content = content;
  note.updatedAt = new Date();
  await enrollment.save();

  res.json({
    success: true,
    message: 'Note updated successfully',
    data: { note }
  });
});

/**
 * @desc    Delete note
 * @route   DELETE /api/enrollments/:id/notes/:noteId
 * @access  Private
 */
const deleteNote = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete notes from this enrollment'
    });
  }

  enrollment.notes.pull(req.params.noteId);
  await enrollment.save();

  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
});

/**
 * @desc    Add bookmark
 * @route   POST /api/enrollments/:id/bookmarks
 * @access  Private
 */
const addBookmark = asyncHandler(async (req, res) => {
  const { lectureId, title, timestamp } = req.body;
  
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add bookmarks to this enrollment'
    });
  }

  const bookmark = {
    lectureId,
    title,
    timestamp,
    createdAt: new Date()
  };

  enrollment.bookmarks.push(bookmark);
  await enrollment.save();

  res.status(201).json({
    success: true,
    message: 'Bookmark added successfully',
    data: { bookmark }
  });
});

/**
 * @desc    Delete bookmark
 * @route   DELETE /api/enrollments/:id/bookmarks/:bookmarkId
 * @access  Private
 */
const deleteBookmark = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    throw notFoundError('Enrollment not found');
  }

  // Check if user owns this enrollment
  if (enrollment.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete bookmarks from this enrollment'
    });
  }

  enrollment.bookmarks.pull(req.params.bookmarkId);
  await enrollment.save();

  res.json({
    success: true,
    message: 'Bookmark deleted successfully'
  });
});

/**
 * @desc    Get course stats
 * @route   GET /api/enrollments/course/:courseId/stats
 * @access  Private (Instructor only)
 */
const getCourseStats = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  const stats = await Enrollment.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageProgress: { $avg: '$progress' }
      }
    }
  ]);

  res.json({
    success: true,
    data: { stats: stats[0] || { totalEnrollments: 0, completedEnrollments: 0, averageProgress: 0 } }
  });
});

/**
 * @desc    Get instructor's enrollments (courses they teach)
 * @route   GET /api/enrollments/instructor
 * @access  Private (Instructor only)
 */
const getInstructorEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    instructor: req.user.id
  })
  .populate('course', 'title description thumbnail')
  .populate('student', 'username profile.firstName profile.lastName')
  .sort({ enrolledAt: -1 });

  res.json({
    success: true,
    count: enrollments.length,
    data: { enrollments }
  });
});

module.exports = {
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
};
