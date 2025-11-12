const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    index: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Instructor ID is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    index: true
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    trim: true
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['helpful', 'not_helpful'],
      default: 'helpful'
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'flagged', 'removed', 'archived'],
    default: 'active',
    index: true
  },
  instructorResponse: {
    comment: {
      type: String,
      maxlength: 1000
    },
    respondedAt: {
      type: Date
    }
  },
  moderation: {
    flaggedBy: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'offensive', 'misleading', 'other'],
        required: true
      },
      description: {
        type: String,
        maxlength: 500
      },
      flaggedAt: {
        type: Date,
        default: Date.now
      }
    }],
    flagCount: {
      type: Number,
      default: 0
    },
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    moderatedAt: {
      type: Date
    },
    moderationNotes: {
      type: String,
      maxlength: 500
    }
  },
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment'
  },
  editHistory: [{
    previousComment: String,
    previousRating: Number,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastEditedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
reviewSchema.index({ student: 1, course: 1 }, { unique: true }); // One review per student per course
reviewSchema.index({ course: 1, rating: 1 });
reviewSchema.index({ course: 1, status: 1 });
reviewSchema.index({ instructor: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ likes: -1 });
reviewSchema.index({ 'helpfulBy.user': 1 });

// Virtual for helpfulness score
reviewSchema.virtual('helpfulnessScore').get(function() {
  return this.likes - this.dislikes;
});

// Virtual for netHelpful count
reviewSchema.virtual('netHelpful').get(function() {
  return this.helpfulBy.filter(h => h.type === 'helpful').length;
});

// Virtual for isEdited
reviewSchema.virtual('isEdited').get(function() {
  return this.editHistory.length > 0;
});

// Virtual for daysSincePosted
reviewSchema.virtual('daysSincePosted').get(function() {
  const now = new Date();
  const posted = new Date(this.createdAt);
  return Math.floor((now - posted) / (1000 * 60 * 60 * 24));
});

// Methods

/**
 * Mark review as helpful by a user
 */
reviewSchema.methods.markAsHelpful = function(userId, type = 'helpful') {
  // Check if user already marked
  const existingIndex = this.helpfulBy.findIndex(
    h => h.user.toString() === userId.toString()
  );
  
  if (existingIndex !== -1) {
    // Update existing mark
    const oldType = this.helpfulBy[existingIndex].type;
    this.helpfulBy[existingIndex].type = type;
    this.helpfulBy[existingIndex].markedAt = new Date();
    
    // Update counts
    if (oldType === 'helpful' && type === 'not_helpful') {
      this.likes = Math.max(0, this.likes - 1);
      this.dislikes += 1;
    } else if (oldType === 'not_helpful' && type === 'helpful') {
      this.dislikes = Math.max(0, this.dislikes - 1);
      this.likes += 1;
    }
  } else {
    // Add new mark
    this.helpfulBy.push({
      user: userId,
      type,
      markedAt: new Date()
    });
    
    if (type === 'helpful') {
      this.likes += 1;
    } else {
      this.dislikes += 1;
    }
  }
  
  return this.save();
};

/**
 * Remove helpful mark
 */
reviewSchema.methods.removeHelpfulMark = function(userId) {
  const index = this.helpfulBy.findIndex(
    h => h.user.toString() === userId.toString()
  );
  
  if (index !== -1) {
    const type = this.helpfulBy[index].type;
    this.helpfulBy.splice(index, 1);
    
    if (type === 'helpful') {
      this.likes = Math.max(0, this.likes - 1);
    } else {
      this.dislikes = Math.max(0, this.dislikes - 1);
    }
  }
  
  return this.save();
};

/**
 * Add instructor response
 */
reviewSchema.methods.addInstructorResponse = function(comment) {
  this.instructorResponse = {
    comment,
    respondedAt: new Date()
  };
  
  return this.save();
};

/**
 * Update instructor response
 */
reviewSchema.methods.updateInstructorResponse = function(comment) {
  if (!this.instructorResponse.comment) {
    throw new Error('No instructor response exists');
  }
  
  this.instructorResponse.comment = comment;
  this.instructorResponse.respondedAt = new Date();
  
  return this.save();
};

/**
 * Delete instructor response
 */
reviewSchema.methods.deleteInstructorResponse = function() {
  this.instructorResponse = {
    comment: undefined,
    respondedAt: undefined
  };
  
  return this.save();
};

/**
 * Edit review
 */
reviewSchema.methods.edit = function(newRating, newComment) {
  // Save previous version to history
  this.editHistory.push({
    previousComment: this.comment,
    previousRating: this.rating,
    editedAt: new Date()
  });
  
  // Update review
  this.rating = newRating;
  this.comment = newComment;
  this.lastEditedAt = new Date();
  
  return this.save();
};

/**
 * Flag review
 */
reviewSchema.methods.flag = function(userId, reason, description = '') {
  // Check if already flagged by this user
  const alreadyFlagged = this.moderation.flaggedBy.some(
    f => f.user.toString() === userId.toString()
  );
  
  if (alreadyFlagged) {
    throw new Error('You have already flagged this review');
  }
  
  this.moderation.flaggedBy.push({
    user: userId,
    reason,
    description,
    flaggedAt: new Date()
  });
  
  this.moderation.flagCount += 1;
  
  // Auto-flag if flagged by 5+ users
  if (this.moderation.flagCount >= 5) {
    this.status = 'flagged';
  }
  
  return this.save();
};

/**
 * Moderate review (admin/instructor action)
 */
reviewSchema.methods.moderate = function(moderatorId, newStatus, notes = '') {
  this.status = newStatus;
  this.moderation.moderatedBy = moderatorId;
  this.moderation.moderatedAt = new Date();
  this.moderation.moderationNotes = notes;
  
  return this.save();
};

/**
 * Remove review
 */
reviewSchema.methods.removeReview = function(reason = '') {
  this.status = 'removed';
  this.moderation.moderationNotes = reason;
  this.moderation.moderatedAt = new Date();
  
  return this.save();
};

// Static Methods

/**
 * Get course reviews with filters
 */
reviewSchema.statics.getCourseReviews = function(courseId, options = {}) {
  const {
    rating,
    sort = 'recent',
    status = 'active',
    limit = 20,
    skip = 0
  } = options;
  
  const query = {
    course: courseId,
    status
  };
  
  if (rating) {
    query.rating = rating;
  }
  
  let sortQuery = {};
  switch (sort) {
    case 'recent':
      sortQuery = { createdAt: -1 };
      break;
    case 'helpful':
      sortQuery = { likes: -1 };
      break;
    case 'highest':
      sortQuery = { rating: -1, createdAt: -1 };
      break;
    case 'lowest':
      sortQuery = { rating: 1, createdAt: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }
  
  return this.find(query)
    .populate('student', 'username profile.firstName profile.lastName profile.avatar')
    .populate('enrollment', 'progress.percentage status')
    .sort(sortQuery)
    .limit(limit)
    .skip(skip);
};

/**
 * Get average rating for course
 */
reviewSchema.statics.getCourseRating = async function(courseId) {
  const result = await this.aggregate([
    {
      $match: {
        course: mongoose.Types.ObjectId(courseId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
  
  const stats = result[0];
  return {
    averageRating: Math.round(stats.averageRating * 10) / 10,
    totalReviews: stats.totalReviews,
    distribution: {
      5: stats.rating5,
      4: stats.rating4,
      3: stats.rating3,
      2: stats.rating2,
      1: stats.rating1
    }
  };
};

/**
 * Get instructor's reviews
 */
reviewSchema.statics.getInstructorReviews = function(instructorId, options = {}) {
  const {
    status = 'active',
    sort = 'recent',
    limit = 20,
    skip = 0
  } = options;
  
  const query = {
    instructor: instructorId,
    status
  };
  
  let sortQuery = {};
  switch (sort) {
    case 'recent':
      sortQuery = { createdAt: -1 };
      break;
    case 'highest':
      sortQuery = { rating: -1 };
      break;
    case 'lowest':
      sortQuery = { rating: 1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }
  
  return this.find(query)
    .populate('student', 'username profile.firstName profile.lastName profile.avatar')
    .populate('course', 'title thumbnail')
    .sort(sortQuery)
    .limit(limit)
    .skip(skip);
};

/**
 * Get instructor's average rating
 */
reviewSchema.statics.getInstructorRating = async function(instructorId) {
  const result = await this.aggregate([
    {
      $match: {
        instructor: mongoose.Types.ObjectId(instructorId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }
  
  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews
  };
};

/**
 * Check if student can review course
 */
reviewSchema.statics.canReview = async function(studentId, courseId) {
  // Check if already reviewed
  const existingReview = await this.findOne({
    student: studentId,
    course: courseId
  });
  
  if (existingReview) {
    return { canReview: false, reason: 'Already reviewed this course' };
  }
  
  // Check if enrolled
  const Enrollment = mongoose.model('Enrollment');
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  });
  
  if (!enrollment) {
    return { canReview: false, reason: 'Not enrolled in this course' };
  }
  
  // Optionally: Require minimum progress (e.g., 20%)
  if (enrollment.progress.percentage < 20) {
    return {
      canReview: false,
      reason: 'Complete at least 20% of the course to leave a review'
    };
  }
  
  return {
    canReview: true,
    enrollment: enrollment._id
  };
};

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Verify enrollment status on new reviews
  if (this.isNew) {
    const Enrollment = mongoose.model('Enrollment');
    Enrollment.findOne({
      student: this.student,
      course: this.course
    }).then(enrollment => {
      if (enrollment) {
        this.isVerifiedPurchase = true;
        this.enrollment = enrollment._id;
      }
      next();
    }).catch(next);
  } else {
    next();
  }
});

// Post-save middleware to update course rating
reviewSchema.post('save', async function(doc) {
  const Course = mongoose.model('Course');
  const ratings = await this.constructor.getCourseRating(doc.course);
  
  await Course.findByIdAndUpdate(doc.course, {
    averageRating: ratings.averageRating,
    totalReviews: ratings.totalReviews
  });
  
  // Update instructor rating
  const User = mongoose.model('User');
  const instructorRatings = await this.constructor.getInstructorRating(doc.instructor);
  
  await User.findByIdAndUpdate(doc.instructor, {
    'instructorProfile.rating.average': instructorRatings.averageRating,
    'instructorProfile.rating.count': instructorRatings.totalReviews
  });
});

// Post-remove middleware to update course rating
reviewSchema.post('remove', async function(doc) {
  const Course = mongoose.model('Course');
  const ratings = await this.constructor.getCourseRating(doc.course);
  
  await Course.findByIdAndUpdate(doc.course, {
    averageRating: ratings.averageRating,
    totalReviews: ratings.totalReviews
  });
  
  // Update instructor rating
  const User = mongoose.model('User');
  const instructorRatings = await this.constructor.getInstructorRating(doc.instructor);
  
  await User.findByIdAndUpdate(doc.instructor, {
    'instructorProfile.rating.average': instructorRatings.averageRating,
    'instructorProfile.rating.count': instructorRatings.totalReviews
  });
});

module.exports = mongoose.model('Review', reviewSchema);
