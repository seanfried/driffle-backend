const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['plus-monthly', 'plus-yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending', 'failed'],
    default: 'pending'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  pricing: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'credit-card'],
      required: true
    },
    customerId: {
      type: String,
      required: true
    },
    subscriptionId: {
      type: String,
      required: true
    },
    paymentMethodId: String,
    latestInvoiceId: String,
    nextInvoiceDate: Date
  },
  benefits: {
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 15
    },
    exclusiveAccess: {
      type: Boolean,
      default: true
    },
    prioritySupport: {
      type: Boolean,
      default: true
    },
    earlyAccess: {
      type: Boolean,
      default: true
    }
  },
  usage: {
    totalSavings: {
      type: Number,
      default: 0,
      min: 0
    },
    ordersCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastOrderDate: Date
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'activated', 'renewed', 'cancelled', 'failed', 'expired'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  metadata: {
    trialUsed: {
      type: Boolean,
      default: false
    },
    referralCode: String,
    source: String
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ 'payment.subscriptionId': 1 });

subscriptionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.history.push({
      action: 'created',
      note: 'Subscription created'
    });
  }
  next();
});

subscriptionSchema.methods.activate = function() {
  this.status = 'active';
  this.history.push({
    action: 'activated',
    note: 'Subscription activated'
  });
};

subscriptionSchema.methods.cancel = function(cancelAtPeriodEnd = true) {
  this.cancelAtPeriodEnd = cancelAtPeriodEnd;
  this.cancelledAt = new Date();
  this.status = 'cancelled';
  
  this.history.push({
    action: 'cancelled',
    note: cancelAtPeriodEnd ? 'Subscription cancelled at period end' : 'Subscription cancelled immediately'
  });
};

subscriptionSchema.methods.renew = function(newPeriodEnd) {
  this.currentPeriodStart = this.currentPeriodEnd;
  this.currentPeriodEnd = newPeriodEnd;
  this.status = 'active';
  
  this.history.push({
    action: 'renewed',
    note: 'Subscription renewed'
  });
};

subscriptionSchema.methods.fail = function(reason) {
  this.status = 'failed';
  
  this.history.push({
    action: 'failed',
    note: `Subscription failed: ${reason}`
  });
};

subscriptionSchema.methods.expire = function() {
  this.status = 'expired';
  this.endedAt = new Date();
  
  this.history.push({
    action: 'expired',
    note: 'Subscription expired'
  });
};

subscriptionSchema.methods.addSavings = function(amount) {
  this.usage.totalSavings += amount;
  this.usage.ordersCount += 1;
  this.usage.lastOrderDate = new Date();
};

subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
});

subscriptionSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const end = new Date(this.currentPeriodEnd);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

subscriptionSchema.virtual('isExpiringSoon').get(function() {
  return this.daysUntilExpiry <= 7 && this.status === 'active';
});

module.exports = mongoose.model('Subscription', subscriptionSchema);