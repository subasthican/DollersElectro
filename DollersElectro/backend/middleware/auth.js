const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Ensure MongoDB is connected
const ensureMongoDB = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection required');
  }
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    ensureMongoDB();
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Load User model dynamically
    const User = require('../models/User');
    
    // Find user in MongoDB and attach to request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Ensure roles is an array
    const roleArray = Array.isArray(roles) ? roles : [roles];

    // Check if user has any of the required roles
    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Insufficient permissions. Required role: ${roleArray.join(' or ')}, User role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Middleware to check if user has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Middleware to check if user can access specific role
const canAccessRole = (targetRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!req.user.canAccessRole(targetRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Middleware to check if user is accessing their own resource
const requireOwnership = (resourceIdField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
    
    // Admins can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Users can only access their own resources
    if (resourceId !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this resource' 
      });
    }

    next();
  };
};

// Middleware to check if user is accessing their own order
const requireOrderOwnership = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const orderId = req.params.orderId || req.body.orderId;
      
      // Admins and employees can access any order
      if (['admin', 'employee'].includes(req.user.role)) {
        return next();
      }

      // Customers can only access their own orders
      const Order = require('../models/Order');
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }

      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied to this order' 
        });
      }

      next();
    } catch (error) {
      console.error('Order ownership check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error checking order ownership' 
      });
    }
  };
};

// Middleware to check if user is accessing their own profile
const requireProfileOwnership = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const profileId = req.params.userId || req.params.id;
    
    // Admins can access any profile
    if (req.user.role === 'admin') {
      return next();
    }

    // Users can only access their own profile
    if (profileId !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this profile' 
      });
    }

    next();
  };
};

// Middleware to check if user is accessing their own cart
const requireCartOwnership = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const cartId = req.params.cartId || req.body.cartId;
      
      // Admins can access any cart
      if (req.user.role === 'admin') {
        return next();
      }

      // Users can only access their own cart
      const Cart = require('../models/Cart');
      const cart = await Cart.findById(cartId);
      
      if (!cart) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cart not found' 
        });
      }

      if (cart.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied to this cart' 
        });
      }

      next();
    } catch (error) {
      console.error('Cart ownership check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error checking cart ownership' 
      });
    }
  };
};

// Middleware to check if user is accessing their own wishlist
const requireWishlistOwnership = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const wishlistId = req.params.wishlistId || req.body.wishlistId;
      
      // Admins can access any wishlist
      if (req.user.role === 'admin') {
        return next();
      }

      // Users can only access their own wishlist
      // Assuming wishlist is stored in user document or separate collection
      if (wishlistId !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied to this wishlist' 
        });
      }

      next();
    } catch (error) {
      console.error('Wishlist ownership check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error checking wishlist ownership' 
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireRole,
  requirePermission,
  canAccessRole,
  requireOwnership,
  requireOrderOwnership,
  requireProfileOwnership,
  requireCartOwnership,
  requireWishlistOwnership
};
