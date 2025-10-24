import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts } from '../store/slices/productSlice';
import { useCart } from '../contexts/CartContext';
import { productHelpers, productAPI, Product } from '../services/api/productAPI';
import { addItemToWishlist, removeItemFromWishlist, fetchWishlist } from '../store/slices/wishlistSlice';
import { toast } from 'react-hot-toast';
import {
  ShoppingCartIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import ProductReviews from '../components/reviews/ProductReviews';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import LiquidGlassButton from '../components/LiquidGlassButton';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  // State management
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only fetch products if not already loaded
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  // Fetch individual product with retry mechanism
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    setProductLoading(true);
    setProductError(null);
    
    try {
      const response = await productAPI.getProduct(id);
      if (response.success) {
        setProduct(response.data.product);
        setRetryCount(0); // Reset retry count on success
      } else {
        setProductError('Product not found');
      }
    } catch (error: any) {

      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchProduct(), 1000 * retryCount); // Exponential backoff
      } else {
        setProductError(error.response?.data?.message || 'Failed to load product');
      }
    } finally {
      setProductLoading(false);
    }
  }, [id, retryCount]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Helper function to check if product is in wishlist (same as other pages)
  const isInWishlist = useCallback(() => {
    if (!product || !wishlist?.items) return false;
    const productId = product._id || product.id || '';
    return wishlist.items.some(item => 
      item.product && (item.product._id === productId || item.product.id === productId)
    );
  }, [product, wishlist]);

  // Utility functions
  const handleShare = async () => {
    setShareLoading(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share product');
    } finally {
      setShareLoading(false);
    }
  };

  const handleImageZoom = () => {
    setImageZoom(!imageZoom);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Add to recently viewed when product loads
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="ml-4 flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Skeleton */}
            <div className="space-y-6">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-2xl animate-pulse h-96 lg:h-[500px]"></div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-xl animate-pulse h-24"></div>
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              
              <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <XCircleIcon className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {productError || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <div className="space-y-4">
            <LiquidGlassButton
              onClick={() => navigate('/products')}
              variant="primary"
              size="lg"
              fullWidth
            >
              Browse Products
            </LiquidGlassButton>
            <LiquidGlassButton
              onClick={() => navigate(-1)}
              variant="dark"
              size="lg"
              fullWidth
            >
              Go Back
            </LiquidGlassButton>
            {retryCount > 0 && (
              <LiquidGlassButton
                onClick={fetchProduct}
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowPathIcon className="w-5 h-5" />}
                iconPosition="left"
              >
                Retry
              </LiquidGlassButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          returnUrl: window.location.pathname,
          returnState: { productId: product?._id, action: 'add' }
        } 
      });
      return;
    }
    
    if (!product) {
      toast.error('Product not available');
      return;
    }

    // Add multiple quantities if quantity > 1
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          returnUrl: window.location.pathname,
          returnState: { productId: product?._id, action: 'buy' }
        } 
      });
      return;
    }
    
    if (!product) {
      toast.error('Product not available');
      return;
    }
    
    // Add item to cart first
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    
    // Navigate to delivery info (same as cart checkout flow)
    navigate('/delivery-info', { 
      state: { 
        items: [{ product, quantity }],
        total: product.price * quantity,
        fromBuyNow: true // Flag to indicate this came from Buy Now
      } 
    });
  };

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return; // Prevent multiple clicks
    
    console.log('🔍 ProductDetail wishlist toggle clicked - Auth:', isAuthenticated);
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to your wishlist');
      navigate('/login', { 
        state: { 
          from: `/products/${id}`,
          message: 'Please login to add items to your wishlist'
        }
      });
      return;
    }

    if (!product?._id) {
      toast.error('Product not found');
      return;
    }

    const productId = product._id || product.id || '';
    const currentlyInWishlist = isInWishlist();
    
    console.log('🔍 Product ID:', productId, 'Is in wishlist:', currentlyInWishlist);

    setWishlistLoading(true);
    
    try {
      if (currentlyInWishlist) {
        console.log('🔵 Removing from wishlist...');
        await dispatch(removeItemFromWishlist(productId)).unwrap();
        // Force refresh wishlist to ensure UI updates
        await dispatch(fetchWishlist());
        toast.success('❤️ Removed from wishlist!');
      } else {
        console.log('🔵 Adding to wishlist...');
        await dispatch(addItemToWishlist({ productId })).unwrap();
        // Force refresh wishlist to ensure UI updates
        await dispatch(fetchWishlist());
        toast.success('💚 Added to wishlist successfully!');
      }
    } catch (error: any) {
      console.error('❌ Wishlist toggle error:', error);
      if (error.message?.includes('401') || error.message?.includes('unauthorized') || error.includes?.('401') || error.includes?.('unauthorized')) {
        toast.error('Session expired. Please login again.');
        navigate('/login', { 
          state: { 
            from: `/products/${id}`,
            message: 'Your session has expired. Please login again.'
          }
        });
      } else {
        toast.error(error.message || error || 'Failed to update wishlist');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const productId = product.id || product._id || '';
  const isProductInCart = isInCart(productId);
  const cartQuantity = getItemQuantity(productId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h1>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                disabled={shareLoading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {shareLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <ShareIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="relative group overflow-hidden rounded-2xl shadow-xl bg-white">
              <div className="relative">
                <img
                  src={productHelpers.getPrimaryImage(product)}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Image overlay with zoom button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={handleImageZoom}
                    className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                  >
                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-700" />
                  </button>
                </div>

                {/* Sale badge */}
                {product.isOnSale && (
                  <div className="absolute top-6 left-6">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      {productHelpers.getDiscountPercentage(product)}% OFF
                    </span>
                  </div>
                )}

                {/* Stock status badge */}
                <div className="absolute top-6 right-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${
                    product.isInStock 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {product.isInStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Image Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {(product.images || []).slice(0, 4).map((image: any, index: number) => (
                <div
                  key={index}
                  className={`aspect-w-1 aspect-h-1 cursor-pointer rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                    selectedImage === index 
                      ? 'ring-4 ring-blue-500 shadow-lg scale-105 border-blue-500' 
                      : 'hover:shadow-md hover:scale-105 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Image zoom modal */}
            {imageZoom && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                onClick={() => setImageZoom(false)}
              >
                <div className="relative max-w-4xl max-h-full">
                  <img
                    src={productHelpers.getPrimaryImage(product)}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={() => setImageZoom(false)}
                    className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg"
                  >
                    <XCircleIcon className="h-6 w-6 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and SKU */}
            <div>
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>SKU: <span className="font-semibold text-gray-700">{product.sku}</span></span>
                <span>•</span>
                <span>Warranty: <span className="font-semibold text-gray-700">{product.warranty}</span></span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {productHelpers.formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-2xl text-gray-400 line-through">
                    {productHelpers.formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.isOnSale && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {productHelpers.getDiscountPercentage(product)}% OFF
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-green-600 font-semibold">
                  You save {productHelpers.formatPrice(product.originalPrice - product.price)}!
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border">
              {product.isInStock ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-600" />
              )}
              <div>
                <span className={`text-lg font-semibold ${product.isInStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.isInStock ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.isInStock && (
                  <p className="text-sm text-gray-600">{product.stock} units available</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h3>
                <ul className="space-y-2">
                  {(product.features || []).map((feature: any, index: number) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-16 text-center border border-gray-300 rounded-lg py-2 font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={product && quantity >= product.stock}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              {product && quantity >= product.stock && (
                <p className="text-sm text-red-600 mt-1">Maximum quantity available</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <LiquidGlassButton
                    onClick={handleAddToCart}
                    disabled={!product.isInStock}
                    variant={
                      !isAuthenticated 
                        ? 'primary' 
                        : isProductInCart
                        ? 'success'
                        : 'dark'
                    }
                    size="lg"
                    fullWidth
                    icon={<ShoppingCartIcon className="h-5 w-5" />}
                    iconPosition="left"
                    showIndicator={isProductInCart}
                  >
                    {!isAuthenticated
                      ? 'Login to Add'
                      : isProductInCart
                      ? `In Cart (${cartQuantity})`
                      : 'Add to Cart'}
                  </LiquidGlassButton>
                </div>
                <div className="flex-1">
                  <LiquidGlassButton
                    onClick={handleBuyNow}
                    disabled={!product.isInStock}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    Buy Now
                  </LiquidGlassButton>
                </div>
              </div>

              {/* Wishlist Button */}
              <LiquidGlassButton
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                variant={isInWishlist() ? 'danger' : 'secondary'}
                size="lg"
                fullWidth
                icon={
                  isInWishlist() ? (
                    <HeartSolidIcon className="h-5 w-5" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )
                }
                iconPosition="left"
              >
                {wishlistLoading 
                  ? 'Updating...' 
                  : isInWishlist() 
                    ? 'Remove from Wishlist'
                    : 'Add to Wishlist'
                }
              </LiquidGlassButton>

            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl p-6 border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Category</span>
                    <span className="text-gray-900 font-semibold capitalize">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">SKU</span>
                    <span className="text-gray-900 font-semibold">{product.sku}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Stock</span>
                    <span className="text-gray-900 font-semibold">{product.stock} units</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Warranty</span>
                    <span className="text-gray-900 font-semibold">{product.warranty}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Weight</span>
                    <span className="text-gray-900 font-semibold">{product.weight ? `${product.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Shipping Class</span>
                    <span className="text-gray-900 font-semibold capitalize">{product.shippingClass || 'Standard'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-gray-900 font-semibold text-right max-w-48">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions */}
            {product.dimensions && (
              <div className="bg-white rounded-2xl p-6 border">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Dimensions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{product.dimensions.length} cm</div>
                    <div className="text-sm text-gray-600">Length</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{product.dimensions.width} cm</div>
                    <div className="text-sm text-gray-600">Width</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{product.dimensions.height} cm</div>
                    <div className="text-sm text-gray-600">Height</div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping & Returns</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-white rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Free Shipping</span>
                    <p className="text-sm text-gray-600">On orders over LKR 7,500</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-white rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Fast Delivery</span>
                    <p className="text-sm text-gray-600">3-5 business days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-white rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Easy Returns</span>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="mt-20">
          <ProductReviews productId={product._id || ''} productName={product.name} />
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
            <p className="text-lg text-gray-600">Discover more products in the same category</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(products || [])
              .filter(p => p.category === product.category && p._id !== product._id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/products/${relatedProduct._id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={productHelpers.getPrimaryImage(relatedProduct)}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {relatedProduct.isOnSale && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {productHelpers.getDiscountPercentage(relatedProduct)}% OFF
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg">
                        <EyeIcon className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        {relatedProduct.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                          {productHelpers.formatPrice(relatedProduct.price)}
                        </span>
                        {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                          <span className="text-sm text-gray-400 line-through">
                            {productHelpers.formatPrice(relatedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-blue-700">
                        <StarSolidIcon className="h-4 w-4" />
                        <span className="ml-1 text-sm font-medium text-gray-600">
                          {relatedProduct.rating ? relatedProduct.rating.toFixed(1) : '4.8'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className={relatedProduct.isInStock ? 'text-green-600' : 'text-red-600'}>
                        {relatedProduct.isInStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span>{relatedProduct.stock} units</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          {(products || []).filter(p => p.category === product.category && p._id !== product._id).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No related products found</p>
              <Link
                to="/products"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
