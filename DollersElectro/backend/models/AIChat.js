const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  conversation: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    suggestions: [{
      text: String,
      action: String,
      data: mongoose.Schema.Types.Mixed
    }]
  }],
  context: {
    projectType: String, // 'house', 'office', 'renovation', etc.
    roomTypes: [String], // ['kitchen', 'living_room', 'bedroom']
    budget: String, // 'low', 'medium', 'high'
    timeline: String, // 'immediate', '1_month', '3_months'
    preferences: [String] // ['smart_home', 'energy_efficient', 'luxury']
  },
  recommendations: [{
    category: String,
    products: [{
      productId: mongoose.Schema.Types.ObjectId,
      reason: String,
      priority: String
    }],
    packageName: String,
    totalPrice: Number,
    savings: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
aiChatSchema.index({ sessionId: 1 });
aiChatSchema.index({ userId: 1 });
aiChatSchema.index({ lastActivity: 1 });

// Helper method to generate session ID
aiChatSchema.statics.generateSessionId = function() {
  return 'ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Helper method to check if session is active
aiChatSchema.methods.isActive = function() {
  const now = new Date();
  const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours
  return (now - this.lastActivity) < inactiveThreshold;
};

module.exports = mongoose.model('AIChat', aiChatSchema);












