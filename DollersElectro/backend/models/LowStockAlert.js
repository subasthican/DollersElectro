const mongoose = require('mongoose');

const lowStockAlertSchema = new mongoose.Schema({
  // Product reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Current stock level
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Low stock threshold
  threshold: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Alert status
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
    default: 'active'
  },
  
  // Alert priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Alert message
  message: {
    type: String,
    required: true
  },
  
  // Acknowledged by
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Acknowledged at
  acknowledgedAt: Date,
  
  // Resolved by
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Resolved at
  resolvedAt: Date,
  
  // Resolution notes
  resolutionNotes: String,
  
  // Alert type
  alertType: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'reorder_point'],
    default: 'low_stock'
  },
  
  // Notification sent
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  // Notification sent at
  notificationSentAt: Date,
  
  // Alert metadata
  metadata: {
    previousStock: Number,
    stockChange: Number,
    daysSinceLastRestock: Number,
    averageDailySales: Number,
    estimatedDaysUntilOutOfStock: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
lowStockAlertSchema.index({ product: 1, status: 1 });
lowStockAlertSchema.index({ status: 1, priority: 1 });
lowStockAlertSchema.index({ createdAt: -1 });
lowStockAlertSchema.index({ alertType: 1 });

// Virtual for alert age in days
lowStockAlertSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for urgency score
lowStockAlertSchema.virtual('urgencyScore').get(function() {
  let score = 0;
  
  // Base score by priority
  switch (this.priority) {
    case 'critical': score += 100; break;
    case 'high': score += 75; break;
    case 'medium': score += 50; break;
    case 'low': score += 25; break;
  }
  
  // Add score based on stock level
  if (this.currentStock === 0) score += 50;
  else if (this.currentStock <= 1) score += 30;
  else if (this.currentStock <= 3) score += 20;
  else if (this.currentStock <= 5) score += 10;
  
  // Add score based on age
  const age = this.ageInDays;
  if (age >= 7) score += 25;
  else if (age >= 3) score += 15;
  else if (age >= 1) score += 5;
  
  return Math.min(score, 100);
});

// Method to acknowledge alert
lowStockAlertSchema.methods.acknowledge = function(userId, notes) {
  this.status = 'acknowledged';
  this.acknowledgedBy = userId;
  this.acknowledgedAt = new Date();
  if (notes) this.resolutionNotes = notes;
  return this.save();
};

// Method to resolve alert
lowStockAlertSchema.methods.resolve = function(userId, notes) {
  this.status = 'resolved';
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  if (notes) this.resolutionNotes = notes;
  return this.save();
};

// Method to dismiss alert
lowStockAlertSchema.methods.dismiss = function(userId, notes) {
  this.status = 'dismissed';
  this.acknowledgedBy = userId;
  this.acknowledgedAt = new Date();
  if (notes) this.resolutionNotes = notes;
  return this.save();
};

// Static method to create low stock alert
lowStockAlertSchema.statics.createLowStockAlert = async function(product, currentStock, threshold) {
  // Check if there's already an active alert for this product
  const existingAlert = await this.findOne({
    product: product._id,
    status: { $in: ['active', 'acknowledged'] }
  });

  if (existingAlert) {
    // Update existing alert
    existingAlert.currentStock = currentStock;
    existingAlert.threshold = threshold;
    existingAlert.message = `Low stock alert: ${product.name} has ${currentStock} units remaining (threshold: ${threshold})`;
    existingAlert.priority = this.calculatePriority(currentStock, threshold);
    return existingAlert.save();
  }

  // Create new alert
  const alert = new this({
    product: product._id,
    currentStock,
    threshold,
    message: `Low stock alert: ${product.name} has ${currentStock} units remaining (threshold: ${threshold})`,
    priority: this.calculatePriority(currentStock, threshold),
    alertType: currentStock === 0 ? 'out_of_stock' : 'low_stock',
    metadata: {
      previousStock: product.stock,
      stockChange: currentStock - product.stock,
      daysSinceLastRestock: 0, // This would be calculated based on product history
      averageDailySales: 0, // This would be calculated based on sales data
      estimatedDaysUntilOutOfStock: currentStock > 0 ? Math.ceil(currentStock / 1) : 0 // This would be calculated based on sales velocity
    }
  });

  return alert.save();
};

// Static method to calculate priority
lowStockAlertSchema.statics.calculatePriority = function(currentStock, threshold) {
  if (currentStock === 0) return 'critical';
  if (currentStock <= 1) return 'high';
  if (currentStock <= threshold * 0.5) return 'medium';
  return 'low';
};

// Static method to get active alerts
lowStockAlertSchema.statics.getActiveAlerts = function(filters = {}) {
  const query = { status: 'active' };
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.alertType) {
    query.alertType = filters.alertType;
  }
  
  return this.find(query)
    .populate('product', 'name sku category price stock')
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to get alert statistics
lowStockAlertSchema.statics.getAlertStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        acknowledged: {
          $sum: { $cond: [{ $eq: ['$status', 'acknowledged'] }, 1, 0] }
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        dismissed: {
          $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] }
        },
        critical: {
          $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
        },
        high: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        medium: {
          $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
        },
        low: {
          $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Add 'id' field to output
lowStockAlertSchema.methods.addIdField = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('LowStockAlert', lowStockAlertSchema);




