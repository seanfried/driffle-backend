const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 300
  },
  type: {
    type: String,
    enum: ['game', 'gift-card', 'dlc', 'subscription'],
    required: true
  },
  category: {
    type: String,
    enum: ['action', 'adventure', 'rpg', 'strategy', 'sports', 'racing', 'simulation', 'puzzle', 'platform', 'fighting', 'shooter', 'indie', 'mmo', 'gift-card'],
    required: true
  },
  platform: {
    type: String,
    enum: ['steam', 'epic-games', 'xbox', 'playstation', 'nintendo', 'origin', 'uplay', 'gog', 'battlenet', 'generic'],
    required: true
  },
  genre: [{
    type: String,
    enum: ['action', 'adventure', 'rpg', 'strategy', 'sports', 'racing', 'simulation', 'puzzle', 'platform', 'fighting', 'shooter', 'indie', 'mmo', 'horror', 'survival']
  }],
  publisher: {
    type: String,
    trim: true
  },
  developer: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  videos: [{
    url: String,
    type: {
      type: String,
      enum: ['trailer', 'gameplay', 'review'],
      default: 'trailer'
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    salePrice: {
      type: Number,
      min: 0
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    plusDiscount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  inventory: {
    type: {
      type: String,
      enum: ['limited', 'unlimited', 'preorder'],
      default: 'unlimited'
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    codes: [{
      code: {
        type: String,
        required: true
      },
      isUsed: {
        type: Boolean,
        default: false
      },
      usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      usedAt: {
        type: Date
      }
    }]
  },
  specifications: {
    systemRequirements: {
      minimum: {
        os: String,
        processor: String,
        memory: String,
        graphics: String,
        storage: String
      },
      recommended: {
        os: String,
        processor: String,
        memory: String,
        graphics: String,
        storage: String
      }
    },
    features: [String],
    languages: [String],
    multiplayer: {
      type: Boolean,
      default: false
    },
    onlineFeatures: {
      type: Boolean,
      default: false
    }
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    details: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'discontinued'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  saleStartDate: {
    type: Date
  },
  saleEndDate: {
    type: Date
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
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

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ type: 1, category: 1, platform: 1 });
productSchema.index({ 'pricing.salePrice': 1 });
productSchema.index({ 'pricing.discountPercentage': -1 });
productSchema.index({ status: 1, isFeatured: -1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual('finalPrice').get(function() {
  return this.pricing.salePrice || this.pricing.basePrice;
});

productSchema.virtual('isInStock').get(function() {
  return this.inventory.type === 'unlimited' || this.inventory.quantity > 0;
});

productSchema.virtual('discountAmount').get(function() {
  if (this.pricing.salePrice) {
    return this.pricing.basePrice - this.pricing.salePrice;
  }
  return 0;
});

productSchema.methods.getPriceForUser = function(isPlusMember = false) {
  let price = this.finalPrice;
  
  if (isPlusMember && this.pricing.plusDiscount > 0) {
    price = price * (1 - this.pricing.plusDiscount / 100);
  }
  
  return Math.round(price * 100) / 100;
};

module.exports = mongoose.model('Product', productSchema);