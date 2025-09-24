const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper function to add id field for MongoDB compatibility
const addIdField = (user) => {
  if (user && user._id) {
    user.id = user._id;
  }
  return user;
};

// Helper function to process users array
const processUsers = (users) => {
  if (Array.isArray(users)) {
    return users.map(addIdField);
  }
  return users;
};

// GET /api/users - Get all users (Admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken -twoFactorSecret -backupCodes')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users: processUsers(users) }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint' });
});

// PUT /api/users/profile - Update user profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile endpoint' });
});

// ===== ADMIN CUSTOMERS API =====

// GET /api/users/admin/customers - Get all customers (Admin only)
router.get('/admin/customers', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken -twoFactorSecret -backupCodes')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Customers retrieved successfully',
      data: { customers: processUsers(customers) }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers'
    });
  }
});

// GET /api/users/admin/customers/:id - Get specific customer (Admin only)
router.get('/admin/customers/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const customer = await User.findOne({ 
      _id: req.params.id, 
      role: 'customer' 
    }).select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken -twoFactorSecret -backupCodes');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer retrieved successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer'
    });
  }
});

// POST /api/users/admin/customers - Create new customer (Admin only)
router.post('/admin/customers', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, username } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Create customer using the static method
    const { user, temporaryPassword } = await User.createCustomer({
      firstName,
      lastName,
      email,
      phone,
      username
    });

    // Return customer data (without password)
    const customerData = user.toObject();
    delete customerData.password;

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { 
        customer: customerData,
        temporaryPassword // Admin needs this to communicate to customer
      }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer'
    });
  }
});

// PUT /api/users/admin/customers/:id - Update customer (Admin only)
router.put('/admin/customers/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, username, isActive } = req.body;

    const customer = await User.findOne({ 
      _id: req.params.id, 
      role: 'customer' 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if email already exists (if changing email)
    if (email && email !== customer.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check if username already exists (if changing username)
    if (username && username !== customer.username) {
      const existingUsername = await User.findOne({ 
        username,
        _id: { $ne: req.params.id }
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Update customer
    const updatedCustomer = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email: email ? email.toLowerCase() : customer.email,
        phone,
        username,
        isActive: isActive !== undefined ? isActive : customer.isActive
      },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken -twoFactorSecret -backupCodes');

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer: updatedCustomer }
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer'
    });
  }
});

// DELETE /api/users/admin/customers/:id - Delete customer (Admin only)
router.delete('/admin/customers/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const customer = await User.findOne({ 
      _id: req.params.id, 
      role: 'customer' 
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Soft delete - mark as inactive instead of removing
    customer.isActive = false;
    await customer.save();

    res.json({
      success: true,
      message: 'Customer deactivated successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer'
    });
  }
});

// PATCH /api/users/admin/customers/:id/status - Toggle customer status (Admin only)
router.patch('/admin/customers/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken -twoFactorSecret -backupCodes');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { customer }
    });
  } catch (error) {
    console.error('Toggle customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle customer status'
    });
  }
});

module.exports = router;
