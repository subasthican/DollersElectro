const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
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
    req.userId = decoded.id;
    req.userRole = decoded.role;
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

// @route   GET /api/orders/count
// @desc    Get total orders count (employee/admin)
// @access  Private (employee/admin)
router.get('/count', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    // Check if user is employee or admin
    if (req.userRole !== 'employee' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    const count = await Order.countDocuments();
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get orders count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders count'
    });
  }
});

// @route   GET /api/orders/pending-count
// @desc    Get count of pending orders (employee/admin)
// @access  Private (employee/admin)
router.get('/pending-count', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    // Check if user is employee or admin
    if (req.userRole !== 'employee' && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    const count = await Order.countDocuments({ status: 'pending' });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get pending orders count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending orders count'
    });
  }
});

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
      data: {
        orders: orders
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/pending-verification - Get orders with pending payment verification (admin/employee only)
// This route MUST be before /:id to avoid route parameter conflicts
router.get('/pending-verification', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    ensureMongoDB();
    
    const orders = await Order.find({ 
      'payment.status': 'pending_verification' 
    })
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'name price images')
    .sort({ 'payment.billUploadDate': -1 });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Get pending verification orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending verification orders',
      error: error.message
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
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const shipping = deliveryMethod === 'store_pickup' ? 0 : (deliveryMethod === 'express_delivery' ? 15.00 : 5.00);
    const total = subtotal + tax + shipping;

    // DO NOT generate pickup code yet - it will be generated after payment verification
    // Pickup code is only generated when admin verifies payment
    
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
        status: 'pending', // Pending until customer uploads payment bill
        amount: total
      },
      delivery: {
        method: deliveryMethod,
        status: 'pending'
      },
      status: 'pending_payment' // Order pending payment bill upload
    });

    await order.save();

    // Create notification for ALL admins about new order
    try {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' }).select('_id');
      
      console.log(`Found ${admins.length} admin users for notification`);
      
      if (admins.length === 0) {
        console.warn('WARNING: No admin users found in database! Cannot send order notification.');
      }
      
      for (const admin of admins) {
        console.log(`Creating notification for admin: ${admin._id}`);
        const notification = await Notification.create({
          recipient: admin._id,
          title: '🛒 New Order Placed!',
          content: `Customer placed a new order #${order.orderNumber}. Total: LKR ${order.total.toFixed(2)}. Waiting for payment bill upload.`,
          type: 'order',
          relatedOrder: order._id,
          priority: 'high',
          isRead: false
        });
        console.log(`✅ Notification created with ID: ${notification._id}`);
      }
      
      console.log(`✅ New order notification sent to ${admins.length} admins for order ${order.orderNumber}`);
    } catch (notifError) {
      console.error('❌ Failed to create admin notification:', notifError.message);
      console.error('Full error:', notifError);
      // Don't fail order creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please upload your payment bill to proceed.',
      data: {
        order: addIdField(order),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        nextStep: 'Please upload your bank transfer receipt/bill to verify payment.',
        note: 'Your pickup code will be generated after admin verifies your payment.'
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

    const order = await Order.findById(id).populate('customer');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;
    
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date();

    // Generate pickup code when order is marked as ready for pickup
    if (status === 'ready' && oldStatus !== 'ready' && order.delivery.method === 'store_pickup') {
      if (!order.delivery.pickupCode) {
        order.delivery.pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`✅ Generated pickup code ${order.delivery.pickupCode} for order ${order.orderNumber}`);
      }
    }

    await order.save();

    // Create notification for customer when order is ready for pickup
    if (status === 'ready' && oldStatus !== 'ready' && order.customer && order.delivery?.pickupCode) {
      try {
        const customerId = typeof order.customer === 'object' ? order.customer._id : order.customer;
        
        await Notification.create({
          recipient: customerId,
          title: '🎉 Order Ready for Pickup!',
          content: `Your order #${order.orderNumber} is ready for pickup! Your pickup code is: ${order.delivery.pickupCode}`,
          type: 'order',
          relatedOrder: order._id,
          priority: 'high',
          isRead: false
        });
        
        console.log(`Notification sent to customer ${customerId} for order ${order.orderNumber}`);
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Don't fail the whole request if notification fails
      }
    }

    // Create notification when order is marked as processing
    if (status === 'processing' && oldStatus !== 'processing' && order.customer) {
      try {
        const customerId = typeof order.customer === 'object' ? order.customer._id : order.customer;
        
        await Notification.create({
          recipient: customerId,
          title: '📦 Order Being Prepared',
          content: `Your order #${order.orderNumber} is now being prepared!`,
          type: 'order',
          relatedOrder: order._id,
          priority: 'medium',
          isRead: false
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    }

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

// ==================== PICKUP VERIFICATION ROUTES ====================

// GET /api/orders/pickup/verify/:code - Verify pickup code (admin/employee only)
router.get('/pickup/verify/:code', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    // Check if user is admin or employee
    if (req.user.role !== 'admin' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Admin or employee access required.'
      });
    }

    const { code } = req.params;
    
    if (!code || code.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup code format. Must be 4 digits.'
      });
    }

    // Find order with pickup code
    const order = await Order.findOne({
      'delivery.pickupCode': code,
      'delivery.method': 'store_pickup',
      status: { $in: ['confirmed', 'processing', 'ready'] }
    })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name sku images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pickup code not found or order not ready for pickup.'
      });
    }

    res.json({
      success: true,
      message: 'Pickup code verified successfully',
      data: {
        order: addIdField(order),
        customer: order.customer,
        items: order.items,
        pickupCode: order.delivery.pickupCode,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        orderDate: order.orderDate
      }
    });

  } catch (error) {
    console.error('Pickup verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify pickup code'
    });
  }
});

