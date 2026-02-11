const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    unique: true,
    sparse: true
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
      min: 1,
      max: 10
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sessionId: {
    type: String,
    index: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  },
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

cartSchema.methods.addItem = function(productId, quantity = 1) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity: quantity
    });
  }
  
  this.metadata.lastUpdated = new Date();
  return this.save();
};

cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  this.metadata.lastUpdated = new Date();
  return this.save();
};

cartSchema.methods.updateQuantity = function(productId, quantity) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }
    
    item.quantity = Math.min(quantity, 10);
    this.metadata.lastUpdated = new Date();
    return this.save();
  }
  
  return Promise.resolve(this);
};

cartSchema.methods.clear = function() {
  this.items = [];
  this.metadata.lastUpdated = new Date();
  return this.save();
};

cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

cartSchema.pre('save', function(next) {
  this.items = this.items.filter(item => item.quantity > 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);