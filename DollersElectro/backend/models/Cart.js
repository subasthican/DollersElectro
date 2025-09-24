const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
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
      min: [1, 'Quantity must be at least 1']
    },
    variant: {
      name: String,
      value: String
    },
    selectedOptions: Map,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  promoCode: {
    code: String,
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode'
    },
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping']
    },
    appliedAt: Date
  },
  shippingAddress: {
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    },
    phone: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    },
    phone: String
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'same_day'],
    default: 'standard'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'cash_on_delivery', 'bank_transfer'],
    default: 'stripe'
  },
  notes: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for cart summary
cartSchema.virtual('summary').get(function() {
  const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = this.items.reduce((sum, item) => {
    const product = item.product;
    if (product && product.price) {
      return sum + (product.price * item.quantity);
    }
    return sum;
  }, 0);
  
  let discount = 0;
  if (this.promoCode) {
    if (this.promoCode.type === 'percentage') {
      discount = (subtotal * this.promoCode.discount) / 100;
    } else if (this.promoCode.type === 'fixed') {
      discount = this.promoCode.discount;
    }
    // free_shipping is handled separately in shipping calculation
  }
  
  const total = subtotal - discount;
  
  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
});

// Virtual for isExpired
cartSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for isEmpty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ lastUpdated: -1 });

// Pre-save middleware to update lastUpdated
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-save middleware to extend expiration
cartSchema.pre('save', function(next) {
  if (this.isModified('items') && this.items.length > 0) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

// Static method to get cart by user
cartSchema.statics.getByUser = function(userId) {
  return this.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name price images stock isActive isOnSale comparePrice'
    });
};

// Static method to clean expired carts
cartSchema.statics.cleanExpired = function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// Instance method to add item
cartSchema.methods.addItem = function(productId, quantity = 1, variant = null, options = {}) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.variant) === JSON.stringify(variant)
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.addedAt = new Date();
  } else {
    this.items.push({
      product: productId,
      quantity,
      variant,
      selectedOptions: options,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity, variant = null) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.variant) === JSON.stringify(variant)
  );
  
  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(i => i !== item);
    } else {
      item.quantity = quantity;
      item.addedAt = new Date();
    }
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Instance method to remove item
cartSchema.methods.removeItem = function(productId, variant = null) {
  this.items = this.items.filter(item => 
    !(item.product.toString() === productId.toString() &&
      JSON.stringify(item.variant) === JSON.stringify(variant))
  );
  
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.promoCode = null;
  return this.save();
};

// Instance method to apply promo code
cartSchema.methods.applyPromoCode = function(promoCodeData) {
  this.promoCode = {
    code: promoCodeData.code,
    promoCodeId: promoCodeData.id,
    discount: promoCodeData.discount,
    type: promoCodeData.type,
    appliedAt: new Date()
  };
  
  return this.save();
};

// Instance method to remove promo code
cartSchema.methods.removePromoCode = function() {
  this.promoCode = null;
  return this.save();
};

// Instance method to update shipping address
cartSchema.methods.updateShippingAddress = function(address) {
  this.shippingAddress = { ...this.shippingAddress, ...address };
  return this.save();
};

// Instance method to update billing address
cartSchema.methods.updateBillingAddress = function(address) {
  this.billingAddress = { ...this.billingAddress, ...address };
  return this.save();
};

// Instance method to update shipping method
cartSchema.methods.updateShippingMethod = function(method) {
  this.shippingMethod = method;
  return this.save();
};

// Instance method to update payment method
cartSchema.methods.updatePaymentMethod = function(method) {
  this.paymentMethod = method;
  return this.save();
};

// Instance method to validate stock
cartSchema.methods.validateStock = async function() {
  const Product = mongoose.model('Product');
  const validationErrors = [];
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      validationErrors.push(`Product ${item.product} not found`);
      continue;
    }
    
    if (!product.isActive) {
      validationErrors.push(`Product ${product.name} is not available`);
      continue;
    }
    
    if (product.stock.quantity < item.quantity) {
      validationErrors.push(`Insufficient stock for ${product.name}. Available: ${product.stock.quantity}, Requested: ${item.quantity}`);
    }
  }
  
  return validationErrors;
};

module.exports = mongoose.model('Cart', cartSchema);



