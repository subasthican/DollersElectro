const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
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
    item.id = item._id.toString();
  }
  if (item && item.product) {
    if (typeof item.product === 'object' && item.product._id) {
      item.product.id = item.product._id.toString();
    } else if (typeof item.product === 'string') {
      // If product is just an ID string, keep it as is
      item.product = item.product.toString();
    }
  }
  return item;
};

// Helper function to process cart items
const processCartItems = (items) => {
  if (Array.isArray(items)) {
    return items.map(item => {
      // Convert to plain object and ensure all ObjectIds are strings
      const processedItem = { ...item.toObject ? item.toObject() : item };
      
      // Keep the full product object if it's populated, otherwise convert to string
      if (processedItem.product && processedItem.product._id) {
        // If product is populated (has name, price, etc.), keep the full object
        if (processedItem.product.name) {
          // Add id field to the product object
          processedItem.product.id = processedItem.product._id.toString();
        } else {
          // If product is not populated, convert to string
          processedItem.product = processedItem.product._id.toString();
        }
      }
      
      return addIdField(processedItem);
    });
  }
  return items;
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

// GET /api/cart - Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.json({
        success: true,
        data: {
          items: [],
          itemCount: 0,
          total: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        items: processCartItems(cart.items || []),
        itemCount: cart.items ? cart.items.length : 0,
        total: cart.total || 0
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart'
    });
  }
});

// POST /api/cart - Add item to cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Validate ObjectId format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    // Check if item already exists
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();

    // Convert cart to plain object to avoid BSON serialization issues
    const cartObj = cart.toObject();
    const processedCart = addIdField(cartObj);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: processCartItems(cartObj.items),
        itemCount: cartObj.items.length,
        _id: cartObj._id.toString(),
        id: cartObj._id.toString()
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// PUT /api/cart/:productId - Update item quantity
router.put('/:productId', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be non-negative'
      });
    }

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        items: processCartItems(cart.items),
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: processCartItems(cart.items),
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    ensureMongoDB();
    
    const userId = req.user.id;
    await Cart.findOneAndDelete({ user: userId });

    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        itemCount: 0,
        total: 0
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

module.exports = router;
