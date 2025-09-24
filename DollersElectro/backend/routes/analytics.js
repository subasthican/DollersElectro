const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

// Middleware to ensure all analytics routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// @route   GET /api/admin/analytics/dashboard
// @desc    Get dashboard statistics (admin only)
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    
    // Get order status counts
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Calculate total revenue
    const completedOrdersData = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrdersData.reduce((sum, order) => sum + order.total, 0);
    
    // Get monthly revenue data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = await Order.find({
        status: 'completed',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
      const monthCustomers = new Set(monthOrders.map(order => order.customer.toString())).size;
      
      monthlyRevenue.push({
        date: startOfMonth.toISOString().split('T')[0],
        revenue: monthRevenue,
        orders: monthOrders.length,
        customers: monthCustomers
      });
    }
    
    // Get top products by revenue
    const topProducts = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    
    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (product) => {
        const productDetails = await Product.findById(product._id);
        if (productDetails) {
          return {
            productId: product._id.toString(),
            name: productDetails.name,
            category: productDetails.category,
            totalSold: product.totalSold,
            revenue: product.revenue,
            stockLevel: productDetails.stockQuantity,
            isActive: productDetails.isActive
          };
        }
        return null;
      })
    );
    
    // Get top customers by total spent
    const topCustomers = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);
    
    // Get customer details for top customers
    const topCustomersWithDetails = await Promise.all(
      topCustomers.map(async (customer) => {
        const customerDetails = await User.findById(customer._id);
        if (customerDetails) {
          return {
            customerId: customer._id.toString(),
            name: `${customerDetails.firstName} ${customerDetails.lastName}`,
            email: customerDetails.email,
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent,
            lastOrderDate: customer.lastOrderDate.toISOString(),
            isActive: customerDetails.isActive
          };
        }
        return null;
      })
    );
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName email');
    
    const recentOrdersFormatted = recentOrders.map(order => ({
      orderId: order._id.toString(),
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      totalAmount: order.total,
      status: order.status,
      orderDate: order.createdAt.toISOString(),
      paymentStatus: order.payment.status
    }));
    
    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        activeProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        monthlyRevenue,
        topProducts: topProductsWithDetails.filter(p => p !== null),
        topCustomers: topCustomersWithDetails.filter(c => c !== null),
        recentOrders: recentOrdersFormatted
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales data for charts (admin only)
// @access  Admin
router.get('/sales', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy, dateFormat, days;
    
    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateFormat = '%Y-%m-%d';
        days = 30;
        break;
      case 'weekly':
        groupBy = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
        dateFormat = '%Y-W%U';
        days = 90;
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        dateFormat = '%Y-%m';
        days = 365;
        break;
      default:
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        dateFormat = '%Y-%m';
        days = 365;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const salesData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          customers: { $addToSet: '$customer' }
        }
      },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          customers: { $size: '$customers' }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    res.json({
      success: true,
      message: 'Sales data retrieved successfully',
      data: salesData
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales data'
    });
  }
});

// @route   GET /api/admin/analytics/products
// @desc    Get product analytics (admin only)
// @access  Admin
router.get('/products', async (req, res) => {
  try {
    const productAnalytics = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    const productsWithDetails = await Promise.all(
      productAnalytics.map(async (product) => {
        const productDetails = await Product.findById(product._id);
        if (productDetails) {
          return {
            productId: product._id.toString(),
            name: productDetails.name,
            category: productDetails.category,
            totalSold: product.totalSold,
            revenue: product.revenue,
            stockLevel: productDetails.stockQuantity,
            isActive: productDetails.isActive
          };
        }
        return null;
      })
    );
    
    res.json({
      success: true,
      message: 'Product analytics retrieved successfully',
      data: productsWithDetails.filter(p => p !== null)
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product analytics'
    });
  }
});

// @route   GET /api/admin/analytics/customers
// @desc    Get customer analytics (admin only)
// @access  Admin
router.get('/customers', async (req, res) => {
  try {
    const customerAnalytics = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);
    
    const customersWithDetails = await Promise.all(
      customerAnalytics.map(async (customer) => {
        const customerDetails = await User.findById(customer._id);
        if (customerDetails) {
          return {
            customerId: customer._id.toString(),
            name: `${customerDetails.firstName} ${customerDetails.lastName}`,
            email: customerDetails.email,
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent,
            lastOrderDate: customer.lastOrderDate.toISOString(),
            isActive: customerDetails.isActive
          };
        }
        return null;
      })
    );
    
    res.json({
      success: true,
      message: 'Customer analytics retrieved successfully',
      data: customersWithDetails.filter(c => c !== null)
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer analytics'
    });
  }
});

// @route   GET /api/admin/analytics/orders
// @desc    Get order analytics (admin only)
// @access  Admin
router.get('/orders', async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('customerId', 'firstName lastName email');
    
    const ordersFormatted = recentOrders.map(order => ({
      orderId: order._id.toString(),
      customerName: `${order.customerId.firstName} ${order.customerId.lastName}`,
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: order.createdAt.toISOString(),
      paymentStatus: order.paymentStatus
    }));
    
    res.json({
      success: true,
      message: 'Order analytics retrieved successfully',
      data: ordersFormatted
    });
  } catch (error) {
    console.error('Order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order analytics'
    });
  }
});

// @route   GET /api/admin/analytics/revenue-by-category
// @desc    Get revenue by category (admin only)
// @access  Admin
router.get('/revenue-by-category', async (req, res) => {
  try {
    const revenueByCategory = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    const formattedData = revenueByCategory.map(item => ({
      category: item._id || 'Uncategorized',
      revenue: item.revenue,
      count: item.count
    }));
    
    res.json({
      success: true,
      message: 'Revenue by category retrieved successfully',
      data: formattedData
    });
  } catch (error) {
    console.error('Revenue by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue by category'
    });
  }
});

// @route   GET /api/admin/analytics/customer-growth
// @desc    Get customer growth data (admin only)
// @access  Admin
router.get('/customer-growth', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy, dateFormat, days;
    
    switch (period) {
      case 'monthly':
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        days = 365;
        break;
      case 'quarterly':
        groupBy = { $dateToString: { format: '%Y-Q%q', date: '$createdAt' } };
        days = 1095;
        break;
      case 'yearly':
        groupBy = { $dateToString: { format: '%Y', date: '$createdAt' } };
        days = 3650;
        break;
      default:
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        days = 365;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const customerGrowth = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calculate cumulative totals
    let runningTotal = 0;
    const growthWithTotals = customerGrowth.map(item => {
      runningTotal += item.newCustomers;
      return {
        period: item._id,
        newCustomers: item.newCustomers,
        totalCustomers: runningTotal
      };
    });
    
    res.json({
      success: true,
      message: 'Customer growth data retrieved successfully',
      data: growthWithTotals
    });
  } catch (error) {
    console.error('Customer growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer growth data'
    });
  }
});

module.exports = router;
