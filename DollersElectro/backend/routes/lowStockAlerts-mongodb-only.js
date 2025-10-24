const express = require('express');
const router = express.Router();
const LowStockAlert = require('../models/LowStockAlert');
const Product = require('../models/Product');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper function to add id field
const addIdField = (obj) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => addIdField(item));
    } else {
      const newObj = { ...obj };
      if (newObj._id) {
        newObj.id = newObj._id.toString();
        delete newObj._id;
      }
      return newObj;
    }
  }
  return obj;
};

// GET /api/low-stock-alerts - Get all low stock alerts
router.get('/', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      priority = null,
      alertType = null,
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (status !== 'all') filter.status = status;
    if (priority) filter.priority = priority;
    if (alertType) filter.alertType = alertType;

    const alerts = await LowStockAlert.find(filter)
      .populate('product', 'name sku category price stock lowStockThreshold')
      .populate('acknowledgedBy', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalAlerts = await LowStockAlert.countDocuments(filter);

    res.json({
      success: true,
      data: {
        alerts: addIdField(alerts),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAlerts / parseInt(limit)),
          totalAlerts,
          hasNext: skip + alerts.length < totalAlerts,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock alerts'
    });
  }
});

// GET /api/low-stock-alerts/stats - Get alert statistics
router.get('/stats', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const stats = await LowStockAlert.getAlertStats();
    const activeAlerts = await LowStockAlert.getActiveAlerts();

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          total: 0,
          active: 0,
          acknowledged: 0,
          resolved: 0,
          dismissed: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        activeAlerts: addIdField(activeAlerts)
      }
    });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert statistics'
    });
  }
});

// PUT /api/low-stock-alerts/:id/acknowledge - Acknowledge an alert
router.put('/:id/acknowledge', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const alert = await LowStockAlert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.acknowledge(userId, notes);

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: {
        alert: addIdField(alert)
      }
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert'
    });
  }
});

// PUT /api/low-stock-alerts/:id/resolve - Resolve an alert
router.put('/:id/resolve', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const alert = await LowStockAlert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.resolve(userId, notes);

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: {
        alert: addIdField(alert)
      }
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert'
    });
  }
});

// PUT /api/low-stock-alerts/:id/dismiss - Dismiss an alert
router.put('/:id/dismiss', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const alert = await LowStockAlert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.dismiss(userId, notes);

    res.json({
      success: true,
      message: 'Alert dismissed successfully',
      data: {
        alert: addIdField(alert)
      }
    });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss alert'
    });
  }
});

// POST /api/low-stock-alerts/check - Check for low stock products and create alerts
router.post('/check', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const alertsCreated = [];

    for (const product of products) {
      const threshold = product.lowStockThreshold || 10;
      
      if (product.stock <= threshold) {
        const alert = await LowStockAlert.createLowStockAlert(product, product.stock, threshold);
        alertsCreated.push(alert);
      }
    }

    res.json({
      success: true,
      message: `Checked ${products.length} products and created ${alertsCreated.length} alerts`,
      data: {
        productsChecked: products.length,
        alertsCreated: alertsCreated.length,
        alerts: addIdField(alertsCreated)
      }
    });
  } catch (error) {
    console.error('Error checking low stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check low stock products'
    });
  }
});

// DELETE /api/low-stock-alerts/:id - Delete an alert
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await LowStockAlert.findByIdAndDelete(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert'
    });
  }
});

// GET /api/low-stock-alerts/dashboard - Get dashboard data
router.get('/dashboard', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    const [
      stats,
      activeAlerts,
      criticalAlerts,
      recentAlerts
    ] = await Promise.all([
      LowStockAlert.getAlertStats(),
      LowStockAlert.getActiveAlerts(),
      LowStockAlert.getActiveAlerts({ priority: 'critical' }),
      LowStockAlert.find({ status: 'active' })
        .populate('product', 'name sku category price stock')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          total: 0,
          active: 0,
          acknowledged: 0,
          resolved: 0,
          dismissed: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        activeAlerts: addIdField(activeAlerts),
        criticalAlerts: addIdField(criticalAlerts),
        recentAlerts: addIdField(recentAlerts)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;