// POST /api/orders/pickup/complete/:code - Complete pickup (admin/employee only)
router.post('/pickup/complete/:code', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    // Check if user is admin or employee
    if (req.user.role !== 'admin' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Admin or employee access required.'
      });
    }

    const { code } = req.params;
    const { notes } = req.body;
    
    if (!code || code.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup code format. Must be 4 digits.'
      });
    }

    // Find and update order
    const order = await Order.findOneAndUpdate(
      {
        'delivery.pickupCode': code,
        'delivery.method': 'store_pickup',
        status: { $in: ['confirmed', 'processing', 'ready'] }
      },
      {
        status: 'delivered',
        'delivery.status': 'delivered',
        'delivery.actualDelivery': new Date(),
        'delivery.deliveryNotes': notes || 'Order picked up successfully',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('customer', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pickup code not found or order not ready for pickup.'
      });
    }

    res.json({
      success: true,
      message: 'Order pickup completed successfully',
      data: {
        order: addIdField(order),
        customer: order.customer,
        orderNumber: order.orderNumber,
        pickupTime: order.delivery.actualDelivery,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Pickup completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete pickup'
    });
  }
});

// GET /api/orders/pickup/pending - Get pending pickup orders (admin/employee only)
router.get('/pickup/pending', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    // Check if user is admin or employee
    if (req.user.role !== 'admin' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Admin or employee access required.'
      });
    }

    const orders = await Order.find({
      'delivery.method': 'store_pickup',
      status: { $in: ['confirmed', 'processing', 'ready_for_pickup'] }
    })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name sku images')
    .sort({ orderDate: -1 });

    res.json({
      success: true,
      message: 'Pending pickup orders retrieved successfully',
      data: {
        orders: orders.map(order => addIdField(order)),
        count: orders.length
      }
    });

  } catch (error) {
    console.error('Get pending pickups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending pickup orders'
    });
  }
});

// GET /api/orders/pickup/history - Get completed pickup orders (admin/employee only)
router.get('/pickup/history', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    // Check if user is admin or employee
    if (req.user.role !== 'admin' && req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Admin or employee access required.'
      });
    }

    const orders = await Order.find({
      'delivery.method': 'store_pickup',
      status: 'delivered',
      'delivery.status': 'delivered'
    })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name sku images')
    .sort({ 'delivery.actualDelivery': -1 })
    .limit(50); // Limit to last 50 completed pickups

    res.json({
      success: true,
      message: 'Pickup history retrieved successfully',
      data: {
        orders: orders.map(order => addIdField(order)),
        count: orders.length
      }
    });

  } catch (error) {
    console.error('Get pickup history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pickup history'
    });
  }
});

