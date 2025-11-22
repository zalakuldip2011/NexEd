const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: function() {
      return this.status === 'published';
    },
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Course subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: function() {
      return this.status === 'published';
    },
    maxlength: [5000, 'Course description cannot exceed 5000 characters']
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: function() {
      return this.status === 'published';
    },
    trim: true,
    // Removed enum restriction to allow comprehensive domain > subdomain format
    validate: {
      validator: function(v) {
        // Allow empty string for drafts
        if (!v || v === '') return true;
        // Check if it's a valid domain or domain > subdomain format
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Category must be a non-empty string'
    }
  },
  subcategory: {
    type: String,
    trim: true,
    // Deprecated: keeping for backward compatibility, but new courses use category field with domain > subdomain format
  },
  level: {
    type: String,
    required: function() {
      return this.status === 'published';
    },
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', ''] // Allow empty for drafts
  },
  language: {
    type: String,
    default: 'English'
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  previewVideo: {
    type: String,
    default: ''
  },
  sections: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    lectures: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        enum: ['video', 'article', 'quiz', 'assignment'],
        default: 'video'
      },
      // YouTube video data
      videoData: {
        url: String, // Original YouTube URL
        videoId: String, // Extracted video ID
        embedUrl: String, // Embed URL for player
        thumbnailUrl: String, // Video thumbnail
        watchUrl: String // YouTube watch URL
      },
      // Legacy video URL (kept for backward compatibility)
      videoUrl: {
        type: String,
        default: ''
      },
      duration: {
        type: Number, // Duration in minutes
        default: 0
      },
      resources: [{
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'link', 'image', 'document'],
          default: 'link'
        }
      }],
      isPreview: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    order: {
      type: Number,
      default: 0
    }
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  totalDuration: {
    type: Number, // Total duration in seconds
    default: 0
  },
  totalLectures: {
    type: Number,
    default: 0
  },
  enrollments: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLectures: [{
      lecture: mongoose.Schema.ObjectId,
      completedAt: Date
    }],
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviews: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalEnrollments: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestseller: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save validation for published courses
courseSchema.pre('save', function(next) {
  if (this.status === 'published') {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Course title is required for published courses');
    }
    if (!this.description || this.description.trim() === '') {
      errors.push('Course description is required for published courses');
    }
    if (!this.category || this.category === '') {
      errors.push('Course category is required for published courses');
    }
    if (!this.level || this.level === '') {
      errors.push('Course level is required for published courses');
    }
    
    if (errors.length > 0) {
      const error = new Error(errors.join(', '));
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Indexes for better performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ subcategory: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ totalEnrollments: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ featured: 1 });
courseSchema.index({ bestseller: 1 });

// Text search index
courseSchema.index({
  title: 'text',
  subtitle: 'text',
  description: 'text',
  tags: 'text'
});

// Compound indexes for common filter combinations
// Category + Level + Published (for filtered browsing)
courseSchema.index({ isPublished: 1, category: 1, level: 1 });

// Category + Rating (for featured/top courses)
courseSchema.index({ isPublished: 1, category: 1, averageRating: -1 });

// Price range filtering + Published
courseSchema.index({ isPublished: 1, price: 1 });

// Instructor's published courses sorted by creation
courseSchema.index({ instructor: 1, isPublished: 1, createdAt: -1 });

// Popular courses (enrollment + rating)
courseSchema.index({ isPublished: 1, totalEnrollments: -1, averageRating: -1 });

// Featured courses with good ratings
courseSchema.index({ isPublished: 1, featured: 1, averageRating: -1 });

// Newest courses
courseSchema.index({ isPublished: 1, createdAt: -1 });

// Virtual for course URL/slug
courseSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
});

// Virtual for effective price (considering discount)
courseSchema.virtual('effectivePrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Methods
courseSchema.methods.calculateTotals = function() {
  let totalDuration = 0;
  let totalLectures = 0;

  // Safely handle sections array
  if (this.sections && Array.isArray(this.sections)) {
    this.sections.forEach(section => {
      if (section.lectures && Array.isArray(section.lectures)) {
        section.lectures.forEach(lecture => {
          totalDuration += lecture.duration || 0;
          totalLectures += 1;
        });
      }
    });
  }

  this.totalDuration = totalDuration;
  this.totalLectures = totalLectures;
};

courseSchema.methods.calculateAverageRating = function() {
  // Safely handle reviews array
  if (!this.reviews || !Array.isArray(this.reviews) || this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }

  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  this.totalReviews = this.reviews.length;
};

courseSchema.methods.publish = function() {
  this.status = 'published';
  this.isPublished = true;
  this.publishedAt = new Date();
};

courseSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.isPublished = false;
  this.publishedAt = undefined;
};

