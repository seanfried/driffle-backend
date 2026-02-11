const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  requestRefund,
  getOrderStats
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

const createOrderValidation = [
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method ID is required'),
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('billingAddress')
    .optional()
    .isObject()
    .withMessage('Billing address must be an object'),
  body('promotionCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Promotion code must be between 3 and 20 characters')
];

const updateOrderStatusValidation = [
  param('orderNumber')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Valid order number is required'),
  body('status')
    .isIn(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters')
];

const requestRefundValidation = [
  param('orderNumber')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Valid order number is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be a positive number'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Refund reason must be between 10 and 500 characters')
];

const getOrdersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid payment status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const getOrderValidation = [
  param('orderNumber')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Valid order number is required')
];

// Order routes
router.post('/orders', authMiddleware, createOrderValidation, createOrder);
router.get('/orders', authMiddleware, getOrdersValidation, getOrders);
router.get('/orders/stats', authMiddleware, getOrderStats);
router.get('/orders/:orderNumber', authMiddleware, getOrderValidation, getOrder);
router.put('/orders/:orderNumber/status', authMiddleware, adminMiddleware, updateOrderStatusValidation, updateOrderStatus);
router.post('/orders/:orderNumber/refund', authMiddleware, requestRefundValidation, requestRefund);

module.exports = router;