const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
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
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true
  },
  
  value: {
    type: Number,
    required: true,
    min: 0
  },
  
  // For percentage discounts, value is the percentage (e.g., 15 for 15%)
  // For fixed discounts, value is the amount in dollars
  // For free shipping, value is ignored
  
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  maximumDiscount: {
    type: Number,
    min: 0
  },
  
  usageLimit: {
    type: Number,
    default: -1, // -1 means unlimited
    min: -1
  },
  
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  userUsageLimit: {
    type: Number,
    default: 1, // How many times a single user can use this code
    min: 1
  },
  
  validFrom: {
    type: Date,
    default: Date.now
  },
  
  validUntil: {
    type: Date,
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  applicableCategories: [{
    type: String,
    trim: true
  }],
  
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  excludedCategories: [{
    type: String,
    trim: true
  }],
  
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  userRestrictions: {
    newUsersOnly: {
      type: Boolean,
      default: false
    },
    existingUsersOnly: {
      type: Boolean,
      default: false
    },
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
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

// Indexes for performance
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isActive: 1, validUntil: 1 });
promoCodeSchema.index({ usageLimit: 1, usedCount: 1 });

// Virtual for remaining uses
promoCodeSchema.virtual('remainingUses').get(function() {
  if (this.usageLimit === -1) return 'unlimited';
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for isExpired
promoCodeSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual for isValid
promoCodeSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil &&
         (this.usageLimit === -1 || this.usedCount < this.usageLimit);
});

// Instance method to validate promo code for a specific order
promoCodeSchema.methods.validateForOrder = function(orderData, userId) {
  const now = new Date();
  
  // Check if code is active and not expired
  if (!this.isActive || now < this.validFrom || now > this.validUntil) {
    return { valid: false, message: 'Promo code is not active or has expired' };
  }
  
  // Check usage limit
  if (this.usageLimit !== -1 && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Promo code usage limit reached' };
  }
  
  // Check minimum order amount
  if (orderData.subtotal < this.minimumOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of $${this.minimumOrderAmount} required` 
    };
  }
  
  // Check user restrictions
  if (this.userRestrictions.newUsersOnly && orderData.userType !== 'new') {
    return { valid: false, message: 'Promo code is for new users only' };
  }
  
  if (this.userRestrictions.existingUsersOnly && orderData.userType !== 'existing') {
    return { valid: false, message: 'Promo code is for existing users only' };
  }
  
  if (this.userRestrictions.specificUsers.length > 0 && 
      !this.userRestrictions.specificUsers.includes(userId)) {
    return { valid: false, message: 'Promo code not available for this user' };
  }
  
  return { valid: true, message: 'Promo code is valid' };
};

// Instance method to calculate discount
promoCodeSchema.methods.calculateDiscount = function(orderSubtotal) {
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = (orderSubtotal * this.value) / 100;
      if (this.maximumDiscount && discount > this.maximumDiscount) {
        discount = this.maximumDiscount;
      }
      break;
      
    case 'fixed':
      discount = this.value;
      if (discount > orderSubtotal) {
        discount = orderSubtotal;
      }
      break;
      
    case 'free_shipping':
      discount = 0; // Will be handled separately in shipping calculation
      break;
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Instance method to increment usage
promoCodeSchema.methods.incrementUsage = function() {
  if (this.usageLimit !== -1 && this.usedCount >= this.usageLimit) {
    throw new Error('Usage limit reached');
  }
  
  this.usedCount += 1;
  return this.save();
};

// Static method to find valid promo code
promoCodeSchema.statics.findValidCode = function(code, orderData, userId) {
  return this.findOne({ 
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  }).then(promoCode => {
    if (!promoCode) {
      return { valid: false, message: 'Promo code not found' };
    }
    
    return promoCode.validateForOrder(orderData, userId);
  });
};

// Static method to get active promo codes
promoCodeSchema.statics.getActiveCodes = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  }).sort({ validUntil: 1 });
};

// Pre-save middleware to ensure code is uppercase
promoCodeSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('PromoCode', promoCodeSchema);





