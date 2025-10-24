const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Product being reviewed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Review content
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Review content is required'],
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  // Users who found this helpful
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Review images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  
  // Verified purchase
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  
  // Admin response
  adminResponse: {
    content: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Review helpfulness tracking
  reportCount: {
    type: Number,
    default: 0
  },
  
  // Review flags
  isFlagged: {
    type: Boolean,
    default: false
  },
  
  // Review moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  moderatedAt: Date,
  
  moderationNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for review age
reviewSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for review helpfulness percentage
reviewSchema.virtual('helpfulnessPercentage').get(function() {
  if (this.helpfulVotes === 0) return 0;
  return Math.round((this.helpfulVotes / (this.helpfulVotes + this.reportCount)) * 100);
});

// Method to mark as helpful
reviewSchema.methods.markAsHelpful = function(userId) {
  if (!this.helpfulUsers.includes(userId)) {
    this.helpfulUsers.push(userId);
    this.helpfulVotes += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove helpful vote
reviewSchema.methods.removeHelpful = function(userId) {
  const index = this.helpfulUsers.indexOf(userId);
  if (index > -1) {
    this.helpfulUsers.splice(index, 1);
    this.helpfulVotes -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to report review
reviewSchema.methods.report = function() {
  this.reportCount += 1;
  if (this.reportCount >= 5) {
    this.isFlagged = true;
  }
  return this.save();
};

// Static method to get product reviews
reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const {
    status = 'approved',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 10,
    skip = 0
  } = options;

  return this.find({ product: productId, status })
    .populate('user', 'firstName lastName email')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get average rating
reviewSchema.statics.getAverageRating = function(productId) {
  return this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
  ]);
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = function(productId) {
  return this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
};

// Add 'id' field to output
reviewSchema.methods.addIdField = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('Review', reviewSchema);
