const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  ancestors: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    name: String,
    slug: String
  }],
  level: {
    type: Number,
    default: 0
  },
  image: {
    url: String,
    alt: String,
    cloudinaryId: String
  },
  icon: {
    type: String,
    default: '⚡' // Default electrical icon
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  metadata: {
    productCount: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  if (this.ancestors && this.ancestors.length > 0) {
    return this.ancestors.map(ancestor => ancestor.name).join(' > ') + ' > ' + this.name;
  }
  return this.name;
});

// Virtual for children count
categorySchema.virtual('childrenCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  count: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ 'ancestors._id': 1 });

// Pre-save middleware to update ancestors and level
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      const parent = await this.constructor.findById(this.parent);
      if (parent) {
        this.level = parent.level + 1;
        this.ancestors = [
          ...parent.ancestors,
          {
            _id: parent._id,
            name: parent.name,
            slug: parent.slug
          }
        ];
      }
    } else {
      this.level = 0;
      this.ancestors = [];
    }
  }
  next();
});

// Static method to get root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { sortOrder: 1, name: 1 } },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'children',
        depthField: 'depth'
      }
    },
    { $match: { parent: null } }
  ]);
};

// Static method to get breadcrumbs
categorySchema.statics.getBreadcrumbs = function(categoryId) {
  return this.findById(categoryId)
    .populate('ancestors')
    .then(category => {
      if (!category) return [];
      
      const breadcrumbs = [
        ...category.ancestors.map(ancestor => ({
          id: ancestor._id,
          name: ancestor.name,
          slug: ancestor.slug
        })),
        {
          id: category._id,
          name: category.name,
          slug: category.slug
        }
      ];
      
      return breadcrumbs;
    });
};

// Instance method to get children
categorySchema.methods.getChildren = function() {
  return this.constructor.find({ parent: this._id, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
};

// Instance method to get all descendants
categorySchema.methods.getAllDescendants = function() {
  return this.constructor.find({
    'ancestors._id': this._id,
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });
};

// Instance method to check if has children
categorySchema.methods.hasChildren = async function() {
  const count = await this.constructor.countDocuments({ parent: this._id, isActive: true });
  return count > 0;
};

module.exports = mongoose.model('Category', categorySchema);








