const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Information
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order Items
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
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    productSnapshot: {
      name: String,
      sku: String,
      image: String
    }
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    transactionId: String,
    paymentDate: Date,
    gateway: String,
    amount: Number
  },
  
  // Delivery Information
  delivery: {
    method: {
      type: String,
      required: true,
      enum: ['home_delivery', 'store_pickup', 'express_delivery']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'failed', 'returned'],
      default: 'pending'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String
    },
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryNotes: String,
    pickupCode: String, // For store pickup verification
    qrCode: String // For pickup verification
  },
  
  // Order Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  },
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  // Customer Notes
  customerNotes: String,
  internalNotes: String,
  
  // Business Logic
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'phone', 'in_store'],
    default: 'website'
  },
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Analytics
  customerType: {
    type: String,
    enum: ['new', 'returning', 'vip'],
    default: 'new'
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'delivery.status': 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ total: -1 });

// Virtual for order summary
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.orderDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `DE${year}${month}${day}${random}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
  
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  if (notes) {
    this.internalNotes = (this.internalNotes || '') + `\n${new Date().toISOString()}: ${notes}`;
  }
  
  // Update delivery status based on order status
  if (newStatus === 'shipped') {
    this.delivery.status = 'shipped';
  } else if (newStatus === 'delivered') {
    this.delivery.status = 'delivered';
    this.actualDeliveryDate = new Date();
  }
  
  return this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = function(newStatus, transactionId = null) {
  this.payment.status = newStatus;
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  if (newStatus === 'completed') {
    this.payment.paymentDate = new Date();
  }
  
  // Update order status based on payment
  if (newStatus === 'completed') {
    this.status = 'confirmed';
  } else if (newStatus === 'failed') {
    this.status = 'pending';
  }
  
  return this.save();
};

// Method to update delivery status
orderSchema.methods.updateDeliveryStatus = function(newStatus, trackingNumber = null) {
  this.delivery.status = newStatus;
  if (trackingNumber) {
    this.delivery.trackingNumber = trackingNumber;
  }
  
  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
    this.status = 'delivered';
  } else if (newStatus === 'shipped') {
    this.status = 'shipped';
  }
  
  return this.save();
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('customer', 'firstName lastName email');
};

// Static method to get orders by customer
orderSchema.statics.getByCustomer = function(customerId) {
  return this.find({ customer: customerId }).populate('items.product', 'name sku image');
};

// Static method to get recent orders
orderSchema.statics.getRecent = function(limit = 10) {
  return this.find().sort({ orderDate: -1 }).limit(limit).populate('customer', 'firstName lastName');
};

// Static method to get orders for delivery
orderSchema.statics.getForDelivery = function() {
  return this.find({
    'delivery.status': { $in: ['confirmed', 'processing', 'shipped'] },
    status: { $in: ['confirmed', 'processing', 'shipped'] }
  }).populate('customer', 'firstName lastName phone');
};

module.exports = mongoose.model('Order', orderSchema);

