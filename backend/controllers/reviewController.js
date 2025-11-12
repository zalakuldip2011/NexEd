const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

/**
 * @desc    Create a review for a course
 * @route   POST /api/reviews
 * @access  Private (Student)
 */
exports.createReview = async (req, res) => {
  try {
    const { courseId, rating, comment, pros, cons } = req.body;
    const studentId = req.user.id;

    // Validate required fields
    if (!courseId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and rating are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student is enrolled and can review
    const canReview = await Review.canReview(studentId, courseId);
    if (!canReview.allowed) {
      return res.status(400).json({
        success: false,
        message: canReview.reason
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      student: studentId,
      course: courseId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course. Use the edit endpoint to update your review.'
      });
    }

    // Create review
    const review = new Review({
      student: studentId,
      course: courseId,
      instructor: course.instructor,
      rating,
      comment,
      pros: pros || [],
      cons: cons || []
    });

    await review.save();

    // Populate review data
    await review.populate([
      { path: 'student', select: 'username profilePicture' },
      { path: 'course', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review',
      error: error.message
    });
  }
};

/**
 * @desc    Get all reviews for a course
 * @route   GET /api/reviews/course/:courseId
 * @access  Public
 */
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { 
      sortBy = 'createdAt', 
      order = 'desc', 
      rating, 
      verified,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { course: courseId, status: 'approved' };
    if (rating) query.rating = parseInt(rating);
    if (verified !== undefined) query.verified = verified === 'true';

    // Get total count
    const total = await Review.countDocuments(query);

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate({
        path: 'student',
        select: 'username profilePicture'
      })
      .populate({
        path: 'instructorResponse.respondedBy',
        select: 'username profilePicture'
      })
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get rating statistics
    const ratingStats = await Review.getCourseRating(courseId);

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      ratingStats,
      reviews
    });

  } catch (error) {
    console.error('Get course reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: error.message
    });
  }
};

