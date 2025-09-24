const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');
const Order = require('../models/Order');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Test route to debug authentication
router.get('/test-auth', authenticateToken, (req, res) => {
  console.log('🔍 Test Auth Route - Full Request:', {
    userId: req.userId,
    userRole: req.userRole,
    user: req.user,
    headers: req.headers
  });
  
  res.json({
    success: true,
    message: 'Authentication test successful',
    data: {
      userId: req.userId,
      userRole: req.userRole,
      user: req.user ? {
        id: req.user._id,
        role: req.user.role,
        email: req.user.email,
        firstName: req.user.firstName
      } : null
    }
  });
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/promo-codes
// @desc    Get all promo codes (admin only)
// @access  Private (admin only)
router.get('/', authenticateToken, async (req, res) => {
  // Debug: Log authentication info
  console.log('🔍 Debug - User ID:', req.userId);
  console.log('🔍 Debug - User Role:', req.userRole);
  console.log('🔍 Debug - Full User:', req.user);
  
  // Check role manually
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: `Insufficient permissions. Required role: admin, User role: ${req.userRole}`
    });
  }
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status === 'active') {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    } else if (status === 'expired') {
      query.validUntil = { $lt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    const skip = (page - 1) * limit;
    
    const promoCodes = await PromoCode.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await PromoCode.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        promoCodes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo codes'
    });
  }
});

// @route   POST /api/promo-codes
// @desc    Create new promo code (admin only)
// @access  Private (admin only)
router.post('/', authenticateToken, async (req, res) => {
  // Debug: Log authentication info
  console.log('🔍 Debug - User ID:', req.userId);
  console.log('🔍 Debug - User Role:', req.userRole);
  console.log('🔍 Debug - Full User:', req.user);
  
  // Check role manually
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: `Insufficient permissions. Required role: admin, User role: ${req.userRole}`
    });
  }
  try {
    const {
      code,
      name,
      description,
      type,
      value,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
      userRestrictions
    } = req.body;
    
    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }
    
    const promoCode = new PromoCode({
      code,
      name,
      description,
      type,
      value,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscount,
      usageLimit: usageLimit || -1,
      userUsageLimit: userUsageLimit || 1,
      validFrom: validFrom || new Date(),
      validUntil,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      excludedCategories: excludedCategories || [],
      excludedProducts: excludedProducts || [],
      userRestrictions: userRestrictions || {},
      createdBy: req.userId,
      lastModifiedBy: req.userId
    });
    
    await promoCode.save();
    
    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: promoCode
    });
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promo code'
    });
  }
});

// @route   GET /api/promo-codes/:id
// @desc    Get promo code by ID (admin only)
// @access  Private (admin only)
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }
    
    res.json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    console.error('Get promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo code'
    });
  }
});

// @route   PUT /api/promo-codes/:id
// @desc    Update promo code (admin only)
// @access  Private (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }
    
    // Check if code is being changed and if new code already exists
    if (req.body.code && req.body.code !== promoCode.code) {
      const existingCode = await PromoCode.findOne({ 
        code: req.body.code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Promo code already exists'
        });
      }
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy' && key !== 'createdAt') {
        promoCode[key] = req.body[key];
      }
    });
    
    promoCode.lastModifiedBy = req.userId;
    await promoCode.save();
    
    res.json({
      success: true,
      message: 'Promo code updated successfully',
      data: promoCode
    });
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promo code'
    });
  }
});

// @route   DELETE /api/promo-codes/:id
// @desc    Delete promo code (admin only)
// @access  Private (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }
    
    // Check if code has been used
    if (promoCode.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete promo code that has been used'
      });
    }
    
    await PromoCode.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promo code'
    });
  }
});

// @route   PATCH /api/promo-codes/:id/toggle
// @desc    Toggle promo code active status (admin only)
// @access  Private (admin only)
router.patch('/:id/toggle', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }
    
    promoCode.isActive = !promoCode.isActive;
    promoCode.lastModifiedBy = req.userId;
    await promoCode.save();
    
    res.json({
      success: true,
      message: `Promo code ${promoCode.isActive ? 'activated' : 'deactivated'} successfully`,
      data: promoCode
    });
  } catch (error) {
    console.error('Toggle promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle promo code status'
    });
  }
});

// ==================== CUSTOMER ROUTES ====================

// @route   POST /api/promo-codes/validate
// @desc    Validate promo code for customer
// @access  Private (authenticated users)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { code, orderData } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }
    
    // Find the promo code
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });
    
    if (!promoCode) {
      return res.json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }
    
    // Validate for the order
    const validation = promoCode.validateForOrder(orderData, req.userId);
    
    if (!validation.valid) {
      return res.json({
        success: false,
        message: validation.message
      });
    }
    
    // Calculate discount
    const discount = promoCode.calculateDiscount(orderData.subtotal);
    
    res.json({
      success: true,
      message: 'Promo code is valid',
      data: {
        promoCode: {
          id: promoCode._id,
          code: promoCode.code,
          name: promoCode.name,
          type: promoCode.type,
          value: promoCode.value,
          discount: discount
        }
      }
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code'
    });
  }
});

// @route   GET /api/promo-codes/available
// @desc    Get available promo codes for customer
// @access  Private (authenticated users)
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const promoCodes = await PromoCode.getActiveCodes();
    
    // Filter out codes that don't meet basic requirements
    const availableCodes = promoCodes.filter(code => {
      return code.usageLimit === -1 || code.usedCount < code.usageLimit;
    });
    
    res.json({
      success: true,
      data: availableCodes.map(code => ({
        id: code._id,
        code: code.code,
        name: code.name,
        description: code.description,
        type: code.type,
        value: code.value,
        minimumOrderAmount: code.minimumOrderAmount,
        validUntil: code.validUntil
      }))
    });
  } catch (error) {
    console.error('Get available promo codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available promo codes'
    });
  }
});

// ==================== ANALYTICS ROUTES ====================

// @route   GET /api/promo-codes/analytics/usage
// @desc    Get promo code usage analytics (admin only)
// @access  Private (admin only)
router.get('/analytics/usage', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const usageStats = await PromoCode.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCodes: { $sum: 1 },
          activeCodes: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isActive', true] }, { $gte: ['$validUntil', new Date()] }] },
                1,
                0
              ]
            }
          },
          totalUsage: { $sum: '$usedCount' },
          averageUsage: { $avg: '$usedCount' }
        }
      }
    ]);
    
    const topCodes = await PromoCode.find()
      .sort({ usedCount: -1 })
      .limit(5)
      .select('code name usedCount');
    
    res.json({
      success: true,
      data: {
        stats: usageStats[0] || {
          totalCodes: 0,
          activeCodes: 0,
          totalUsage: 0,
          averageUsage: 0
        },
        topCodes
      }
    });
  } catch (error) {
    console.error('Get promo code analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

module.exports = router;
