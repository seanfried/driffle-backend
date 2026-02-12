const { Order, Product, Cart, User } = require('../models');
const { validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendOrderConfirmationEmail } = require('../services/emailService');

const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { paymentMethodId, shippingAddress, billingAddress, promotionCode } = req.body;
    
    // Get user's cart
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
        .populate({
          path: 'items.product',
          select: 'title images pricing inventory platform type'
        });
    } else {
      const sessionId = req.headers['x-session-id'];
      cart = await Cart.findOne({ sessionId })
        .populate({
          path: 'items.product',
          select: 'title images pricing inventory platform type'
        });
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate cart items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      
      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" is no longer available`
        });
      }

      if (product.inventory.type === 'limited' && product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${product.title}"`
        });
      }

      const basePrice = product.pricing.salePrice || product.pricing.basePrice;
      const userPrice = req.user ? product.getPriceForUser(req.user.isPlusMember) : basePrice;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: basePrice,
        finalPrice: userPrice,
        codeDelivered: false,
        codes: []
      });

      subtotal += userPrice * item.quantity;
    }

    // Apply promotion if provided
    let discount = 0;
    if (promotionCode) {
      const Promotion = require('../models/Promotion');
      const promotion = await Promotion.findOne({ code: promotionCode.toUpperCase() });
      
      if (promotion && promotion.isValid(req.user, subtotal)) {
        discount = promotion.calculateDiscount(subtotal, req.user?.isPlusMember);
      }
    }

    // Calculate tax and total
    const tax = (subtotal - discount) * (parseFloat(process.env.TAX_RATE) || 0.20);
    const total = subtotal - discount + tax;

    // Create Stripe payment intent
    let paymentIntent;
    
    // MOCK PAYMENT FOR DEVELOPMENT
    if (paymentMethodId === 'mock_payment') {
      paymentIntent = {
        id: 'pi_mock_' + Date.now(),
        status: 'succeeded'
      };
    } else {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // Convert to cents
          currency: process.env.CURRENCY?.toLowerCase() || 'eur',
          payment_method: paymentMethodId,
          confirm: true,
          return_url: `${process.env.CLIENT_URL}/order-confirmation`,
          metadata: {
            userId: req.user?._id.toString() || 'guest',
            userEmail: req.user?.email || 'guest@driffle.com'
          }
        });
      } catch (stripeError) {
        return res.status(400).json({
          success: false,
          message: 'Payment failed',
          error: stripeError.message
        });
      }
    }

    // Create order
    const orderData = {
      user: req.user?._id,
      items: orderItems,
      pricing: {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      payment: {
        method: 'stripe',
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        transactionId: paymentIntent.id,
        paymentIntentId: paymentIntent.id
      },
      status: paymentIntent.status === 'succeeded' ? 'confirmed' : 'pending',
      shipping: shippingAddress,
      billing: billingAddress,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        isPlusMember: req.user?.isPlusMember || false
      }
    };

    const order = new Order(orderData);
    await order.save();

    // Process successful payment
    if (paymentIntent.status === 'succeeded') {
      await processOrderPayment(order, paymentIntent.id);
    }

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    // Send confirmation email
    if (req.user) {
      try {
        await sendOrderConfirmationEmail(req.user, order);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.pricing.total,
          paymentStatus: order.payment.status
        }
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

const processOrderPayment = async (order, transactionId) => {
  try {
    // Update order status
    order.payment.status = 'completed';
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    
    order.timeline.push({
      status: 'payment_completed',
      note: 'Payment processed successfully'
    });

    // Process digital delivery for each item
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      
      if (product.type === 'game' || product.type === 'gift-card' || product.type === 'dlc') {
        // Assign available codes
        const availableCodes = product.inventory.codes.filter(code => !code.isUsed);
        
        if (availableCodes.length >= item.quantity) {
          for (let i = 0; i < item.quantity; i++) {
            const code = availableCodes[i];
            code.isUsed = true;
            code.usedBy = order.user;
            code.usedAt = new Date();
            
            item.codes.push({
              code: code.code,
              deliveredAt: new Date()
            });
            item.codeDelivered = true;
          }
          
          await product.save();
        }
      }
    }

    await order.save();
  } catch (error) {
    console.error('Process order payment error:', error);
    throw error;
  }
};

const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate
    } = req.query;

    const query = {};
    
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      query.user = req.user._id;
    }
    
    if (status) query.status = status;
    if (paymentStatus) query['payment.status'] = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'title images platform')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const query = { orderNumber };
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'title images platform type')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderNumber } = req.params;
    const { status, note } = req.body;

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.updateStatus(status, note, req.user._id);
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          timeline: order.timeline
        }
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

const requestRefund = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderNumber } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findOne({ orderNumber, user: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.canBeRefunded) {
      return res.status(400).json({
        success: false,
        message: 'This order cannot be refunded'
      });
    }

    order.requestRefund(amount, reason);
    await order.save();

    res.json({
      success: true,
      message: 'Refund request submitted successfully',
      data: {
        refund: order.refund
      }
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while requesting refund'
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      matchStage.user = req.user._id;
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    const recentOrders = await Order.find(matchStage)
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          completedOrders: 0
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  requestRefund,
  getOrderStats
};