/**
 * @desc    Get single review
 * @route   GET /api/reviews/:id
 * @access  Public
 */
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'student',
        select: 'username profilePicture'
      })
      .populate({
        path: 'course',
        select: 'title thumbnail'
      })
      .populate({
        path: 'instructorResponse.respondedBy',
        select: 'username profilePicture'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user's review for a course
 * @route   GET /api/reviews/my-review/:courseId
 * @access  Private (Student)
 */
exports.getMyReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const review = await Review.findOne({
      student: studentId,
      course: courseId
    })
      .populate({
        path: 'course',
        select: 'title thumbnail'
      })
      .populate({
        path: 'instructorResponse.respondedBy',
        select: 'username profilePicture'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'You have not reviewed this course yet'
      });
    }

    res.json({
      success: true,
      review
    });

  } catch (error) {
    console.error('Get my review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review',
      error: error.message
    });
  }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private (Student - author only)
 */
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, pros, cons } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization
    if (review.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Check if review is editable (not flagged or removed)
    if (review.status === 'flagged' || review.status === 'removed') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit ${review.status} review. Please contact support.`
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Use the model's edit method
    const updatedReview = await review.edit({
      rating,
      comment,
      pros,
      cons
    });

    await updatedReview.populate([
      { path: 'student', select: 'username profilePicture' },
      { path: 'course', select: 'title' }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Student - author only, or Admin)
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization (author or admin)
    if (review.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
      error: error.message
    });
  }
};

/**
 * @desc    Mark review as helpful
 * @route   POST /api/reviews/:id/helpful
 * @access  Private
 */
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the review author
    if (review.student.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot mark your own review as helpful'
      });
    }

    const result = await review.markAsHelpful(req.user.id);

    res.json({
      success: true,
      message: result.action === 'added' ? 'Marked as helpful' : 'Removed helpful mark',
      helpfulCount: result.helpfulCount,
      action: result.action
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking review',
      error: error.message
    });
  }
};

/**
 * @desc    Flag a review
 * @route   POST /api/reviews/:id/flag
 * @access  Private
 */
exports.flagReview = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required to flag a review'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already flagged
    const alreadyFlagged = review.flags.some(
      flag => flag.flaggedBy.toString() === req.user.id
    );

    if (alreadyFlagged) {
      return res.status(400).json({
        success: false,
        message: 'You have already flagged this review'
      });
    }

    await review.flag(req.user.id, reason);

    res.json({
      success: true,
      message: 'Review flagged successfully. Our team will review it.'
    });

  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while flagging review',
      error: error.message
    });
  }
};

/**
 * @desc    Add instructor response to review
 * @route   POST /api/reviews/:id/response
 * @access  Private (Instructor - course owner only)
 */
exports.addInstructorResponse = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const review = await Review.findById(req.params.id).populate('course');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the course instructor
    if (review.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor can respond to reviews'
      });
    }

    // Check if response already exists
    if (review.instructorResponse.text) {
      return res.status(400).json({
        success: false,
        message: 'Instructor response already exists. Use update endpoint to modify it.'
      });
    }

    const updatedReview = await review.addInstructorResponse(req.user.id, response);

    await updatedReview.populate([
      { path: 'student', select: 'username profilePicture' },
      { path: 'instructorResponse.respondedBy', select: 'username profilePicture' }
    ]);

    res.json({
      success: true,
      message: 'Response added successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Add instructor response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding response',
      error: error.message
    });
  }
};

/**
 * @desc    Update instructor response
 * @route   PUT /api/reviews/:id/response
 * @access  Private (Instructor - course owner only)
 */
exports.updateInstructorResponse = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const review = await Review.findById(req.params.id).populate('course');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the course instructor
    if (review.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor can update responses'
      });
    }

    // Check if response exists
    if (!review.instructorResponse.text) {
      return res.status(400).json({
        success: false,
        message: 'No response exists to update'
      });
    }

    review.instructorResponse.text = response;
    review.instructorResponse.updatedAt = new Date();
    await review.save();

    await review.populate([
      { path: 'student', select: 'username profilePicture' },
      { path: 'instructorResponse.respondedBy', select: 'username profilePicture' }
    ]);

    res.json({
      success: true,
      message: 'Response updated successfully',
      review
    });

  } catch (error) {
    console.error('Update instructor response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating response',
      error: error.message
    });
  }
};

/**
 * @desc    Delete instructor response
 * @route   DELETE /api/reviews/:id/response
 * @access  Private (Instructor - course owner only)
 */
exports.deleteInstructorResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('course');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the course instructor
    if (review.course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor can delete responses'
      });
    }

    // Check if response exists
    if (!review.instructorResponse.text) {
      return res.status(404).json({
        success: false,
        message: 'No response exists to delete'
      });
    }

    review.instructorResponse = {
      text: '',
      respondedBy: null,
      respondedAt: null,
      updatedAt: null
    };
    await review.save();

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });

  } catch (error) {
    console.error('Delete instructor response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting response',
      error: error.message
    });
  }
};

/**
 * @desc    Moderate review (approve/reject/remove)
 * @route   PUT /api/reviews/:id/moderate
 * @access  Private (Admin/Moderator)
 */
exports.moderateReview = async (req, res) => {
  try {
    const { action, reason } = req.body;

    if (!action || !['approve', 'reject', 'remove'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Valid action (approve/reject/remove) is required'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization (admin or moderator)
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to moderate reviews'
      });
    }

    const updatedReview = await review.moderate(action, req.user.id, reason);

    await updatedReview.populate([
      { path: 'student', select: 'username profilePicture' },
      { path: 'course', select: 'title' }
    ]);

    res.json({
      success: true,
      message: `Review ${action}d successfully`,
      review: updatedReview
    });

  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while moderating review',
      error: error.message
    });
  }
};

/**
 * @desc    Get flagged reviews (for moderation)
 * @route   GET /api/reviews/admin/flagged
 * @access  Private (Admin/Moderator)
 */
exports.getFlaggedReviews = async (req, res) => {
  try {
    // Check authorization
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view flagged reviews'
      });
    }

    const { page = 1, limit = 20 } = req.query;

    const reviews = await Review.find({ status: 'flagged' })
      .populate({
        path: 'student',
        select: 'username email profilePicture'
      })
      .populate({
        path: 'course',
        select: 'title thumbnail'
      })
      .populate({
        path: 'flags.flaggedBy',
        select: 'username'
      })
      .sort({ 'flags.0.flaggedAt': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({ status: 'flagged' });

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reviews
    });

  } catch (error) {
    console.error('Get flagged reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching flagged reviews',
      error: error.message
    });
  }
};

/**
 * @desc    Get instructor's course reviews
 * @route   GET /api/reviews/instructor/my-reviews
 * @access  Private (Instructor)
 */
exports.getInstructorReviews = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { courseId, rating, page = 1, limit = 10 } = req.query;

    const query = { instructor: instructorId, status: 'approved' };
    if (courseId) query.course = courseId;
    if (rating) query.rating = parseInt(rating);

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate({
        path: 'student',
        select: 'username profilePicture'
      })
      .populate({
        path: 'course',
        select: 'title thumbnail'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reviews
    });

  } catch (error) {
    console.error('Get instructor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: error.message
    });
  }
};