courseSchema.methods.getSimilarCourses = async function() {
  // Find courses with similar tags or in the same category
  const similarCourses = await this.constructor
    .find({
      _id: { $ne: this._id },
      isPublished: true,
      $or: [
        { tags: { $in: this.tags } },
        { category: this.category }
      ]
    })
    .limit(6)
    .populate('instructor', 'name profilePicture')
    .sort({ averageRating: -1, totalEnrollments: -1 });

  return similarCourses;
};

// Static methods
courseSchema.statics.getPopularTags = async function() {
  const pipeline = [
    { $match: { isPublished: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ];
  
  const result = await this.aggregate(pipeline);
  return result.map(item => ({ tag: item._id, count: item.count }));
};

courseSchema.statics.getCoursesByCategory = async function(category, limit = 10) {
  // Support both exact match and domain-level search for new format
  const query = {
    isPublished: true,
    $or: [
      { category: category }, // Exact match
      { category: { $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($| > )`, $options: 'i' } } // Domain match for "domain > subdomain" format
    ]
  };
  
  return this.find(query)
    .populate('instructor', 'name profilePicture')
    .sort({ averageRating: -1, totalEnrollments: -1 })
    .limit(limit);
};

courseSchema.statics.searchCourses = async function(query, filters = {}) {
  // Build match stage for aggregation pipeline
  const matchStage = {
    isPublished: true
  };

  // Add text search if query provided
  if (query) {
    matchStage.$text = { $search: query };
  }

  // Add category filter
  if (filters.category) {
    matchStage.category = filters.category;
  }

  // Add level filter
  if (filters.level) {
    matchStage.level = filters.level;
  }

  // Add price range filters
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    matchStage.price = {};
    if (filters.minPrice !== undefined) {
      matchStage.price.$gte = parseFloat(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      matchStage.price.$lte = parseFloat(filters.maxPrice);
    }
  }

  // Add rating filter
  if (filters.rating) {
    matchStage.averageRating = { $gte: parseFloat(filters.rating) };
  }

  // Add tags filter
  if (filters.tags && filters.tags.length > 0) {
    matchStage.tags = { $in: filters.tags };
  }

  // Build sort stage
  let sortStage = {};
  switch (filters.sortBy) {
    case 'popularity':
      sortStage = { totalEnrollments: -1, averageRating: -1 };
      break;
    case 'rating':
      sortStage = { averageRating: -1, totalEnrollments: -1 };
      break;
    case 'newest':
      sortStage = { createdAt: -1 };
      break;
    case 'price-low':
      sortStage = { price: 1 };
      break;
    case 'price-high':
      sortStage = { price: -1 };
      break;
    default:
      // If text search, sort by relevance score, otherwise by rating
      sortStage = query 
        ? { score: { $meta: 'textScore' }, averageRating: -1 } 
        : { averageRating: -1, totalEnrollments: -1 };
  }

  // Build aggregation pipeline for optimized performance
  const pipeline = [
    { $match: matchStage },
    // Add text score if doing text search
    ...(query ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),
    { $sort: sortStage },
    { $skip: filters.skip || 0 },
    { $limit: filters.limit || 20 },
    // Lookup instructor details
    {
      $lookup: {
        from: 'users',
        localField: 'instructor',
        foreignField: '_id',
        as: 'instructor'
      }
    },
    { $unwind: '$instructor' },
    // Project only needed fields for better performance
    {
      $project: {
        title: 1,
        subtitle: 1,
        description: 1,
        category: 1,
        level: 1,
        price: 1,
        discount: 1,
        thumbnail: 1,
        averageRating: 1,
        totalReviews: 1,
        totalEnrollments: 1,
        enrollmentCount: 1,
        totalDuration: 1,
        totalLectures: 1,
        language: 1,
        createdAt: 1,
        updatedAt: 1,
        'instructor._id': 1,
        'instructor.name': 1,
        'instructor.email': 1,
        'instructor.profilePicture': 1,
        ...(query ? { score: 1 } : {})
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Pre-save middleware
courseSchema.pre('save', function(next) {
  this.calculateTotals();
  this.calculateAverageRating();
  this.totalEnrollments = this.enrollments.length;
  
  // Auto-generate tags from title and description if tags are empty
  if (!this.tags || this.tags.length === 0) {
    const text = `${this.title || ''} ${this.description || ''}`.toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'learn', 'course', 'tutorial'];
    const words = text.match(/\b\w{3,}\b/g) || [];
    this.tags = [...new Set(words.filter(word => !commonWords.includes(word)))].slice(0, 10);
  }
  
  next();
});

module.exports = mongoose.model('Course', courseSchema);