const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getSaleProducts,
  getCategories,
  getPlatforms,
  updateInventory,
  uploadProductImage
} = require('../controllers/productController');
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const createProductValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('type')
    .isIn(['game', 'gift-card', 'dlc', 'subscription'])
    .withMessage('Type must be one of: game, gift-card, dlc, subscription'),
  body('category')
    .isIn(['action', 'adventure', 'rpg', 'strategy', 'sports', 'racing', 'simulation', 'puzzle', 'platform', 'fighting', 'shooter', 'indie', 'mmo', 'gift-card'])
    .withMessage('Invalid category'),
  body('platform')
    .isIn(['steam', 'epic-games', 'xbox', 'playstation', 'nintendo', 'origin', 'uplay', 'gog', 'battlenet', 'generic'])
    .withMessage('Invalid platform'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('inventory.sku')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'discontinued'])
    .withMessage('Invalid status')
];

const updateProductValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'discontinued'])
    .withMessage('Invalid status')
];

const updateInventoryValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('codes')
    .optional()
    .isArray()
    .withMessage('Codes must be an array'),
  body('codes.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Each code must be at least 1 character')
];

// Public routes
router.get('/products', getProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/sale', getSaleProducts);
router.get('/products/categories', getCategories);
router.get('/products/platforms', getPlatforms);
router.get('/products/:slug', getProduct);
router.get('/products/:id/reviews', getProductReviews);

// Protected routes
router.post('/products/:id/reviews', authMiddleware, createReview);

// Admin routes
router.post('/products', authMiddleware, adminMiddleware, createProductValidation, createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, updateProductValidation, updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, deleteProduct);
router.put('/products/:id/inventory', authMiddleware, adminMiddleware, updateInventoryValidation, updateInventory);
router.post('/products/:id/images', authMiddleware, adminMiddleware, upload.single('image'), uploadProductImage);

module.exports = router;