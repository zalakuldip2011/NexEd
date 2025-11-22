const Cart = require('../models/Cart');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    console.log('🛒 GET CART for user:', req.user.id);

    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.course',
        select: 'title thumbnail price category level rating reviewCount instructor',
        populate: {
          path: 'instructor',
          select: 'username profile'
        }
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out any courses that might have been deleted or unpublished
    cart.items = cart.items.filter(item => item.course && item.course.isPublished);
    await cart.save();

    console.log('   ✅ Cart retrieved:', cart.items.length, 'items');

    res.json({
      success: true,
      data: {
        cart,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// @desc    Add course to cart
// @route   POST /api/cart/:courseId
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('🛒 ADD TO CART - User:', req.user.id, 'Course:', courseId);

    // Enhanced validation
    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    // Check if course exists and is published with enhanced error handling
    const course = await Course.findById(courseId).select('title price isPublished category level');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This course is not available for purchase'
      });
    }

    // Check if course is free with more descriptive message
    if (course.price === 0 || course.price === null) {
      return res.status(400).json({
        success: false,
        message: 'This is a free course. You can enroll directly without adding to cart.'
      });
    }

    // Validate price is reasonable (additional safety check)
    if (course.price < 0 || course.price > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course price detected'
      });
    }

    // Check if user already enrolled with better error message
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    }).lean();

    if (enrollment) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course. Check "My Learning" to access it.'
      });
    }

    // Get or create cart with optimized query
    let cart = await Cart.findOne({ user: req.user.id }).lean();
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    } else {
      // Convert back to mongoose document for methods
      cart = await Cart.findById(cart._id);
    }

    // Add item to cart with enhanced result handling
    const result = cart.addItem(courseId, course.price);
    
    if (!result.success) {
      return res.status(409).json({
        success: false,
        message: 'This course is already in your cart'
      });
    }

    await cart.save();

    // Populate the cart for response
    await cart.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: {
        path: 'instructor',
        select: 'username profile'
      }
    });

    console.log('   ✅ Course added to cart');

    res.json({
      success: true,
      message: 'Course added to cart successfully',
      data: {
        cart,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course to cart',
      error: error.message
    });
  }
};

// @desc    Remove course from cart
// @route   DELETE /api/cart/:courseId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('🛒 REMOVE FROM CART - User:', req.user.id, 'Course:', courseId);

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.removeItem(courseId);
    await cart.save();

    // Populate the cart for response
    await cart.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: {
        path: 'instructor',
        select: 'username profile'
      }
    });

    console.log('   ✅ Course removed from cart');

    res.json({
      success: true,
      message: 'Course removed from cart successfully',
      data: {
        cart,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course from cart',
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    console.log('🛒 CLEAR CART for user:', req.user.id);

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.clearCart();
    await cart.save();

    console.log('   ✅ Cart cleared');

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart,
        itemCount: 0
      }
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

// @desc    Merge guest cart with server cart
// @route   POST /api/cart/merge
// @access  Private
const mergeGuestCart = async (req, res) => {
  try {
    const { guestItems } = req.body;
    console.log('🛒 MERGE GUEST CART - User:', req.user.id, 'Guest items:', guestItems?.length || 0);

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      // No guest items to merge, just return server cart
      let cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
      }
      
      await cart.populate({
        path: 'items.course',
        select: 'title thumbnail price category level rating reviewCount instructor',
        populate: { path: 'instructor', select: 'username profile' }
      });
      
      return res.json({
        success: true,
        message: 'No guest items to merge',
        data: { cart, itemCount: cart.items.length }
      });
    }

    // Get or create server cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Get existing course IDs in server cart
    const serverCourseIds = new Set(
      cart.items.map(item => item.course.toString())
    );

    // Add guest items that are not already in server cart
    let addedCount = 0;
    for (const guestItem of guestItems) {
      const courseId = guestItem.course?._id || guestItem.course;
      
      if (courseId && !serverCourseIds.has(courseId.toString())) {
        try {
          // Verify course exists
          const course = await Course.findById(courseId);
          if (course && course.isPublished && course.price > 0) {
            // Check if user is not already enrolled
            const enrollment = await Enrollment.findOne({
              user: req.user.id,
              course: courseId
            });
            
            if (!enrollment) {
              cart.items.push({
                course: courseId,
                price: guestItem.price || course.price,
                addedAt: guestItem.addedAt || new Date()
              });
              addedCount++;
            }
          }
        } catch (err) {
          console.warn('Error adding guest item:', courseId, err.message);
        }
      }
    }

    await cart.save();

    // Populate the cart for response
    await cart.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: { path: 'instructor', select: 'username profile' }
    });

    console.log(`   ✅ Merged cart - Added ${addedCount} new items, Total: ${cart.items.length}`);

    res.json({
      success: true,
      message: `Cart merged successfully. Added ${addedCount} new items.`,
      data: { cart, itemCount: cart.items.length, addedCount }
    });
  } catch (error) {
    console.error('❌ Error merging cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error merging cart',
      error: error.message
    });
  }
};

