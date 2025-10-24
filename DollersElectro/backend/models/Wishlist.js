const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Method to add item to wishlist (atomic operation)
wishlistSchema.methods.addItem = async function(productId, notes = '') {
  try {
    // Check if item already exists
    if (this.hasItem(productId)) {
      return { success: false, message: 'Item already in wishlist' };
    }
    
    // Add item to the current instance
    this.items.push({
      product: productId,
      notes: notes,
      addedAt: new Date()
    });
    
    // Save the wishlist
    await this.save();
    
    return { success: true, message: 'Item added to wishlist' };
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    return { success: false, message: 'Failed to add item to wishlist' };
  }
};

// Method to remove item from wishlist (atomic operation)
wishlistSchema.methods.removeItem = async function(productId) {
  try {
    // Check if item exists
    if (!this.hasItem(productId)) {
      return { success: false, message: 'Item not found in wishlist' };
    }
    
    // Remove item from the current instance
    this.items = this.items.filter(item => {
      if (!item.product) return false;
      // Handle both populated and unpopulated product references
      const itemProductId = item.product._id ? item.product._id.toString() : item.product.toString();
      return itemProductId !== productId.toString();
    });
    
    // Save the wishlist
    await this.save();
    
    return { success: true, message: 'Item removed from wishlist' };
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    return { success: false, message: 'Failed to remove item from wishlist' };
  }
};

// Method to check if item is in wishlist
wishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(item => {
    if (!item.product) return false;
    // Handle both populated and unpopulated product references
    const itemProductId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemProductId === productId.toString();
  });
};

// Static method to get or create wishlist for user
wishlistSchema.statics.getOrCreateWishlist = async function(userId) {
  let wishlist = await this.findOne({ user: userId }).populate('items.product');
  
  if (!wishlist) {
    wishlist = new this({ user: userId, items: [] });
    await wishlist.save();
  }
  
  return wishlist;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
