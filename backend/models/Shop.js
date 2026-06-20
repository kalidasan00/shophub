const mongoose = require('mongoose')

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fashion', 'Electronics', 'Food', 'Beauty', 'Sports', 'Books', 'Home', 'Toys', 'Other'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  logo: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '🛍️',
  },
  color: {
    type: String,
    default: '#EEF2FF',
  },
  location: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  badge: {
    type: String,
    enum: ['Top Rated', 'Popular', 'New', 'Trending', ''],
    default: 'New',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  since: {
    type: String,
    default: new Date().getFullYear().toString(),
  },
}, { timestamps: true })

// Virtual for product count
shopSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'shop',
  count: true,
})

shopSchema.set('toJSON', { virtuals: true })
shopSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Shop', shopSchema)