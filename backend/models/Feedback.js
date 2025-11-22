const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // User info
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Feedback content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Feedback type
  type: {
    type: String,
    enum: ['website_experience', 'course_quality', 'instructor_feedback', 'platform_feature', 'technical_issue', 'general'],
    default: 'website_experience'
  },
  
  // Status and moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'featured'],
    default: 'pending'
  },
  isPublic: {
    type: Boolean,
    default: true // Whether to show on homepage
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    maxlength: 500
  },
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  
  // Additional metadata
  userAgent: String,
  ipAddress: String,
  
  // Response from admin/team
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ status: 1, isPublic: 1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ type: 1 });

// Static method to get public feedback for homepage
feedbackSchema.statics.getPublicFeedback = async function(limit = 10) {
  return await this.find({
    status: 'approved',
    isPublic: true,
    type: 'website_experience'
  })
  .select('name rating title message createdAt')
  .sort({ isFeatured: -1, createdAt: -1 })
  .limit(limit);
};

// Static method to get featured feedback
feedbackSchema.statics.getFeaturedFeedback = async function(limit = 6) {
  return await this.find({
    status: 'approved',
    isPublic: true,
    isFeatured: true,
    type: 'website_experience'
  })
  .select('name rating title message createdAt')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Instance method to approve feedback
feedbackSchema.methods.approve = function(moderatorId) {
  this.status = 'approved';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  return this.save();
};

// Instance method to reject feedback
feedbackSchema.methods.reject = function(moderatorId, reason) {
  this.status = 'rejected';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.adminNotes = reason;
  return this.save();
};

// Instance method to feature feedback
feedbackSchema.methods.feature = function() {
  this.isFeatured = true;
  this.status = 'featured';
  return this.save();
};

// Pre-save middleware to auto-approve high ratings
feedbackSchema.pre('save', function(next) {
  // Auto-approve high ratings (4-5 stars) for immediate display
  if (this.isNew && this.rating >= 4) {
    this.status = 'approved';
  }
  
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);