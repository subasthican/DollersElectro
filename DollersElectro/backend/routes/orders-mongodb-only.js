const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Ensure MongoDB is connected
const ensureMongoDB = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection required');
  }
};

// Helper function to add id field for MongoDB compatibility
const addIdField = (item) => {
  if (item && item._id) {
    item.id = item._id;
  }
  if (item && item.product && item.product._id) {
    item.product.id = item.product._id;
  }
  return item;
};

// Helper function to process orders array
const processOrders = (orders) => {
  if (Array.isArray(orders)) {
    return orders.map(addIdField);
  }
  return orders;
};

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required role: ${roles}, User role: ${userRole}`
      });
    }

    next();
  };
};

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const userId = req.user.id;
    const orders = await Order.find({ customer: userId })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, customer: userId })
      .populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// POST /api/orders - Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { items, totalAmount, paymentMethod = 'cash_on_delivery', deliveryMethod = 'home_delivery' } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid total amount is required'
      });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Process items and verify products exist
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      const itemPrice = product.price || 0;
      const itemTotal = itemPrice * (item.quantity || 1);
      subtotal += itemTotal;

      processedItems.push({
        product: item.product,
        quantity: item.quantity || 1,
        price: itemPrice,
        total: itemTotal,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          image: product.images?.[0]?.url || ''
        }
      });
    }

    // Calculate totals
    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
    const shipping = deliveryMethod === 'express_delivery' ? 15.00 : 5.00;
    const total = subtotal + tax + shipping;

    const order = new Order({
      orderNumber,
      customer: userId,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      shipping,
      total: Math.round(total * 100) / 100,
      payment: {
        method: paymentMethod,
        status: 'pending',
        amount: total
      },
      delivery: {
        method: deliveryMethod,
        status: 'pending'
      },
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: addIdField(order)
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// POST /api/orders/checkout - Create order from cart (temporary checkout)
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { cartItems, paymentMethod = 'cash_on_delivery', deliveryMethod = 'home_delivery' } = req.body;
    const userId = req.user.id;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Process items and verify products exist
    const processedItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      const itemPrice = product.price || 0;
      const itemTotal = itemPrice * (item.quantity || 1);
      subtotal += itemTotal;

      processedItems.push({
        product: item.product,
        quantity: item.quantity || 1,
        price: itemPrice,
        total: itemTotal,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          image: product.images?.[0]?.url || ''
        }
      });
    }

    // Calculate totals
    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
    const shipping = deliveryMethod === 'express_delivery' ? 15.00 : 5.00;
    const total = subtotal + tax + shipping;

    const order = new Order({
      orderNumber,
      customer: userId,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      shipping,
      total: Math.round(total * 100) / 100,
      payment: {
        method: paymentMethod,
        status: 'completed', // Mark as completed for testing
        amount: total,
        transactionId: `TEMP-${Date.now()}`,
        paymentDate: new Date()
      },
      delivery: {
        method: deliveryMethod,
        status: 'pending'
      },
      status: 'confirmed' // Mark as confirmed for testing
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully (Temporary checkout - no real payment)',
      data: {
        order: addIdField(order),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        note: 'This is a temporary checkout for testing. No real payment was processed.'
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: addIdField(order)
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// GET /api/orders/admin/all - Get all orders (admin only)
router.get('/admin/all', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    ensureMongoDB();
    
    const {
      page = 1,
      limit = 50,
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'firstName lastName email')
        .populate('items.product', 'name price images')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, customer: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

module.exports = router;

