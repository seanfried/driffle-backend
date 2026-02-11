const { Cart, Product } = require('../models');
const { validationResult } = require('express-validator');

const getCart = async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
        .populate({
          path: 'items.product',
          select: 'title images pricing inventory platform'
        });
    } else {
      const sessionId = req.sessionID || req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId })
        .populate({
          path: 'items.product',
          select: 'title images pricing inventory platform'
        });
    }

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        data: {
          cart: {
            items: [],
            totalItems: 0,
            subtotal: 0,
            isEmpty: true
          }
        }
      });
    }

    // Calculate prices with user discounts
    const itemsWithPrices = cart.items.map(item => {
      const product = item.product;
      const basePrice = product.pricing.salePrice || product.pricing.basePrice;
      const userPrice = req.user ? product.getPriceForUser(req.user.isPlusMember) : basePrice;
      
      return {
        _id: item._id,
        product: {
          _id: product._id,
          title: product.title,
          images: product.images,
          pricing: product.pricing,
          platform: product.platform,
          inventory: product.inventory
        },
        quantity: item.quantity,
        unitPrice: basePrice,
        userPrice: userPrice,
        totalPrice: userPrice * item.quantity,
        addedAt: item.addedAt,
        isInStock: product.inventory.type === 'unlimited' || product.inventory.quantity >= item.quantity
      };
    });

    const subtotal = itemsWithPrices.reduce((total, item) => total + item.totalPrice, 0);

    res.json({
      success: true,
      data: {
        cart: {
          _id: cart._id,
          items: itemsWithPrices,
          totalItems: cart.getTotalItems(),
          subtotal: Math.round(subtotal * 100) / 100,
          isEmpty: cart.isEmpty,
          expiresAt: cart.expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.inventory.type === 'limited' && product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id });
      }
    } else {
      const sessionId = req.sessionID || req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = new Cart({ sessionId });
      }
    }

    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.inventory.type === 'limited' && product.inventory.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available for this quantity'
        });
      }
      
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity
      });
    }

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'title images pricing inventory platform'
      });

    res.json({
      success: true,
      message: 'Product added to cart successfully',
      data: {
        cart: populatedCart
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart'
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 0 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 0 and 10'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (quantity > 0 && product.inventory.type === 'limited' && product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.sessionID || req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'title images pricing inventory platform'
      });

    res.json({
      success: true,
      message: quantity === 0 ? 'Product removed from cart' : 'Cart updated successfully',
      data: {
        cart: populatedCart
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart'
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.sessionID || req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'title images pricing inventory platform'
      });

    res.json({
      success: true,
      message: 'Product removed from cart successfully',
      data: {
        cart: populatedCart
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart'
    });
  }
};

const clearCart = async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const sessionId = req.sessionID || req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: cart
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};

const mergeCarts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    const sessionCart = await Cart.findOne({ sessionId });
    if (!sessionCart || sessionCart.items.length === 0) {
      return res.json({
        success: true,
        message: 'No session cart to merge'
      });
    }

    let userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart) {
      userCart = new Cart({ user: req.user._id });
    }

    // Merge items from session cart to user cart
    for (const sessionItem of sessionCart.items) {
      const existingItem = userCart.items.find(item => 
        item.product.toString() === sessionItem.product.toString()
      );

      if (existingItem) {
        existingItem.quantity += sessionItem.quantity;
      } else {
        userCart.items.push(sessionItem);
      }
    }

    await userCart.save();
    
    // Delete session cart
    await Cart.findByIdAndDelete(sessionCart._id);

    res.json({
      success: true,
      message: 'Carts merged successfully',
      data: {
        cart: userCart
      }
    });
  } catch (error) {
    console.error('Merge carts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while merging carts'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCarts
};