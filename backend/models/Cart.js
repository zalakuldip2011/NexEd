const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total price before saving
cartSchema.pre('save', function(next) {
  this.totalPrice = this.items.reduce((total, item) => total + item.price, 0);
  next();
});

// Method to add item to cart with enhanced validation
cartSchema.methods.addItem = function(courseId, price) {
  // Enhanced duplicate detection
  const existingItem = this.items.find(item => 
    item.course && item.course.toString() === courseId.toString()
  );
  
  if (existingItem) {
    return { 
      success: false, 
      message: 'Course already in cart',
      code: 'DUPLICATE_ITEM'
    };
  }
  
  // Validate price
  if (price < 0 || price > 100000) {
    return {
      success: false,
      message: 'Invalid price value',
      code: 'INVALID_PRICE'
    };
  }
  
  // Add with timestamp for better tracking
  this.items.push({ 
    course: courseId, 
    price,
    addedAt: new Date()
  });
  
  return { 
    success: true, 
    message: 'Course added to cart successfully',
    itemCount: this.items.length
  };
};

// Method to remove item from cart with enhanced validation
cartSchema.methods.removeItem = function(courseId) {
  const initialLength = this.items.length;
  
  this.items = this.items.filter(item => 
    item.course && item.course.toString() !== courseId.toString()
  );
  
  const removed = initialLength > this.items.length;
  
  return { 
    success: true, 
    message: removed ? 'Course removed from cart successfully' : 'Course was not in cart',
    removed,
    itemCount: this.items.length
  };
};

// Method to clear cart with enhanced tracking
cartSchema.methods.clearCart = function() {
  const clearedCount = this.items.length;
  this.items = [];
  this.totalPrice = 0;
  
  return {
    success: true,
    message: 'Cart cleared successfully',
    clearedCount
  };
};

// Method to validate cart items (check for invalid courses)
cartSchema.methods.validateItems = async function() {
  const Course = require('./Course');
  const validItems = [];
  const removedItems = [];
  
  for (const item of this.items) {
    try {
      const course = await Course.findById(item.course)
        .select('isPublished price')
        .lean();
        
      if (course && course.isPublished) {
        // Update price if changed
        if (item.price !== course.price) {
          item.price = course.price;
        }
        validItems.push(item);
      } else {
        removedItems.push(item);
      }
    } catch (error) {
      removedItems.push(item);
    }
  }
  
  this.items = validItems;
  
  return {
    validItems: validItems.length,
    removedItems: removedItems.length,
    updated: removedItems.length > 0
  };
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
