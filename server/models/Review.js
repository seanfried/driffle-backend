const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approve for now, can be changed to pending for moderation
  }
}, {
  timestamps: true
});

// Prevent user from reviewing the same product twice
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, status: 'approved' }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        // Calculate counts for each star (histogram)
        stars5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        stars4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        stars3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        stars2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        stars1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings: {
        average: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
        count: stats[0].nRating,
        details: {
          5: stats[0].stars5,
          4: stats[0].stars4,
          3: stats[0].stars3,
          2: stats[0].stars2,
          1: stats[0].stars1
        }
      }
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings: {
        average: 0,
        count: 0,
        details: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    });
  }
};

// Call calcAverageRatings after save and remove
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post('remove', function() {
  this.constructor.calcAverageRatings(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);