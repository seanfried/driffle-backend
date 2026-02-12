const { Coupon, Cart } = require('../models');
const { validationResult } = require('express-validator');

// Create a new coupon
const createCoupon = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { code, discountType, discountValue, minPurchaseAmount, endDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      endDate,
      usageLimit,
      createdBy: req.user._id
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating coupon' });
  }
};

// Get all coupons (Admin)
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching coupons' });
  }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting coupon' });
  }
};

// Validate and apply coupon to cart
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user ? req.user._id : null;
    // Guest cart handling logic would go here if we supported guest carts fully with coupons
    // For now, assume logged in user or cart ID passed
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'Coupon is expired or inactive' });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Check minimum purchase amount
    const subtotal = cart.items.reduce((sum, item) => {
        const price = item.product.pricing.salePrice || item.product.pricing.basePrice;
        return sum + (price * item.quantity);
    }, 0);

    if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum purchase of €${coupon.minPurchaseAmount} required for this coupon` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    // This is a simulation of applying it. In a real app, you might save the coupon to the Cart model.
    // For simplicity, we'll return the calculated discount to the frontend.
    
    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discountAmount,
        finalTotal: subtotal - discountAmount
      }
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ success: false, message: 'Server error while applying coupon' });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  deleteCoupon,
  applyCoupon
};
