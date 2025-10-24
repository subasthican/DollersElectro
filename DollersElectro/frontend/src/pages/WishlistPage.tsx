import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  HeartIcon, 
  TrashIcon, 
  ShoppingCartIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { 
  fetchWishlist, 
  removeItemFromWishlist, 
  clearUserWishlist 
} from '../store/slices/wishlistSlice';
import { useCart } from '../contexts/CartContext';
import LiquidGlassButton from '../components/LiquidGlassButton';

const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist, loading, error } = useAppSelector((state) => state.wishlist);
  const { addItem } = useCart();

  // Load wishlist on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Clean up orphaned wishlist items if count doesn't match items
  useEffect(() => {
    if (wishlist && wishlist.itemCount > 0 && (!wishlist.items || wishlist.items.length === 0)) {
      // If we have a count but no items, there might be orphaned items

      // The backend will now filter out orphaned items automatically
      dispatch(fetchWishlist());
    }
  }, [wishlist, dispatch]);

  // Helper function to convert wishlist product to full Product
  const convertToProduct = (wishlistProduct: any) => {
    return {
      _id: wishlistProduct._id,
      id: wishlistProduct.id,
      name: wishlistProduct.name,
      description: wishlistProduct.description || '',
      sku: wishlistProduct.sku || '',
      price: wishlistProduct.price,
      originalPrice: wishlistProduct.originalPrice,
      stock: wishlistProduct.stock || 0,
      lowStockThreshold: wishlistProduct.lowStockThreshold || 10,
      category: wishlistProduct.category,
      tags: wishlistProduct.tags || [],
      images: wishlistProduct.images || [],
      features: wishlistProduct.features || [],
      specifications: wishlistProduct.specifications || {},
      shippingClass: wishlistProduct.shippingClass || 'standard',
      warranty: wishlistProduct.warranty || '1 Year',
      isActive: wishlistProduct.isActive,
      isFeatured: wishlistProduct.isFeatured || false,
      isOnSale: wishlistProduct.isOnSale || false,
      isInStock: wishlistProduct.isInStock,
      viewCount: wishlistProduct.viewCount || 0,
      purchaseCount: wishlistProduct.purchaseCount || 0,
      createdAt: wishlistProduct.createdAt || new Date().toISOString(),
      updatedAt: wishlistProduct.updatedAt || new Date().toISOString()
    };
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await dispatch(removeItemFromWishlist(productId)).unwrap();
      toast.success('Item removed from wishlist');
    } catch (error: any) {

      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.message || 'Failed to remove item from wishlist');
      }
    }
  };

  const handleMoveToCart = async (item: any) => {
    try {
      // First add to cart
      const fullProduct = convertToProduct(item.product);
      addItem(fullProduct);
      
      // Then remove from wishlist
      await dispatch(removeItemFromWishlist(item.product?.id || item.product?._id || '')).unwrap();
      
      toast.success(`${item.product?.name || 'Product'} moved to cart`);
    } catch (error: any) {

      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.message || 'Failed to move item to cart');
      }
    }
  };

  const handleAddAllToCart = async () => {
    if (!wishlist?.items) return;
    
    try {
      for (const item of wishlist.items) {
        const fullProduct = convertToProduct(item.product);
        addItem(fullProduct);
      }
      
      await dispatch(clearUserWishlist()).unwrap();
      toast.success('All items added to cart');
    } catch (error: any) {

      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.message || 'Failed to add all items to cart');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <HeartIcon className="mx-auto h-16 w-16 text-gray-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h2>
          <p className="text-gray-500 mb-8">
            Create an account or sign in to save your favorite products and access them anytime.
          </p>
          <div className="space-y-4">
            <Link to="/login" className="block">
              <LiquidGlassButton variant="primary" size="lg" fullWidth>
                Sign In
              </LiquidGlassButton>
            </Link>
            <Link to="/register" className="block">
              <LiquidGlassButton variant="secondary" size="lg" fullWidth>
                Create Account
              </LiquidGlassButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            My <span className="text-blue-400">Wishlist</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Save your favorite products and keep track of items you love
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-20">
        {!loading && !error && (!wishlist?.items || wishlist.items.length === 0) ? (
          <div className="text-center py-20">
            <HeartIcon className="mx-auto h-24 w-24 text-gray-500 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start exploring our products and add items you love to your wishlist for easy access later.
            </p>
            <Link to="/products">
              <LiquidGlassButton 
                variant="primary" 
                size="lg"
                icon={<ShoppingCartIcon className="h-5 w-5" />}
                iconPosition="left"
              >
                Browse Products
              </LiquidGlassButton>
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist Stats */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {wishlist?.itemCount || 0} {(wishlist?.itemCount || 0) === 1 ? 'item' : 'items'} in your wishlist
                </h2>
                {wishlist?.items && wishlist.items.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Total value: LKR {wishlist.items.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
                    </span>
                    <LiquidGlassButton 
                      onClick={handleAddAllToCart}
                      disabled={loading}
                      variant="success"
                      size="md"
                      icon={<ShoppingCartIcon className="h-4 w-4" />}
                      iconPosition="left"
                    >
                      {loading ? 'Adding...' : 'Add All to Cart'}
                    </LiquidGlassButton>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Loading wishlist...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <LiquidGlassButton 
                  onClick={() => dispatch(fetchWishlist())}
                  variant="primary"
                  size="md"
                >
                  Try Again
                </LiquidGlassButton>
              </div>
            )}

            {/* Empty Wishlist */}
            {!loading && !error && (!wishlist?.items || wishlist.items.length === 0) && (
              <div className="text-center py-12">
                <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">
                  Start adding products you love to your wishlist
                </p>
                <Link to="/products">
                  <LiquidGlassButton 
                    variant="primary" 
                    size="lg"
                    icon={<ShoppingCartIcon className="h-5 w-5" />}
                    iconPosition="left"
                  >
                    Browse Products
                  </LiquidGlassButton>
                </Link>
              </div>
            )}

            {/* Wishlist Grid */}
            {!loading && !error && wishlist?.items && wishlist.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.items.filter(item => item.product).map((item) => (
                  <div key={item.id} className="card hover:shadow-glow transition-all duration-300 group">
                    {/* Product Image */}
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={item.product?.images?.[0]?.url || item.product?.image || '/placeholder-product.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button
                          onClick={() => handleRemoveFromWishlist(item.product?.id || item.product?._id || '')}
                          className="p-2 bg-gray-50/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                          title="Remove from wishlist"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {!item.product?.isInStock && (
                        <div className="absolute top-4 left-4">
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="card-content">
                      <div className="mb-4">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {item.product?.category || 'Uncategorized'}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">
                          {item.product?.name || 'Product'}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(item.product?.rating || 0)
                                    ? 'text-blue-600 fill-current'
                                    : 'text-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({item.product?.reviewCount?.toLocaleString() || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl font-bold text-gray-900">
                            LKR {(item.product?.price || 0).toFixed(2)}
                          </span>
                          {item.product?.originalPrice && item.product.originalPrice > (item.product?.price || 0) && (
                            <>
                              <span className="text-lg text-gray-500 line-through">
                                LKR {item.product.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {Math.round(((item.product.originalPrice - (item.product?.price || 0)) / item.product.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <LiquidGlassButton
                            onClick={() => handleMoveToCart(item)}
                            disabled={!item.product?.isInStock || loading}
                            variant="primary"
                            size="md"
                            fullWidth
                            icon={<ShoppingCartIcon className="w-4 h-4" />}
                            iconPosition="left"
                          >
                            Move to Cart
                          </LiquidGlassButton>
                        </div>
                        <Link
                          to={`/products/${item.product?.id || item.product?._id || ''}`}
                          title="View product details"
                        >
                          <LiquidGlassButton
                            variant="secondary"
                            size="md"
                            icon={<EyeIcon className="w-4 h-4" />}
                          >
                          </LiquidGlassButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
