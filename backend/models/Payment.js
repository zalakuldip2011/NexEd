const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    uppercase: true,
    enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'razorpay', 'card', 'wallet', 'free'],
    required: true,
    index: true
  },
  paymentProvider: {
    type: String,
    enum: ['paypal', 'razorpay', 'manual', 'free'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  paymentDetails: {
    // PayPal-specific
    paypalOrderId: String,
    paypalPayerId: String,
    
    // Razorpay-specific
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentMethod: String, // card, netbanking, upi, wallet, etc.
    
    // Card details (partial, for display)
    cardBrand: String,
    cardLast4: String,
    cardExpMonth: Number,
    cardExpYear: Number,
    
    // Billing details
    billingEmail: String,
    billingName: String,
    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  pricing: {
    originalPrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    couponCode: {
      type: String,
      uppercase: true
    },
    couponDiscount: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      required: true
    }
  },
  revenue: {
    instructorShare: {
      type: Number,
      default: 0
    },
    platformShare: {
      type: Number,
      default: 0
    },
    instructorSharePercentage: {
      type: Number,
      default: 70 // Default 70% to instructor, 30% to platform
    }
  },
  refundInfo: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: {
      type: String,
      enum: ['', 'customer_request', 'duplicate', 'fraudulent', 'course_issue', 'technical_issue', 'other'],
      default: ''
    },
    refundDetails: String,
    refundedAt: Date,
    refundTransactionId: String,
    refundedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  receipt: {
    receiptUrl: String,
    receiptNumber: String,
    invoiceNumber: String,
    invoiceUrl: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    device: String,
    browser: String,
    country: String,
    region: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment'
  },
  processedAt: {
    type: Date
  },
  completedAt: {
    type: Date,
    index: true
  },
  failedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  webhookEvents: [{
    eventType: String,
    eventId: String,
    receivedAt: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ instructor: 1, status: 1 });
paymentSchema.index({ course: 1, status: 1 });
paymentSchema.index({ status: 1, completedAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for isPaid
paymentSchema.virtual('isPaid').get(function() {
  return this.status === 'completed';
});

// Virtual for isRefundable
paymentSchema.virtual('isRefundable').get(function() {
  if (this.status !== 'completed' || this.refundInfo.isRefunded) {
    return false;
  }
  
  // Allow refunds within 30 days
  const daysSincePurchase = Math.floor(
    (Date.now() - this.completedAt) / (1000 * 60 * 60 * 24)
  );
  
  return daysSincePurchase <= 30;
});

// Virtual for daysSincePurchase
paymentSchema.virtual('daysSincePurchase').get(function() {
  if (!this.completedAt) return null;
  
  return Math.floor(
    (Date.now() - this.completedAt) / (1000 * 60 * 60 * 24)
  );
});

// Methods

/**
 * Mark payment as completed
 */
paymentSchema.methods.complete = async function(transactionId = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.processedAt = new Date();
  
  if (transactionId) {
    this.transactionId = transactionId;
  }
  
  // Calculate revenue split
  const instructorPercentage = this.revenue.instructorSharePercentage || 70;
  this.revenue.instructorShare = Math.round(
    (this.pricing.finalAmount * instructorPercentage) / 100 * 100
  ) / 100;
  this.revenue.platformShare = Math.round(
    (this.pricing.finalAmount - this.revenue.instructorShare) * 100
  ) / 100;
  
  await this.save();
  
  // Create enrollment
  const Enrollment = mongoose.model('Enrollment');
  const enrollment = await Enrollment.create({
    student: this.student,
    course: this.course,
    instructor: this.instructor,
    payment: this._id,
    metadata: {
      enrollmentSource: 'direct_purchase',
      device: this.metadata.device,
      ipAddress: this.metadata.ipAddress
    }
  });
  
  this.enrollment = enrollment._id;
  await this.save();
  
  // Update instructor earnings
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.instructor, {
    $inc: {
      'instructorProfile.earnings.total': this.revenue.instructorShare,
      'instructorProfile.earnings.pending': this.revenue.instructorShare
    }
  });
  
  return this;
};

/**
 * Mark payment as failed
 */
paymentSchema.methods.fail = function(reason = '') {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  
  return this.save();
};

/**
 * Process refund
 */
paymentSchema.methods.refund = async function(refundAmount, reason, refundedBy, details = '') {
  if (this.status !== 'completed') {
    throw new Error('Only completed payments can be refunded');
  }
  
  if (this.refundInfo.isRefunded) {
    throw new Error('Payment has already been refunded');
  }
  
  if (refundAmount > this.pricing.finalAmount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.refundInfo.isRefunded = true;
  this.refundInfo.refundAmount = refundAmount;
  this.refundInfo.refundReason = reason;
  this.refundInfo.refundDetails = details;
  this.refundInfo.refundedAt = new Date();
  this.refundInfo.refundedBy = refundedBy;
  this.status = 'refunded';
  
  await this.save();
  
  // Update instructor earnings
  const User = mongoose.model('User');
  const instructorRefund = Math.round(
    (refundAmount * this.revenue.instructorSharePercentage) / 100 * 100
  ) / 100;
  
  await User.findByIdAndUpdate(this.instructor, {
    $inc: {
      'instructorProfile.earnings.total': -instructorRefund,
      'instructorProfile.earnings.pending': -instructorRefund
    }
  });
  
  // Update or remove enrollment
  if (this.enrollment) {
    const Enrollment = mongoose.model('Enrollment');
    await Enrollment.findByIdAndUpdate(this.enrollment, {
      status: 'refunded'
    });
  }
  
  return this;
};

/**
 * Add webhook event
 */
paymentSchema.methods.addWebhookEvent = function(eventType, eventId, data = {}) {
  this.webhookEvents.push({
    eventType,
    eventId,
    receivedAt: new Date(),
    data
  });
  
  return this.save();
};

/**
 * Generate receipt
 */
paymentSchema.methods.generateReceipt = function() {
  const crypto = require('crypto');
  
  const receiptNumber = `REC-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  
  this.receipt.receiptNumber = receiptNumber;
  this.receipt.invoiceNumber = invoiceNumber;
  this.receipt.receiptUrl = `/api/payments/${this._id}/receipt`;
  this.receipt.invoiceUrl = `/api/payments/${this._id}/invoice`;
  
  return this.save();
};

// Static Methods

/**
 * Create payment for course purchase
 */
paymentSchema.statics.createPayment = async function(data) {
  const {
    studentId,
    courseId,
    paymentMethod,
    paymentProvider,
    couponCode = null,
    metadata = {}
  } = data;
  
  // Get course details
  const Course = mongoose.model('Course');
  const course = await Course.findById(courseId).populate('instructor');
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Calculate pricing
  const originalPrice = course.price || 0;
  let discount = course.discount || 0;
  let couponDiscount = 0;
  
  // Apply coupon if provided
  if (couponCode) {
    // TODO: Implement coupon validation
    // For now, just using a placeholder
    couponDiscount = 10; // 10% additional discount
  }
  
  const subtotal = originalPrice * (1 - discount / 100);
  const finalDiscount = subtotal * (couponDiscount / 100);
  const taxRate = 0; // TODO: Calculate based on location
  const tax = 0;
  const platformFee = 0;
  const finalAmount = Math.round((subtotal - finalDiscount + tax) * 100) / 100;
  
  // Create payment
  const payment = await this.create({
    student: studentId,
    course: courseId,
    instructor: course.instructor._id,
    amount: finalAmount,
    currency: 'INR',
    paymentMethod,
    paymentProvider,
    status: paymentMethod === 'free' ? 'completed' : 'pending',
    pricing: {
      originalPrice,
      discount,
      couponCode,
      couponDiscount,
      subtotal,
      tax,
      taxRate,
      platformFee,
      finalAmount: paymentMethod === 'free' ? 0 : finalAmount
    },
    metadata
  });
  
  // Auto-complete free courses
  if (paymentMethod === 'free' && finalAmount === 0) {
    await payment.complete();
  }
  
  return payment;
};

/**
 * Get student's payment history
 */
paymentSchema.statics.getStudentPayments = function(studentId, options = {}) {
  const {
    status,
    sort = 'recent',
    limit = 20,
    skip = 0
  } = options;
  
  const query = { student: studentId };
  
  if (status) {
    query.status = status;
  }
  
  let sortQuery = {};
  switch (sort) {
    case 'recent':
      sortQuery = { createdAt: -1 };
      break;
    case 'amount':
      sortQuery = { 'pricing.finalAmount': -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }
  
  return this.find(query)
    .populate('course', 'title thumbnail instructor')
    .populate('instructor', 'username profile.firstName profile.lastName')
    .sort(sortQuery)
    .limit(limit)
    .skip(skip);
};

/**
 * Get instructor's revenue
 */
paymentSchema.statics.getInstructorRevenue = async function(instructorId, options = {}) {
  const {
    startDate,
    endDate,
    status = 'completed'
  } = options;
  
  const matchQuery = {
    instructor: mongoose.Types.ObjectId(instructorId),
    status
  };
  
  if (startDate || endDate) {
    matchQuery.completedAt = {};
    if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
    if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
  }
  
  const result = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$revenue.instructorShare' },
        totalSales: { $sum: 1 },
        avgOrderValue: { $avg: '$pricing.finalAmount' }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      totalRevenue: 0,
      totalSales: 0,
      avgOrderValue: 0
    };
  }
  
  return result[0];
};

/**
 * Get course revenue stats
 */
paymentSchema.statics.getCourseRevenue = async function(courseId) {
  const result = await this.aggregate([
    {
      $match: {
        course: mongoose.Types.ObjectId(courseId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.finalAmount' },
        instructorRevenue: { $sum: '$revenue.instructorShare' },
        platformRevenue: { $sum: '$revenue.platformShare' },
        totalSales: { $sum: 1 },
        avgOrderValue: { $avg: '$pricing.finalAmount' }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      totalRevenue: 0,
      instructorRevenue: 0,
      platformRevenue: 0,
      totalSales: 0,
      avgOrderValue: 0
    };
  }
  
  return result[0];
};

/**
 * Get platform revenue stats
 */
paymentSchema.statics.getPlatformRevenue = async function(startDate, endDate) {
  const matchQuery = {
    status: 'completed'
  };
  
  if (startDate || endDate) {
    matchQuery.completedAt = {};
    if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
    if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
  }
  
  const result = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.finalAmount' },
        platformRevenue: { $sum: '$revenue.platformShare' },
        instructorRevenue: { $sum: '$revenue.instructorShare' },
        totalSales: { $sum: 1 },
        totalRefunds: {
          $sum: { $cond: ['$refund.isRefunded', '$refund.refundAmount', 0] }
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      totalRevenue: 0,
      platformRevenue: 0,
      instructorRevenue: 0,
      totalSales: 0,
      totalRefunds: 0,
      netRevenue: 0
    };
  }
  
  const stats = result[0];
  stats.netRevenue = stats.totalRevenue - stats.totalRefunds;
  
  return stats;
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate transaction ID if completed and doesn't have one
  if (this.status === 'completed' && !this.transactionId) {
    const crypto = require('crypto');
    this.transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  
  // Generate receipt if completed and doesn't have one
  if (this.status === 'completed' && !this.receipt.receiptNumber) {
    const crypto = require('crypto');
    this.receipt.receiptNumber = `REC-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    this.receipt.invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
