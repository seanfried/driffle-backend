const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      min: 0,
      default: 0
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    codeDelivered: {
      type: Boolean,
      default: false
    },
    codes: [{
      code: String,
      deliveredAt: Date
    }]
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      min: 0,
      default: 0
    },
    tax: {
      type: Number,
      min: 0,
      default: 0
    },
    shipping: {
      type: Number,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'credit-card', 'bank-transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentIntentId: String,
    paidAt: Date,
    failedAt: Date,
    failureReason: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  fulfillment: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    processedAt: Date,
    completedAt: Date,
    notes: String
  },
  shipping: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    company: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    method: String,
    trackingNumber: String
  },
  billing: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    company: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    customer: String,
    admin: String
  },
  refund: {
    status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'processing', 'completed', 'denied'],
      default: 'none'
    },
    amount: Number,
    reason: String,
    requestedAt: Date,
    processedAt: Date,
    refundId: String
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    referralSource: String,
    couponCode: String,
    isPlusMember: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('validate', function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    note: note,
    updatedBy: updatedBy
  });
};

orderSchema.methods.processPayment = function(transactionId, paymentIntentId) {
  this.payment.status = 'completed';
  this.payment.transactionId = transactionId;
  this.payment.paymentIntentId = paymentIntentId;
  this.payment.paidAt = new Date();
  this.status = 'confirmed';
  
  this.timeline.push({
    status: 'payment_completed',
    note: 'Payment processed successfully'
  });
};

orderSchema.methods.failPayment = function(reason) {
  this.payment.status = 'failed';
  this.payment.failedAt = new Date();
  this.payment.failureReason = reason;
  this.status = 'cancelled';
  
  this.timeline.push({
    status: 'payment_failed',
    note: `Payment failed: ${reason}`
  });
};

orderSchema.methods.requestRefund = function(amount, reason) {
  this.refund.status = 'requested';
  this.refund.amount = amount;
  this.refund.reason = reason;
  this.refund.requestedAt = new Date();
  
  this.timeline.push({
    status: 'refund_requested',
    note: `Refund requested: ${reason}`
  });
};

orderSchema.virtual('isDigital').get(function() {
  return this.items.every(item => item.product.type !== 'physical');
});

orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'processing', 'confirmed'].includes(this.status);
});

orderSchema.virtual('canBeRefunded').get(function() {
  return this.payment.status === 'completed' && this.refund.status === 'none';
});

module.exports = mongoose.model('Order', orderSchema);