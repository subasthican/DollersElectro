const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Ensure MongoDB is connected
const ensureMongoDB = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection required');
  }
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

// GET /api/payments - Get payment methods (basic endpoint)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Payment methods endpoint',
    data: {
      methods: ['stripe', 'paypal', 'cash_on_delivery', 'bank_transfer']
    }
  });
});

// POST /api/payments/create-payment-intent - Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { amount, currency = 'usd', items = [] } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Generate mock payment intent ID
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store payment intent (in a real app, this would be stored in database)
    // For now, we'll just return the mock data

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntentId,
        paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        currency
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// POST /api/payments/confirm - Confirm payment
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { paymentIntentId, amount, items = [] } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and amount are required'
      });
    }

    // Mock payment confirmation (in a real app, this would verify with payment provider)
    const paymentStatus = 'succeeded';

    if (paymentStatus === 'succeeded') {
      // Create order in MongoDB
      const orderData = {
        user: userId,
        items,
        totalAmount: amount,
        paymentIntentId,
        status: 'confirmed',
        paymentStatus: 'completed',
        createdAt: new Date()
      };

      const order = new Order(orderData);
      await order.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          orderId: order._id,
          paymentIntentId,
          status: 'succeeded',
          amount: amount
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed',
        data: {
          status: 'failed'
        }
      });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// GET /api/payments/status/:paymentIntentId - Get payment status
router.get('/status/:paymentIntentId', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { paymentIntentId } = req.params;
    const userId = req.user.id;

    // In a real app, this would check the actual payment status
    // For now, we'll return a mock status
    res.json({
      success: true,
      data: {
        paymentIntentId,
        status: 'succeeded',
        amount: 0 // Would be fetched from payment provider
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
});

// POST /api/payments/refund - Process refund
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { paymentIntentId, amount, reason } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and amount are required'
      });
    }

    // Mock refund processing (in a real app, this would process with payment provider)
    const refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId,
        paymentIntentId,
        amount,
        status: 'succeeded'
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

module.exports = router;

