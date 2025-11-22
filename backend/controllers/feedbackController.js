const Feedback = require('../models/Feedback');
const { validationResult } = require('express-validator');

// Public endpoints

// Submit feedback
const submitFeedback = async (req, res) => {
  try {
    console.log('📝 SUBMIT FEEDBACK');
    console.log('   Request body:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, rating, title, message, type } = req.body;

    // Create feedback
    const feedback = new Feedback({
      user: req.user?.id || null, // Add user if authenticated
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating,
      title: title.trim(),
      message: message.trim(),
      type: type || 'website_experience',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await feedback.save();

    console.log('   ✅ Feedback saved:', feedback._id);

    res.status(201).json({
      success: true,
      message: rating >= 4 
        ? 'Thank you for your feedback! Your review is now live on our homepage.'
        : 'Thank you for your feedback! We\'ll review it and it may appear on our homepage soon.',
      data: {
        id: feedback._id,
        status: feedback.status
      }
    });

  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get public feedback for homepage
const getPublicFeedback = async (req, res) => {
  try {
    console.log('🏠 GET PUBLIC FEEDBACK');
    
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || 'website_experience';

    const feedback = await Feedback.find({
      status: { $in: ['approved', 'featured'] },
      isPublic: true,
      type: type
    })
    .select('name rating title message createdAt isFeatured')
    .sort({ createdAt: -1, isFeatured: -1, rating: -1 })
    .limit(limit);

    console.log('   ✅ Found', feedback.length, 'public feedback items');

    res.json({
      success: true,
      data: {
        feedback,
        total: feedback.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching public feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get featured feedback
const getFeaturedFeedback = async (req, res) => {
  try {
    console.log('⭐ GET FEATURED FEEDBACK');
    
    const limit = parseInt(req.query.limit) || 6;

    const feedback = await Feedback.getFeaturedFeedback(limit);

    console.log('   ✅ Found', feedback.length, 'featured feedback items');

    res.json({
      success: true,
      data: {
        feedback,
        total: feedback.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching featured feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin endpoints (require admin role)

// Get all feedback for admin
const getAllFeedback = async (req, res) => {
  try {
    console.log('👑 GET ALL FEEDBACK (ADMIN)');
    
    const { 
      status, 
      type, 
      rating, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (rating) filters.rating = parseInt(rating);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedback = await Feedback.find(filters)
      .populate('user', 'username email')
      .populate('moderatedBy', 'username email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filters);

    console.log('   ✅ Found', feedback.length, 'feedback items (', total, 'total)');

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching all feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update feedback status (approve/reject/feature)
const updateFeedbackStatus = async (req, res) => {
  try {
    console.log('🔄 UPDATE FEEDBACK STATUS');
    console.log('   Feedback ID:', req.params.id);
    console.log('   New status:', req.body.status);

    const { status, adminNotes, isFeatured } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update feedback
    feedback.status = status;
    feedback.moderatedBy = req.user.id;
    feedback.moderatedAt = new Date();
    
    if (adminNotes) {
      feedback.adminNotes = adminNotes;
    }
    
    if (isFeatured !== undefined) {
      feedback.isFeatured = isFeatured;
    }

    await feedback.save();

    console.log('   ✅ Feedback status updated');

    res.json({
      success: true,
      message: `Feedback ${status} successfully`,
      data: feedback
    });

  } catch (error) {
    console.error('❌ Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    console.log('🗑️  DELETE FEEDBACK');
    console.log('   Feedback ID:', req.params.id);

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    console.log('   ✅ Feedback deleted');

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    console.log('📊 GET FEEDBACK STATS');

    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          featuredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'featured'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const typeDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('   ✅ Feedback stats calculated');

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalFeedback: 0,
          averageRating: 0,
          pendingCount: 0,
          approvedCount: 0,
          featuredCount: 0,
          rejectedCount: 0
        },
        ratingDistribution,
        typeDistribution
      }
    });

  } catch (error) {
    console.error('❌ Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  // Public endpoints
  submitFeedback,
  getPublicFeedback,
  getFeaturedFeedback,
  
  // Admin endpoints
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats
};