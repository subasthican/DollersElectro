const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  // Email address
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Subscription status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Subscription preferences
  preferences: {
    productUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    news: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  },
  
  // User who subscribed (if authenticated)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Subscription source
  source: {
    type: String,
    enum: ['website', 'mobile', 'admin', 'import'],
    default: 'website'
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  
  // Unsubscribe
  unsubscribeToken: String,
  
  // Subscription metadata
  ipAddress: String,
  userAgent: String,
  
  // Last email sent
  lastEmailSent: Date,
  
  // Bounce tracking
  bounceCount: {
    type: Number,
    default: 0
  },
  
  // Complaint tracking
  complaintCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ isVerified: 1 });
newsletterSchema.index({ createdAt: -1 });

// Virtual for subscription age
newsletterSchema.virtual('subscriptionAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Virtual for subscription status
newsletterSchema.virtual('status').get(function() {
  if (!this.isActive) return 'unsubscribed';
  if (!this.isVerified) return 'pending_verification';
  if (this.bounceCount >= 3) return 'bounced';
  if (this.complaintCount >= 1) return 'complained';
  return 'active';
});

// Method to generate verification token
newsletterSchema.methods.generateVerificationToken = function() {
  const crypto = require('crypto');
  this.verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return this.verificationToken;
};

// Method to generate unsubscribe token
newsletterSchema.methods.generateUnsubscribeToken = function() {
  const crypto = require('crypto');
  this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  return this.unsubscribeToken;
};

// Method to verify subscription
newsletterSchema.methods.verify = function() {
  this.isVerified = true;
  this.verificationToken = undefined;
  this.verificationExpires = undefined;
  return this.save();
};

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.isActive = false;
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.isActive = true;
  this.bounceCount = 0;
  this.complaintCount = 0;
  return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function() {
  return this.find({ 
    isActive: true, 
    isVerified: true,
    bounceCount: { $lt: 3 },
    complaintCount: 0
  });
};

// Static method to get subscription stats
newsletterSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isActive', true] }, { $eq: ['$isVerified', true] }] },
              1,
              0
            ]
          }
        },
        pending: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isActive', true] }, { $eq: ['$isVerified', false] }] },
              1,
              0
            ]
          }
        },
        unsubscribed: {
          $sum: {
            $cond: [{ $eq: ['$isActive', false] }, 1, 0]
          }
        },
        bounced: {
          $sum: {
            $cond: [{ $gte: ['$bounceCount', 3] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Add 'id' field to output
newsletterSchema.methods.addIdField = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('Newsletter', newsletterSchema);




