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

// Method to add item to wishlist
wishlistSchema.methods.addItem = function(productId, notes = '') {
  // Check if item already exists
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    return { success: false, message: 'Item already in wishlist' };
  }
  
  this.items.push({
    product: productId,
    notes: notes
  });
  
  return { success: true, message: 'Item added to wishlist' };
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(productId) {
  const initialLength = this.items.length;
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  if (this.items.length === initialLength) {
    return { success: false, message: 'Item not found in wishlist' };
  }
  
  return { success: true, message: 'Item removed from wishlist' };
};

// Method to check if item is in wishlist
wishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
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
