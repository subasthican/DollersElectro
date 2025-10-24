const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Product = require('../models/Product');

// Ensure MongoDB is connected
const ensureMongoDB = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection required');
  }
};

// Helper function to add id field for MongoDB compatibility
const addIdField = (product) => {
  if (product && product._id) {
    product.id = product._id;
  }
  return product;
};

// Helper function to process products array
const processProducts = (products) => {
  if (Array.isArray(products)) {
    return products.map(addIdField);
  }
  return products;
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

// GET /api/products - Get all products (public)
router.get('/', async (req, res) => {
  try {
    ensureMongoDB();
    
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      isOnSale,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (inStock !== undefined) {
      filter.isInStock = inStock === 'true';
    }
    
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }
    
    if (isOnSale !== undefined) {
      filter.isOnSale = isOnSale === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products: processProducts(products),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    ensureMongoDB();
    
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    }).limit(8).select('-__v');

    res.json({
      success: true,
      data: processProducts(products)
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// GET /api/products/on-sale - Get products on sale
router.get('/on-sale', async (req, res) => {
  try {
    ensureMongoDB();
    
    const products = await Product.find({ 
      isOnSale: true, 
      isActive: true 
    }).limit(8).select('-__v');

    res.json({
      success: true,
      data: processProducts(products)
    });
  } catch (error) {
    console.error('Get on-sale products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch on-sale products'
    });
  }
});

// GET /api/products/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    ensureMongoDB();
    
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// GET /api/products/search - Search products
router.get('/search', async (req, res) => {
  try {
    ensureMongoDB();
    
    const { q, category, minPrice, maxPrice, inStock } = req.query;
    
    const filter = { isActive: true };
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (inStock !== undefined) {
      filter.isInStock = inStock === 'true';
    }

    const products = await Product.find(filter)
      .select('-__v')
      .limit(20);

    res.json({
      success: true,
      data: processProducts(products)
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

// GET /api/products/admin - Simple admin endpoint
router.get('/admin', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { products: processProducts(products) }
    });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin products'
    });
  }
});

// GET /api/products/admin/all - Get all products for admin (with pagination)
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const {
      page = 1,
      limit = 50,
      category,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      success: true,
      data: {
        products: processProducts(products),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin products'
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    ensureMongoDB();
    
    const product = await Product.findById(req.params.id).select('-__v');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { 
      $inc: { viewCount: 1 } 
    });

    res.json({
      success: true,
      data: { product: addIdField(product) }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// POST /api/products - Create product (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const {
      name, description, sku, price, originalPrice, costPrice, stock, lowStockThreshold,
      category, subcategory, tags, images, features, specifications, weight, dimensions,
      shippingClass, metaTitle, metaDescription, supplier, warranty
    } = req.body;

    if (!name || !description || !sku || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, sku, price, stock, category'
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    const product = new Product({
      name, description, sku: sku.toUpperCase(), price, originalPrice, costPrice, stock, lowStockThreshold,
      category, subcategory, tags, images: images || [], features: features || [],
      specifications: specifications || {}, weight, dimensions, shippingClass,
      metaTitle, metaDescription, supplier, warranty,
      isActive: true, createdAt: Date.now(), updatedAt: Date.now()
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: addIdField(product) }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Check if SKU is being changed and if it already exists
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({ 
          success: false, 
          message: 'SKU already exists' 
        });
      }
    }

    // Update product
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        product[key] = req.body[key];
      }
    });
    product.updatedAt = new Date();

    await product.save();

    res.json({ 
      success: true, 
      message: 'Product updated successfully', 
      data: { product: addIdField(product) } 
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: messages 
      });
    }
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product' 
    });
  }
});

// PATCH /api/products/:id/toggle-status - Toggle product status (admin only)
router.patch('/:id/toggle-status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const { isActive } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    product.isActive = isActive !== undefined ? isActive : !product.isActive;
    product.updatedAt = new Date();
    
    await product.save();

    res.json({ 
      success: true, 
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { product: addIdField(product) }
    });

  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle product status' 
    });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const { hard } = req.query;
    const isHardDelete = hard === 'true';
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    if (isHardDelete) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ 
        success: true, 
        message: 'Product permanently deleted from database' 
      });
    } else {
      product.isActive = false;
      product.updatedAt = new Date();
      await product.save();
      res.json({ 
        success: true, 
        message: 'Product deactivated (soft delete)' 
      });
    }

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete product' 
    });
  }
});

// PATCH /api/products/:id/stock - Update stock (admin only)
router.patch('/:id/stock', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    const { stock, operation = 'set' } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update stock based on operation
    if (operation === 'add') {
      product.stock += stock;
    } else if (operation === 'subtract') {
      product.stock = Math.max(0, product.stock - stock);
    } else {
      product.stock = stock;
    }

    product.updatedAt = new Date();
    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        productId: product._id,
        stock: product.stock,
        isInStock: product.isInStock
      }
    });

  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product stock'
    });
  }
});


// DELETE /api/products/admin/clear-all - Clear all products (admin only)
router.delete('/admin/clear-all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    ensureMongoDB();
    
    console.log('🗑️ Clearing all products...');
    const result = await Product.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} products from MongoDB`);

    res.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} products`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear products'
    });
  }
});

module.exports = router;
