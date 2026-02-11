const express = require('express');
const { body, param } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCarts
} = require('../controllers/cartController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10')
];

const updateCartItemValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 0, max: 10 })
    .withMessage('Quantity must be between 0 and 10')
];

const removeFromCartValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Valid product ID is required')
];

// Cart routes
router.get('/cart', optionalAuth, getCart);
router.post('/cart/items', optionalAuth, addToCartValidation, addToCart);
router.put('/cart/items/:productId', optionalAuth, updateCartItemValidation, updateCartItem);
router.delete('/cart/items/:productId', optionalAuth, removeFromCartValidation, removeFromCart);
router.delete('/cart', optionalAuth, clearCart);
router.post('/cart/merge', authMiddleware, mergeCarts);

module.exports = router;