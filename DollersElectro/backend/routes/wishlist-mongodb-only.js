const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Middleware to ensure MongoDB connection
const ensureMongoDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({
      success: false,
      message: 'Database connection not available'
    });
  }
  next();
};

// Helper function to add id field for MongoDB compatibility
const addIdField = (item) => {
  if (item && item._id) {
    item.id = item._id.toString();
  }
  if (item && item.product && item.product._id) {
    item.product.id = item.product._id.toString();
  }
  return item;
};

// Helper function to process wishlist items
const processWishlistItems = (items) => {
  if (Array.isArray(items)) {
    return items
      .filter(item => item.product && item.product._id) // Filter out items with missing products
      .map(item => {
        const processedItem = { ...item.toObject ? item.toObject() : item };
        return addIdField(processedItem);
      });
  }
  return items;
};

// GET /api/wishlist - Get user's wishlist
router.get('/', authenticateToken, ensureMongoDB, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await Wishlist.getOrCreateWishlist(userId);
    
    // Populate product data
    await wishlist.populate('items.product');
    
    // Process items and filter out those with missing products
    const processedItems = processWishlistItems(wishlist.items);
    
    res.json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        wishlist: {
          id: wishlist._id.toString(),
          _id: wishlist._id.toString(),
          itemCount: processedItems.length, // Use filtered items length
          items: processedItems,
          createdAt: wishlist.createdAt,
          updatedAt: wishlist.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist'
    });
  }
});

// POST /api/wishlist - Add item to wishlist
router.post('/', authenticateToken, ensureMongoDB, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, notes = '' } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const wishlist = await Wishlist.getOrCreateWishlist(userId);
    const result = await wishlist.addItem(productId, notes);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    // Populate the product details
    await wishlist.populate('items.product');
    
    res.json({
      success: true,
      message: result.message,
      data: {
        wishlist: {
          id: wishlist._id.toString(),
          _id: wishlist._id.toString(),
          itemCount: processWishlistItems(wishlist.items).length, // Use filtered items length
          items: processWishlistItems(wishlist.items)
        }
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist'
    });
  }
});

// DELETE /api/wishlist/:productId - Remove item from wishlist
router.delete('/:productId', authenticateToken, ensureMongoDB, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    const result = await wishlist.removeItem(productId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
    
    // Populate the product details
    await wishlist.populate('items.product');
    
    res.json({
      success: true,
      message: result.message,
      data: {
        wishlist: {
          id: wishlist._id.toString(),
          _id: wishlist._id.toString(),
          itemCount: processWishlistItems(wishlist.items).length, // Use filtered items length
          items: processWishlistItems(wishlist.items)
        }
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist'
    });
  }
});

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', authenticateToken, ensureMongoDB, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const wishlist = await Wishlist.findOne({ user: userId });
    const isInWishlist = wishlist ? wishlist.hasItem(productId) : false;
    
    res.json({
      success: true,
      message: 'Wishlist status checked',
      data: {
        isInWishlist,
        productId
      }
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status'
    });
  }
});

// DELETE /api/wishlist - Clear entire wishlist
router.delete('/', authenticateToken, ensureMongoDB, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    wishlist.items = [];
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        wishlist: {
          id: wishlist._id.toString(),
          _id: wishlist._id.toString(),
          itemCount: wishlist.items.length, // Use actual array length instead of hardcoded 0
          items: []
        }
      }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist'
    });
  }
});

// POST /api/wishlist/move-to-cart/:productId - Move item from wishlist to cart
router.post('/move-to-cart/:productId', authenticateToken, ensureMongoDB, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    // Check if product is in wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist || !wishlist.hasItem(productId)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }
    
    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.isActive || !product.isInStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }
    
    // Add to cart (you would need to implement cart functionality)
    // For now, we'll just remove from wishlist
    const result = wishlist.removeItem(productId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Item moved to cart successfully',
      data: {
        productId,
        quantity
      }
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move item to cart'
    });
  }
});

// POST /api/wishlist/cleanup - Clean up orphaned wishlist items
router.post('/cleanup', authenticateToken, ensureMongoDB, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.json({
        success: true,
        message: 'No wishlist found',
        data: { cleanedCount: 0 }
      });
    }
    
    // Get all product IDs in the wishlist
    const productIds = wishlist.items.map(item => item.product);
    
    // Find which products still exist
    const existingProducts = await Product.find({ _id: { $in: productIds } });
    const existingProductIds = existingProducts.map(p => p._id.toString());
    
    // Filter out items with non-existent products
    const originalCount = wishlist.items.length;
    wishlist.items = wishlist.items.filter(item => 
      existingProductIds.includes(item.product.toString())
    );
    
    await wishlist.save();
    
    const cleanedCount = originalCount - wishlist.items.length;
    
    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} orphaned wishlist items`,
      data: { cleanedCount }
    });
  } catch (error) {
    console.error('Cleanup wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup wishlist'
    });
  }
});

module.exports = router;
