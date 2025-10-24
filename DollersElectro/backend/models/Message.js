const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // User who sent the message
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message status
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Real-time status tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Typing indicators
  typingUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt: { type: Date, default: Date.now }
  }],
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Category for better organization
  category: {
    type: String,
    enum: ['general', 'technical', 'sales', 'support', 'complaint', 'feedback'],
    default: 'general'
  },
  
  // Replies to this message
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Reply cannot exceed 1000 characters']
    },
    isInternal: {
      type: Boolean,
      default: false // For admin/employee internal notes
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Assigned to (admin/employee)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Internal notes (admin/employee only)
  internalNotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    note: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Resolution time tracking
  resolvedAt: Date,
  firstResponseTime: Date,
  
  // Tags for organization
  tags: [String],
  
  // Edit history
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    previousSubject: String,
    previousMessage: String,
    previousCategory: String,
    previousPriority: String
  }]
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ user: 1, createdAt: -1 });
messageSchema.index({ status: 1, priority: 1 });
messageSchema.index({ assignedTo: 1 });
messageSchema.index({ category: 1 });

// Pre-save middleware to update timestamps
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set first response time when first reply is added
  if (this.replies.length === 1 && !this.firstResponseTime) {
    this.firstResponseTime = Date.now();
  }
  
  // Set resolved time when status changes to resolved
  if (this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = Date.now();
  }
  
  next();
});

// Instance method to add reply
messageSchema.methods.addReply = async function(userId, message, isInternal = false) {
  this.replies.push({
    user: userId,
    message,
    isInternal
  });
  
  // Update status based on reply
  if (this.status === 'open') {
    this.status = 'in_progress';
  }
  
  return await this.save();
};

// Instance method to add internal note
messageSchema.methods.addInternalNote = async function(userId, note) {
  this.internalNotes.push({
    user: userId,
    note
  });
  
  this.lastActivity = Date.now();
  return await this.save();
};

// Instance method to update typing status
messageSchema.methods.updateTypingStatus = async function(userId, isTyping) {
  if (isTyping) {
    // Add or update typing user
    const existingIndex = this.typingUsers.findIndex(t => t.user.toString() === userId.toString());
    if (existingIndex >= 0) {
      this.typingUsers[existingIndex].startedAt = Date.now();
    } else {
      this.typingUsers.push({ user: userId });
    }
  } else {
    // Remove typing user
    this.typingUsers = this.typingUsers.filter(t => t.user.toString() !== userId.toString());
  }
  
  return await this.save();
};

// Instance method to get typing users (excluding expired ones)
messageSchema.methods.getActiveTypingUsers = function() {
  const now = Date.now();
  const typingTimeout = 10000; // 10 seconds
  
  return this.typingUsers.filter(t => (now - t.startedAt.getTime()) < typingTimeout);
};

// Static method to get messages with user details
messageSchema.statics.getMessagesWithUsers = function(filter = {}) {
  return this.find(filter)
    .populate('user', 'firstName lastName email username role')
    .populate('assignedTo', 'firstName lastName email username role')
    .populate('replies.user', 'firstName lastName email username role')
    .populate('internalNotes.user', 'firstName lastName email username role')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Message', messageSchema);
