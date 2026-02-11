const { Product, Review } = require('../models');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      platform,
      type,
      minPrice,
      maxPrice,
      search,
      isFeatured,
      isOnSale,
      genre,
      rating
    } = req.query;

    const query = { status: 'active' };
    
    if (category) query.category = category;
    if (platform) query.platform = platform;
    if (type) query.type = type;
    if (genre) query.genre = { $in: genre.split(',') };
    if (isFeatured === 'true') query.isFeatured = true;
    if (isOnSale === 'true') query.isOnSale = true;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
    }
    
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedProducts', 'title images pricing.slug')
      .lean();

    const total = await Product.countDocuments(query);
    
    const productsWithPrices = products.map(product => ({
      ...product,
      finalPrice: product.pricing.salePrice || product.pricing.basePrice,
      isInStock: product.inventory.type === 'unlimited' || product.inventory.quantity > 0,
      userPrice: req.user ? product.getPriceForUser(req.user.isPlusMember) : product.finalPrice
    }));

    res.json({
      success: true,
      data: {
        products: productsWithPrices,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ slug, status: 'active' })
      .populate('relatedProducts', 'title images pricing.slug inventory')
      .lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });
    
    const reviews = await Review.find({ product: product._id, status: 'approved' })
      .populate('user', 'firstName lastName avatar')
      .sort('-createdAt')
      .limit(10)
      .lean();

    const productWithDetails = {
      ...product,
      finalPrice: product.pricing.salePrice || product.pricing.basePrice,
      isInStock: product.inventory.type === 'unlimited' || product.inventory.quantity > 0,
      userPrice: req.user ? product.getPriceForUser(req.user.isPlusMember) : product.finalPrice,
      reviews
    };

    res.json({
      success: true,
      data: {
        product: productWithDetails
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { addedKeys, ...otherData } = req.body;

    const productData = {
      ...otherData,
      createdBy: req.user._id
    };

    // Handle initial codes for limited inventory
    if (productData.inventory && productData.inventory.type === 'limited' && addedKeys && Array.isArray(addedKeys)) {
      const newCodes = addedKeys.map(code => ({
        code,
        isUsed: false
      }));
      
      productData.inventory.codes = newCodes;
      productData.inventory.quantity = newCodes.length;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { addedKeys, ...otherData } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {
      ...otherData,
      lastModifiedBy: req.user._id
    };

    // Handle adding new keys
    if (updateData.inventory && updateData.inventory.type === 'limited' && addedKeys && Array.isArray(addedKeys) && addedKeys.length > 0) {
      const newCodes = addedKeys.map(code => ({
        code,
        isUsed: false
      }));
      
      // Initialize codes array if it doesn't exist
      if (!product.inventory.codes) {
        product.inventory.codes = [];
      }
      
      product.inventory.codes.push(...newCodes);
      
      // Update quantity based on total unused codes
      // We need to merge existing codes with new ones before counting, but since we pushed, it's done.
      // However, if we are changing type from unlimited to limited, we might need to reset quantity.
    }
    
    // Apply updates
    Object.assign(product, updateData);
    
    // Recalculate quantity if limited
    if (product.inventory.type === 'limited') {
       const unusedCodes = product.inventory.codes ? product.inventory.codes.filter(c => !c.isUsed).length : 0;
       product.inventory.quantity = unusedCodes;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.status = 'discontinued';
    await product.save();

    res.json({
      success: true,
      message: 'Product discontinued successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while discontinuing product'
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8, category, platform } = req.query;
    
    const query = { 
      status: 'active', 
      isFeatured: true 
    };
    
    if (category) query.category = category;
    if (platform) query.platform = platform;

    const products = await Product.find(query)
      .sort('-createdAt')
      .limit(Number(limit))
      .lean();

    const productsWithPrices = products.map(product => ({
      ...product,
      finalPrice: product.pricing.salePrice || product.pricing.basePrice,
      isInStock: product.inventory.type === 'unlimited' || product.inventory.quantity > 0,
      userPrice: req.user ? product.getPriceForUser(req.user.isPlusMember) : product.finalPrice
    }));

    res.json({
      success: true,
      data: {
        products: productsWithPrices
      }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products'
    });
  }
};

const getSaleProducts = async (req, res) => {
  try {
    const { limit = 8, category, platform } = req.query;
    
    const query = { 
      status: 'active', 
      isOnSale: true,
      $or: [
        { 'pricing.salePrice': { $exists: true, $ne: null } },
        { 'pricing.discountPercentage': { $gt: 0 } }
      ]
    };
    
    if (category) query.category = category;
    if (platform) query.platform = platform;

    const products = await Product.find(query)
      .sort('-pricing.discountPercentage')
      .limit(Number(limit))
      .lean();

    const productsWithPrices = products.map(product => ({
      ...product,
      finalPrice: product.pricing.salePrice || product.pricing.basePrice,
      isInStock: product.inventory.type === 'unlimited' || product.inventory.quantity > 0,
      userPrice: req.user ? product.getPriceForUser(req.user.isPlusMember) : product.finalPrice
    }));

    res.json({
      success: true,
      data: {
        products: productsWithPrices
      }
    });
  } catch (error) {
    console.error('Get sale products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sale products'
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' });
    
    res.json({
      success: true,
      data: {
        categories: categories.sort()
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

const getPlatforms = async (req, res) => {
  try {
    const platforms = await Product.distinct('platform', { status: 'active' });
    
    res.json({
      success: true,
      data: {
        platforms: platforms.sort()
      }
    });
  } catch (error) {
    console.error('Get platforms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching platforms'
    });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, codes } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (quantity !== undefined) {
      product.inventory.quantity = quantity;
    }
    
    if (codes && Array.isArray(codes)) {
      codes.forEach(code => {
        if (!product.inventory.codes.find(c => c.code === code)) {
          product.inventory.codes.push({ code, isUsed: false });
        }
      });
    }

    await product.save();

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        inventory: product.inventory
      }
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating inventory'
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const imageUrl = req.file.path;
    const isPrimary = product.images.length === 0;
    
    product.images.push({
      url: imageUrl,
      alt: req.body.alt || product.title,
      isPrimary
    });

    await product.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image: {
          url: imageUrl,
          alt: req.body.alt || product.title,
          isPrimary
        }
      }
    });
  } catch (error) {
    console.error('Upload product image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
};

module.exports = {
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
};