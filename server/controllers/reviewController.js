const { Review, Product, Order } = require('../models');
const { validationResult } = require('express-validator');

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed the product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed'
      });
    }

    // Optional: Check if user purchased the product
    // const hasPurchased = await Order.findOne({
    //   user: req.user._id,
    //   'items.product': productId,
    //   status: 'confirmed' // or delivered
    // });
    // if (!hasPurchased) {
    //   return res.status(400).json({ message: 'You must purchase the product to review it' });
    // }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review added',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ product: productId, status: 'approved' })
      .populate('user', 'firstName lastName avatar')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({ product: productId, status: 'approved' });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          pages: Math.ceil(count / limit),
          count
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await review.deleteOne(); // This triggers the post remove hook

    res.json({
      success: true,
      message: 'Review removed'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview
};