const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Role and Access Control
  role: {
    type: String,
    enum: ['customer', 'employee', 'admin'],
    default: 'customer',
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      'read_products', 'write_products', 'delete_products',
      'read_orders', 'write_orders', 'delete_orders',
      'read_users', 'write_users', 'delete_users',
      'read_analytics', 'write_analytics',
      'manage_system', 'manage_roles'
    ]
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // OTP (One-Time Password) for Login & Password Reset
  loginOTP: {
    code: String,
    expires: Date,
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    }
  },
  passwordResetOTP: {
    code: String,
    expires: Date,
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    }
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(phone) {
        // If no phone number, it's valid (optional)
        if (!phone || phone.trim() === '') {
          return true;
        }
        // If phone exists, validate it's 10 digits (remove any non-digit characters first)
        const cleanPhone = phone.replace(/\D/g, '');
        return /^[0-9]{10}$/.test(cleanPhone);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  phoneVerificationToken: String,
  phoneVerificationExpires: Date,
  
  // Address Information
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'billing', 'shipping'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'United States'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Employee/Admin Specific Fields
  employeeId: {
    type: String,
    sparse: true, // Only required for employees/admins
    unique: true
  },
  department: {
    type: String,
    enum: ['sales', 'Sales', 'support', 'Support', 'operations', 'Operations', 'management', 'Management', 'it', 'IT', 'hr', 'HR'],
    required: function() { 
      return this.role === 'employee' || this.role === 'admin'; 
    },
    default: function() {
      if (this.role === 'employee') return 'support';
      if (this.role === 'admin') return 'management';
      return undefined;
    }
  },
  position: {
    type: String,
    required: function() { 
      return this.role === 'employee' || this.role === 'admin'; 
    },
    default: function() {
      if (this.role === 'employee') return 'Employee';
      if (this.role === 'admin') return 'Administrator';
      return undefined;
    }
  },
  hireDate: {
    type: Date,
    required: function() { 
      return this.role === 'employee' || this.role === 'admin'; 
    },
    default: function() {
      if (this.role === 'employee' || this.role === 'admin') return new Date();
      return undefined;
    }
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make supervisor optional for employees
  },
  
  // Customer Specific Fields
  customerId: {
    type: String,
    sparse: true,
    unique: true
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  
  // Security and Authentication
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  
  // Two-Factor Authentication
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  backupCodes: [String],
  
  // Password Management
  isTemporaryPassword: {
    type: Boolean,
    default: false
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  
  // Timestamps
  // Quiz System
  quizPoints: {
    type: Number,
    default: 0
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: '🏆'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['Quiz', 'Learning', 'Achievement', 'Special'],
      default: 'Quiz'
    }
  }],
  quizStats: {
    totalQuizzes: {
      type: Number,
      default: 0
    },
    completedQuizzes: {
      type: Number,
      default: 0
    },
    passedQuizzes: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.username || this.email;
});

// Virtual for isLocked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to change password
userSchema.methods.changePassword = async function(newPassword) {
  // Validate password strength
  const { validatePasswordStrength } = require('../utils/passwordUtils');
  const validation = validatePasswordStrength(newPassword);
  
  if (!validation.isValid) {
    throw new Error(validation.message);
  }
  
  // Hash the new password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(newPassword, salt);
  
  // Update password management fields
  this.isTemporaryPassword = false;
  this.passwordChangedAt = new Date();
  
  // Reset login attempts and lock status
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  
  await this.save();
  return true;
};

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'addresses.city': 1 });
userSchema.index({ 'addresses.state': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Note: Password hashing is now handled manually in creation methods and changePassword method
// to ensure temporary passwords are properly managed

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'admin') return true;
  return this.permissions.includes(permission);
};

// Instance method to check if user can access role
userSchema.methods.canAccessRole = function(targetRole) {
  const roleHierarchy = {
    'customer': 1,
    'employee': 2,
    'admin': 3
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[targetRole];
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

// Static method to create customer
userSchema.statics.createCustomer = async function(userData) {
  const { generateTemporaryPassword } = require('../utils/passwordUtils');
  
  // Generate temporary password
  const temporaryPassword = generateTemporaryPassword();
  
  // Hash the temporary password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(temporaryPassword, salt);
  
  // Create user with temporary password
  const user = new this({
    ...userData,
    password: hashedPassword,
    role: 'customer',
    isTemporaryPassword: true,
    customerId: `CUST${Date.now()}`,
    permissions: ['read_products', 'read_orders', 'write_orders']
  });
  
  await user.save();
  
  // Return user with temporary password for communication
  return {
    user,
    temporaryPassword
  };
};

// Static method to create employee
userSchema.statics.createEmployee = async function(userData) {
  const { generateTemporaryPassword } = require('../utils/passwordUtils');
  
  // Generate temporary password
  const temporaryPassword = generateTemporaryPassword();
  
  // Hash the temporary password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(temporaryPassword, salt);
  
  // Create user with temporary password
  const user = new this({
    ...userData,
    password: hashedPassword,
    role: 'employee',
    isTemporaryPassword: true,
    employeeId: `EMP${Date.now()}`,
    hireDate: new Date(),
    supervisor: userData.supervisor || null, // Make supervisor optional
    permissions: [
      'read_products', 'read_orders', 'write_orders',
      'read_analytics'
    ]
  });
  
  await user.save();
  
  // Return user with temporary password for communication
  return {
    user,
    temporaryPassword
  };
};

// Static method to create admin
userSchema.statics.createAdmin = async function(userData) {
  const { generateTemporaryPassword } = require('../utils/passwordUtils');
  
  // Generate temporary password
  const temporaryPassword = generateTemporaryPassword();
  
  // Hash the temporary password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(temporaryPassword, salt);
  
  // Create user with temporary password
  const user = new this({
    ...userData,
    password: hashedPassword,
    role: 'admin',
    isTemporaryPassword: true,
    employeeId: `ADM${Date.now()}`,
    permissions: [
      'read_products', 'write_products', 'delete_products',
      'read_orders', 'write_orders', 'delete_orders',
      'read_users', 'write_users', 'delete_users',
      'read_analytics', 'write_analytics',
      'manage_system', 'manage_roles'
    ]
  });
  
  await user.save();
  
  // Return user with temporary password for communication
  return {
    user,
    temporaryPassword
  };
};

module.exports = mongoose.model('User', userSchema);
