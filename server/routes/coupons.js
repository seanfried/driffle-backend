const express = require('express');
const { createCoupon, getCoupons, deleteCoupon, applyCoupon } = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { check } = require('express-validator');

const router = express.Router();

// Admin routes
router.post(
  '/',
  [
    authMiddleware,
    adminMiddleware,
    check('code', 'Code is required').not().isEmpty(),
    check('discountValue', 'Discount value is required').isNumeric(),
    check('endDate', 'End date is required').not().isEmpty()
  ],
  createCoupon
);

router.get('/', authMiddleware, adminMiddleware, getCoupons);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon);

// Public/User route to apply coupon
router.post('/apply', authMiddleware, applyCoupon);

module.exports = router;