// POST /api/orders/:id/upload-payment-bill - Upload payment bill (Customer)
router.post('/:id/upload-payment-bill', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { id } = req.params;
    const { billImage } = req.body;
    const userId = req.user.id;

    if (!billImage) {
      return res.status(400).json({
        success: false,
        message: 'Payment bill image is required'
      });
    }

    // Find the order and ensure it belongs to the user
    const order = await Order.findOne({ 
      _id: id, 
      customer: userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    // Check if order is in correct status
    if (order.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'Payment bill can only be uploaded for orders pending payment'
      });
    }

    // Update order with payment bill
    order.payment.billImage = billImage;
    order.payment.billUploadDate = new Date();
    order.payment.status = 'pending_verification';
    order.status = 'pending'; // Move to pending status waiting for admin verification

    await order.save();

    // Notify ALL admins about payment bill upload
    try {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' }).select('_id');
      
      console.log(`Found ${admins.length} admin users for payment bill notification`);
      
      if (admins.length === 0) {
        console.warn('WARNING: No admin users found in database! Cannot send payment bill notification.');
      }
      
      for (const admin of admins) {
        console.log(`Creating payment bill notification for admin: ${admin._id}`);
        const notification = await Notification.create({
          recipient: admin._id,
          title: '💳 Payment Bill Uploaded!',
          content: `Customer uploaded payment bill for order #${order.orderNumber}. Please verify payment in Order Management.`,
          type: 'payment',
          relatedOrder: order._id,
          priority: 'high',
          isRead: false
        });
        console.log(`✅ Payment bill notification created with ID: ${notification._id}`);
      }
      
      console.log(`✅ Payment bill upload notification sent to ${admins.length} admins for order ${order.orderNumber}`);
    } catch (notifError) {
      console.error('❌ Failed to create payment bill admin notification:', notifError.message);
      console.error('Full error:', notifError);
    }

    res.json({
      success: true,
      message: 'Payment bill uploaded successfully. Your payment will be verified shortly.',
      data: {
        order: addIdField(order)
      }
    });

  } catch (error) {
    console.error('Upload payment bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment bill'
    });
  }
});

