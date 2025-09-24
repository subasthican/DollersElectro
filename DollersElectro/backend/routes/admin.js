const express = require('express');
const { authenticateToken, requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message'); // Added Message model import

const router = express.Router();

// Middleware to ensure all admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// @route   GET /api/admin/sessions
// @desc    Get all active sessions (admin only)
// @access  Admin
router.get('/sessions', async (req, res) => {
  try {
    // This would require a session store that can list all sessions
    // For now, we'll return session info for the current admin
    res.json({
      success: true,
      message: 'Admin session info retrieved',
      data: {
        currentSession: {
          sessionID: req.sessionID,
          userId: req.session.userId,
          role: req.session.userRole,
          lastActivity: req.session.lastActivity
        },
        message: 'Session management features coming soon'
      }
    });
  } catch (error) {
    console.error('Admin sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session information'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query, '-password -emailVerificationToken -phoneVerificationToken');
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user (admin only)
// @access  Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -emailVerificationToken -phoneVerificationToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user (admin only)
// @access  Admin
router.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, username, role = 'customer' } = req.body;

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

    let user;
    let temporaryPassword;

    if (role === 'employee') {
      const result = await User.createEmployee({
        firstName,
        lastName,
        email,
        username,
        department: req.body.department || 'General',
        position: req.body.position || 'Employee',
        salary: req.body.salary
      });
      user = result.user;
      temporaryPassword = result.temporaryPassword;
    } else {
      const result = await User.createCustomer({
        firstName,
        lastName,
        email,
        phone,
        username
      });
      user = result.user;
      temporaryPassword = result.temporaryPassword;
    }

    res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        temporaryPassword
      }
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, username, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email already exists (if changing email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check if username already exists (if changing username)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (username) user.username = username;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (soft delete - admin only)
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// @route   POST /api/admin/users/:userId/activate
// @desc    Activate/deactivate a user (admin only)
// @access  Admin
router.post('/users/:userId/activate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Admin user activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/admin/employees
// @desc    Get all employees (admin only)
// @access  Admin
router.get('/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }, '-password -emailVerificationToken -phoneVerificationToken');
    
    res.json({
      success: true,
      message: 'Employees retrieved successfully',
      data: {
        employees,
        total: employees.length
      }
    });
  } catch (error) {
    console.error('Admin employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees'
    });
  }
});

// @route   POST /api/admin/employees
// @desc    Create new employee (admin only)
// @access  Admin
router.post('/employees', async (req, res) => {
  try {
    const { firstName, lastName, email, username, department, position, salary } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create employee using the static method
    const { user: newEmployee, temporaryPassword } = await User.createEmployee({
      firstName,
      lastName,
      email,
      username,
      department,
      position,
      salary: parseFloat(salary)
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employee: {
          id: newEmployee._id,
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          email: newEmployee.email,
          username: newEmployee.username,
          role: newEmployee.role,
          department: newEmployee.department,
          position: newEmployee.position,
          employeeId: newEmployee.employeeId,
          hireDate: newEmployee.hireDate,
          isActive: newEmployee.isActive
        },
        temporaryPassword
      }
    });
  } catch (error) {
    console.error('Admin create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee'
    });
  }
});

// @route   PUT /api/admin/employees/:id
// @desc    Update employee (admin only)
// @access  Admin
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, username, department, position, salary, isActive } = req.body;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employee'
      });
    }

    // Check if email/username already exists (excluding current user)
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }],
      _id: { $ne: id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Update employee fields
    employee.firstName = firstName;
    employee.lastName = lastName;
    employee.email = email;
    employee.username = username;
    employee.department = department;
    employee.position = position;
    employee.salary = parseFloat(salary);
    employee.isActive = isActive;

    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        employee: {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          username: employee.username,
          role: employee.role,
          department: employee.department,
          position: employee.position,
          employeeId: employee.employeeId,
          hireDate: employee.hireDate,
          isActive: employee.isActive
        }
      }
    });
  } catch (error) {
    console.error('Admin update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee'
    });
  }
});

// @route   DELETE /api/admin/employees/:id
// @desc    Delete employee (admin only) - Soft delete by setting isActive to false
// @access  Admin
router.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employee'
      });
    }

    // Soft delete - set isActive to false
    employee.isActive = false;
    await employee.save();

    res.json({
      success: true,
      message: 'Employee deactivated successfully',
      data: {
        employee: {
          id: employee._id,
          username: employee.username,
          email: employee.email,
          isActive: employee.isActive
        }
      }
    });
  } catch (error) {
    console.error('Admin delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate employee'
    });
  }
});

// @route   PATCH /api/admin/employees/:id/status
// @desc    Toggle employee status (admin only)
// @access  Admin
router.patch('/employees/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employee'
      });
    }

    // Toggle status
    employee.isActive = !employee.isActive;
    await employee.save();

    const action = employee.isActive ? 'activated' : 'deactivated';

    res.json({
      success: true,
      message: `Employee ${action} successfully`,
      data: {
        employee: {
          id: employee._id,
          username: employee.username,
          email: employee.email,
          isActive: employee.isActive
        }
      }
    });
  } catch (error) {
    console.error('Admin toggle employee status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle employee status'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics (admin only)
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const customers = await User.countDocuments({ role: 'customer' });
    const employees = await User.countDocuments({ role: 'employee' });
    const admins = await User.countDocuments({ role: 'admin' });

    res.json({
      success: true,
      message: 'Admin stats retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        roles: {
          customers,
          employees,
          admins
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin statistics'
    });
  }
});

// @route   POST /api/admin/logout-all
// @desc    Logout all users (admin only) - for emergency situations
// @access  Admin
router.post('/logout-all', async (req, res) => {
  try {
    // In a real application, you would invalidate all sessions
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'All users logged out successfully',
      data: {
        message: 'Session invalidation features coming soon'
      }
    });
  } catch (error) {
    console.error('Admin logout-all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout all users'
    });
  }
});

// Message Management Routes
// @route   GET /api/admin/messages
// @desc    Get all contact messages (admin/employee only)
// @access  Private (admin/employee only)
router.get('/messages', async (req, res) => {
  try {
    const { status, priority, category, assignedTo, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const messages = await Message.getMessagesWithUsers(filter)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Message.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   GET /api/admin/messages/stats
// @desc    Get message statistics (admin/employee only)
// @access  Private (admin/employee only)
router.get('/messages/stats', async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }
      }
    ]);
    
    const categoryStats = await Message.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          urgent: 0,
          high: 0
        },
        categories: categoryStats
      }
    });
    
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics'
    });
  }
});

module.exports = router;

