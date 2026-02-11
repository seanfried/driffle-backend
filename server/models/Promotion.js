const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'buy-x-get-y', 'free-shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumPurchase: {
    type: Number,
    min: 0,
    default: 0
  },
  maximumDiscount: {
    type: Number,
    min: 0
  },
  usage: {
    limit: {
      type: Number,
      min: 1
    },
    used: {
      type: Number,
      default: 0
    },
    perUser: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  restrictions: {
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    categories: [String],
    platforms: [String],
    userTypes: {
      type: [String],
      enum: ['new', 'existing', 'plus'],
      default: ['new', 'existing']
    },
    excludeSaleItems: {
      type: Boolean,
      default: false
    },
    excludePlusDiscount: {
      type: Boolean,
      default: false
    }
  },
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new-users', 'plus-members', 'specific-users'],
    default: 'all'
  },
  specificUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  autoApply: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  usageHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  performance: {
    totalUsage: {
      type: Number,
      default: 0
    },
    totalDiscountGiven: {
      type: Number,
      default: 0,
      min: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    revenueGenerated: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

promotionSchema.index({ code: 1 });
promotionSchema.index({ isActive: 1, 'validity.startDate': 1, 'validity.endDate': 1 });
promotionSchema.index({ type: 1, priority: -1 });
promotionSchema.index({ targetAudience: 1, isPublic: 1 });

promotionSchema.pre('save', function(next) {
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  if (this.validity.startDate >= this.validity.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  next();
});

promotionSchema.methods.isValid = function(user = null, cartTotal = 0) {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (now < this.validity.startDate || now > this.validity.endDate) return false;
  if (this.usage.limit && this.usage.used >= this.usage.limit) return false;
  
  if (cartTotal < this.minimumPurchase) return false;
  
  if (user) {
    const userUsage = this.usageHistory.filter(h => h.user.toString() === user._id.toString()).length;
    if (userUsage >= this.usage.perUser) return false;
  }
  
  return true;
};

promotionSchema.methods.calculateDiscount = function(subtotal, isPlusMember = false) {
  let discount = 0;
  
  if (subtotal < this.minimumPurchase) return 0;
  
  if (this.type === 'percentage') {
    discount = subtotal * (this.value / 100);
  } else if (this.type === 'fixed') {
    discount = this.value;
  }
  
  if (this.maximumDiscount && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }
  
  return Math.round(discount * 100) / 100;
};

promotionSchema.methods.useCode = function(user, order, discountAmount) {
  this.usage.used += 1;
  this.usageHistory.push({
    user: user._id,
    order: order._id,
    discountAmount: discountAmount
  });
  
  this.performance.totalUsage += 1;
  this.performance.totalDiscountGiven += discountAmount;
};

module.exports = mongoose.model('Promotion', promotionSchema);