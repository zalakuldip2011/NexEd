const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeGuestCart,
  bulkAddToCart,
  validateCart,
  getCartSummary
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(protect);

// Cart operations - Enhanced with new endpoints
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/', replaceCart);
router.post('/merge', mergeGuestCart);
router.post('/validate', validateCart);
router.post('/bulk-add', bulkAddToCart);
router.post('/:courseId', addToCart);
router.delete('/:courseId', removeFromCart);
router.delete('/', clearCart);

// Replace entire cart (for syncing from client)
async function replaceCart(req, res) {
  try {
    const Cart = require('../models/Cart');
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    cart.items = items;
    await cart.save();
    
    await cart.populate({
      path: 'items.course',
      select: 'title thumbnail price category level rating reviewCount instructor',
      populate: { path: 'instructor', select: 'username profile' }
    });
    
    res.json({ success: true, data: { cart } });
  } catch (error) {
    console.error('Error replacing cart:', error);
    res.status(500).json({ success: false, message: 'Error updating cart' });
  }
}

module.exports = router;
