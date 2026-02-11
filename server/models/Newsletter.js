const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    marketing: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: true },
    partners: { type: Boolean, default: false }
  },
  unsubscribeToken: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Newsletter', newsletterSchema);