// @desc    Bulk add courses to cart
// @route   POST /api/cart/bulk-add
// @access  Private
const bulkAddToCart = async (req, res) => {
  try {
    const { courseIds } = req.body;
    console.log('🛒 BULK ADD TO CART - User:', req.user.id, 'Courses:', courseIds?.length || 0);
    
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs array is required'
      });
    }
    
    // Validate course IDs format
    const validIds = courseIds.filter(id => id && id.match(/^[0-9a-fA-F]{24}$/));
    if (validIds.length !== courseIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format detected'
      });
    }
    
    // Get valid courses
    const courses = await Course.find({
      _id: { $in: validIds },
      isPublished: true,
      price: { $gt: 0 }
    }).select('title price').lean();
    
    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid courses found'
      });
    }
    
    // Check existing enrollments
    const enrollments = await Enrollment.find({
      user: req.user.id,
      course: { $in: validIds },
      status: { $in: ['active', 'completed'] }
    }).select('course').lean();
    
    const enrolledCourseIds = new Set(enrollments.map(e => e.course.toString()));
    
    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    let addedCount = 0;
    const results = [];
    
    for (const course of courses) {
      if (enrolledCourseIds.has(course._id.toString())) {
        results.push({
          courseId: course._id,
          success: false,
          message: 'Already enrolled'
        });
        continue;
      }
      
      const result = cart.addItem(course._id, course.price);
      if (result.success) {
        addedCount++;
      }
      results.push({
        courseId: course._id,
        ...result
      });
    }
    
    await cart.save();
    
    // Populate cart for response
    await cart.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: {
        path: 'instructor',
        select: 'username profile'
      }
    });
    
    res.json({
      success: true,
      message: `Bulk operation completed. Added ${addedCount} courses to cart.`,
      data: {
        cart,
        addedCount,
        results
      }
    });
  } catch (error) {
    console.error('❌ Error in bulk add to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding courses to cart',
      error: error.message
    });
  }
};

// @desc    Validate cart items
// @route   POST /api/cart/validate
// @access  Private
const validateCart = async (req, res) => {
  try {
    console.log('🛒 VALIDATE CART - User:', req.user.id);
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.json({
        success: true,
        message: 'No cart to validate',
        data: { valid: true }
      });
    }
    
    const validation = await cart.validateItems();
    
    if (validation.updated) {
      await cart.save();
    }
    
    // Populate updated cart
    await cart.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: {
        path: 'instructor',
        select: 'username profile'
      }
    });
    
    res.json({
      success: true,
      message: validation.updated ? 'Cart validated and updated' : 'Cart is valid',
      data: {
        cart,
        validation
      }
    });
  } catch (error) {
    console.error('❌ Error validating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating cart',
      error: error.message
    });
  }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).select('items totalPrice').lean();
    
    if (!cart) {
      return res.json({
        success: true,
        data: {
          itemCount: 0,
          totalPrice: 0
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        itemCount: cart.items.length,
        totalPrice: cart.totalPrice
      }
    });
  } catch (error) {
    console.error('❌ Error getting cart summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cart summary',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeGuestCart,
  bulkAddToCart,
  validateCart,
  getCartSummary
};
