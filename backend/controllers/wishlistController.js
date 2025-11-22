const Wishlist = require('../models/Wishlist');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { createLogger } = require('../utils/logger');

const logger = createLogger('WISHLIST');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    logger.wishlist('GET_WISHLIST', req.user.id);

    // Validate user ID
    if (!req.user || !req.user.id) {
      logger.error('Invalid user ID in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'items.course',
        select: 'title thumbnail price category level rating reviewCount instructor isPublished',
        populate: {
          path: 'instructor',
          select: 'username profile'
        }
      });

    logger.debug('Wishlist query result:', wishlist ? 'found' : 'not found');

    if (!wishlist) {
      logger.info('Creating new wishlist for user:', req.user.id);
      wishlist = await Wishlist.create({ user: req.user.id, items: [] });
    }

    // Filter out any courses that might have been deleted or unpublished
    const originalLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(item => item.course && item.course.isPublished);
    
    if (originalLength !== wishlist.items.length) {
      logger.info(`Filtered ${originalLength - wishlist.items.length} invalid items from wishlist`);
      await wishlist.save();
    }

    logger.success('Wishlist retrieved successfully', { 
      userId: req.user.id, 
      itemCount: wishlist.items.length 
    });

    res.json({
      success: true,
      data: {
        wishlist,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    logger.error('Error getting wishlist', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

// @desc    Add course to wishlist
// @route   POST /api/wishlist/:courseId
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    logger.wishlist('ADD_TO_WISHLIST', req.user.id, courseId);

    // Validate inputs
    if (!req.user || !req.user.id) {
      logger.error('Invalid user ID in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!courseId) {
      logger.error('Course ID missing in request');
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Validate courseId format (MongoDB ObjectId)
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      logger.error('Invalid course ID format:', courseId);
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    // Check if course exists and is published
    logger.debug('Checking if course exists:', courseId);
    const course = await Course.findById(courseId);
    
    if (!course) {
      logger.warn('Course not found:', courseId);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      logger.warn('Course not published:', courseId);
      return res.status(404).json({
        success: false,
        message: 'Course not available'
      });
    }

    // Check if user already enrolled
    logger.debug('Checking enrollment status');
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });

    if (enrollment) {
      logger.info('User already enrolled in course', { userId: req.user.id, courseId });
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Get or create wishlist
    logger.debug('Fetching wishlist');
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      logger.info('Creating new wishlist for user');
      wishlist = await Wishlist.create({ user: req.user.id, items: [] });
    }

    // Check if already in wishlist before adding
    const existingItem = wishlist.items.find(item => item.course.toString() === courseId);
    if (existingItem) {
      logger.info('Course already in wishlist', { userId: req.user.id, courseId });
      return res.status(400).json({
        success: false,
        message: 'Course is already in your wishlist'
      });
    }

    // Add item to wishlist
    logger.debug('Adding item to wishlist');
    const result = wishlist.addItem(courseId);
    
    if (!result.success) {
      logger.warn('Failed to add item to wishlist:', result.message);
      return res.status(400).json(result);
    }

    await wishlist.save();
    logger.info('Wishlist saved successfully');

    // Populate the wishlist for response
    await wishlist.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: {
        path: 'instructor',
        select: 'username profile'
      }
    });

    logger.success('Course added to wishlist successfully', {
      userId: req.user.id,
      courseId,
      itemCount: wishlist.items.length
    });

    res.json({
      success: true,
      message: 'Course added to wishlist successfully',
      data: {
        wishlist,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    logger.error('Error adding to wishlist', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course to wishlist',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

// @desc    Remove course from wishlist
// @route   DELETE /api/wishlist/:courseId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    logger.wishlist('REMOVE_FROM_WISHLIST', req.user.id, courseId);

    // Validate inputs
    if (!req.user || !req.user.id) {
      logger.error('Invalid user ID in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!courseId) {
      logger.error('Course ID missing in request');
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      logger.warn('Wishlist not found for user:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    logger.debug('Removing item from wishlist');
    wishlist.removeItem(courseId);
    await wishlist.save();

    // Populate the wishlist for response
    await wishlist.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: {
        path: 'instructor',
        select: 'username profile'
      }
    });

    logger.success('Course removed from wishlist successfully', {
      userId: req.user.id,
      courseId,
      itemCount: wishlist.items.length
    });

    res.json({
      success: true,
      message: 'Course removed from wishlist successfully',
      data: {
        wishlist,
        itemCount: wishlist.items.length
      }
    });
  } catch (error) {
    logger.error('Error removing from wishlist', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course from wishlist',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

// @desc    Check if course is in wishlist
// @route   GET /api/wishlist/check/:courseId
// @access  Private
const checkWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    logger.wishlist('CHECK_WISHLIST', req.user.id, courseId);

    // Validate inputs
    if (!req.user || !req.user.id) {
      logger.error('Invalid user ID in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!courseId) {
      logger.error('Course ID missing in request');
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    const isInWishlist = wishlist 
      ? wishlist.items.some(item => item.course.toString() === courseId)
      : false;

    logger.debug('Wishlist check result:', { courseId, isInWishlist });

    res.json({
      success: true,
      data: {
        isInWishlist
      }
    });
  } catch (error) {
    logger.error('Error checking wishlist', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
};
