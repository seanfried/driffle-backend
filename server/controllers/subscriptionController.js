const { Subscription, User } = require('../models');

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = async (req, res) => {
  try {
    const { plan, paymentMethodId } = req.body;
    const userId = req.user._id;

    // Check if user already has an active subscription
    const existingSub = await Subscription.findOne({
      user: userId,
      status: 'active',
      currentPeriodEnd: { $gt: new Date() }
    });

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    // Mock Payment Logic
    // In real world, use Stripe to create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Annual plan

    const subscription = await Subscription.create({
      user: userId,
      plan: plan || 'plus-yearly',
      status: 'active',
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      pricing: {
        amount: 29.99,
        currency: 'EUR'
      },
      payment: {
        method: 'credit-card', // Mock
        customerId: 'cus_mock_' + userId,
        subscriptionId: 'sub_mock_' + Date.now(),
        paymentMethodId: paymentMethodId || 'pm_mock'
      }
    });

    // Update user status
    await User.findByIdAndUpdate(userId, { isPlusMember: true });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current subscription
// @route   GET /api/subscriptions/me
// @access  Private
const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      currentPeriodEnd: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createSubscription,
  getMySubscription
};