// POST /api/orders/:id/verify-payment - Verify payment bill (Admin only)
router.post('/:id/verify-payment', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user.id;

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if payment bill was uploaded
    if (!order.payment.billImage) {
      return res.status(400).json({
        success: false,
        message: 'No payment bill has been uploaded for this order'
      });
    }

    // Check if already verified
    if (order.payment.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been verified'
      });
    }

    // Update order payment status only - don't make ready yet
    order.payment.status = 'verified';
    order.payment.billVerifiedDate = new Date();
    order.payment.billVerifiedBy = adminId;
    order.payment.adminNotes = adminNotes || '';
    order.payment.paymentDate = new Date();
    order.status = 'processing'; // Set to processing, not ready yet
    
    await order.save();

    // Create notification for customer about payment verification
    try {
      const customerId = typeof order.customer === 'object' ? order.customer._id : order.customer;
      
      console.log(`📬 Creating payment verification notification for customer ${customerId}`);
      
      const notification = await Notification.create({
        recipient: customerId,
        title: '✅ Payment Verified!',
        content: `Your payment for order #${order.orderNumber} has been verified! Your order is now being processed.`,
        type: 'payment',
        relatedOrder: order._id,
        priority: 'high',
        isRead: false
      });
      
      console.log(`✅ Payment verification notification created successfully!`);
      console.log(`   Notification ID: ${notification._id}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Content: ${notification.content}`);
    } catch (notifError) {
      console.error('❌ Failed to create payment verification notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully. Order is now being processed.',
      data: {
        order: addIdField(order)
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// POST /api/orders/:id/process-order - Process order and make ready for pickup (Admin only)
router.post('/:id/process-order', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const { id } = req.params;
    const adminId = req.user.id;

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if payment is verified
    if (order.payment.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be verified before processing order'
      });
    }

    // Check if already ready
    if (order.status === 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order is already ready for pickup'
      });
    }

    // Update order status and generate pickup code
    order.status = 'ready'; // Mark as ready for pickup
    order.processedBy = adminId;
    order.processedDate = new Date();
    
    // Generate pickup code for store pickup orders
    if (order.delivery.method === 'store_pickup' && !order.delivery.pickupCode) {
      order.delivery.pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`✅ Generated pickup code ${order.delivery.pickupCode} for order ${order.orderNumber}`);
    }

    await order.save();

    // Create notification for customer about order ready for pickup
    try {
      const customerId = typeof order.customer === 'object' ? order.customer._id : order.customer;
      
      const notificationContent = order.delivery.pickupCode 
        ? `Your order #${order.orderNumber} is ready for pickup! 🎉 Pickup Code: ${order.delivery.pickupCode}. Show this code at ${order.delivery.pickupLocation}.`
        : `Your order #${order.orderNumber} has been processed and will be delivered soon!`;
      
      console.log(`📬 Creating order ready notification for customer ${customerId}`);
      console.log(`   Pickup Code: ${order.delivery.pickupCode || 'None (delivery order)'}`);
      
      const notification = await Notification.create({
        recipient: customerId,
        title: order.delivery.pickupCode ? '🎉 Order Ready for Pickup!' : '📦 Order Processed!',
        content: notificationContent,
        type: 'order',
        relatedOrder: order._id,
        priority: 'high',
        isRead: false
      });
      
      console.log(`✅ Order ready notification created successfully!`);
      console.log(`   Notification ID: ${notification._id}`);
      console.log(`   Title: ${notification.title}`);
    } catch (notifError) {
      console.error('❌ Failed to create order ready notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Order processed successfully and ready for pickup.',
      data: {
        order: addIdField(order),
        pickupCode: order.delivery.pickupCode
      }
    });

  } catch (error) {
    console.error('Process order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order'
    });
  }
});

// POST /api/orders/:id/reject-payment - Reject payment bill (Admin only)
router.post('/:id/reject-payment', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if payment bill was uploaded
    if (!order.payment.billImage) {
      return res.status(400).json({
        success: false,
        message: 'No payment bill has been uploaded for this order'
      });
    }

    // Update order payment status
    order.payment.status = 'rejected';
    order.payment.billRejectionReason = rejectionReason;
    order.payment.billVerifiedDate = new Date();
    order.payment.billVerifiedBy = adminId;
    order.payment.adminNotes = adminNotes || '';
    order.status = 'pending_payment'; // Move back to pending payment

    await order.save();

    // Create notification for customer about payment rejection
    try {
      const customerId = typeof order.customer === 'object' ? order.customer._id : order.customer;
      
      await Notification.create({
        recipient: customerId,
        title: '❌ Payment Rejected',
        content: `Your payment for order #${order.orderNumber} was rejected. Reason: ${rejectionReason}. Please upload a new payment bill.`,
        type: 'payment',
        relatedOrder: order._id,
        priority: 'high',
        isRead: false
      });
      
      console.log(`Payment rejection notification sent to customer ${customerId}`);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Payment rejected. Customer will be notified to upload a new bill.',
      data: {
        order: addIdField(order),
        rejectionReason
      }
    });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment'
    });
  }
});

// GET /api/orders/pending-verification - Get orders pending payment verification (Admin/Employee)
router.get('/pending-verification', authenticateToken, requireRole(['admin', 'employee']), async (req, res) => {
  try {
    ensureMongoDB();

    const orders = await Order.find({
      'payment.status': 'pending_verification'
    })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name sku images')
    .sort({ 'payment.billUploadDate': -1 });

    res.json({
      success: true,
      message: 'Pending payment verifications retrieved successfully',
      data: {
        orders: orders.map(order => addIdField(order)),
        count: orders.length
      }
    });

  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending verifications'
    });
  }
});

module.exports = router;

