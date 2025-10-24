const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
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

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      rating = null
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = { product: productId, status: 'approved' };
    if (rating) {
      filter.rating = parseInt(rating);
    }

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await Review.countDocuments(filter);
    const averageRating = await Review.getAverageRating(productId);
    const ratingDistribution = await Review.getRatingDistribution(productId);

    res.json({
      success: true,
      data: {
        reviews: addIdField(reviews),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1
        },
        averageRating: averageRating[0]?.averageRating || 0,
        totalReviews: averageRating[0]?.totalReviews || 0,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// POST /api/reviews - Create a new review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, title, content, rating, images = [] } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product (for verified purchase)
    // This would require checking order history
    const isVerifiedPurchase = false; // Implement based on order history

    const review = new Review({
      product: productId,
      user: userId,
      title,
      content,
      rating,
      images,
      isVerifiedPurchase
    });

    await review.save();
    await review.populate('user', 'firstName lastName email');

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: addIdField(review)
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
});

// PUT /api/reviews/:id - Update a review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, rating, images } = req.body;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to edit it'
      });
    }

    // Update review fields
    if (title) review.title = title;
    if (content) review.content = content;
    if (rating) review.rating = rating;
    if (images) review.images = images;

    review.status = 'pending'; // Reset to pending for moderation

    await review.save();
    await review.populate('user', 'firstName lastName email');

    // Update product rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: addIdField(review)
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // Update product rating
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// POST /api/reviews/:id/helpful - Mark review as helpful
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markAsHelpful(userId);

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulVotes: review.helpfulVotes
      }
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
});

// POST /api/reviews/:id/report - Report a review
router.post('/:id/report', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.report();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review'
    });
  }
});

// GET /api/reviews/admin - Get all reviews for admin (with pagination and filters)
router.get('/admin', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      productId = null,
      rating = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    const filter = {};
    if (status !== 'all') filter.status = status;
    if (productId) filter.product = productId;
    if (rating) filter.rating = parseInt(rating);

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name sku')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reviews: addIdField(reviews),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// PUT /api/reviews/:id/status - Update review status (admin only)
router.put('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, moderationNotes } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();
    if (moderationNotes) review.moderationNotes = moderationNotes;

    await review.save();

    // Update product rating if approved
    if (status === 'approved') {
      await updateProductRating(review.product);
    }

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: {
        review: addIdField(review)
      }
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status'
    });
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const ratingData = await Review.getAverageRating(productId);
    const product = await Product.findById(productId);
    
    if (product && ratingData.length > 0) {
      product.rating = Math.round(ratingData[0].averageRating * 10) / 10;
      product.reviewCount = ratingData[0].totalReviews;
      await product.save();
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

module.exports = router;




