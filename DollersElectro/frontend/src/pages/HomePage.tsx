import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts } from '../store/slices/productSlice';
import { addItemToWishlist, removeItemFromWishlist, fetchWishlist } from '../store/slices/wishlistSlice';
import { useCart } from '../contexts/CartContext';
import { Product } from '../services/api/productAPI';
import { productHelpers } from '../services/api/productAPI';
import { toast } from 'react-hot-toast';
import AIChatbox from '../components/chat/AIChatbox';
import RecentlyViewedProducts from '../components/products/RecentlyViewedProducts';
import SEOHead from '../components/SEOHead';
import MagicBento from '../components/MagicBento';
import LiquidEther from '../components/LiquidEther';
import NewProductsBadge from '../components/NewProductsBadge';
import LiquidGlassButton from '../components/LiquidGlassButton';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, loading } = useAppSelector((state) => state.products);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const { addItem, isInCart, getItemQuantity } = useCart();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState<{[key: string]: boolean}>({});

  // Redirect admin/employee users to their respective dashboards
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        window.location.href = '/admin';
        return;
      }
      if (user.role === 'employee') {
        window.location.href = '/employee';
        return;
      }
    }
  }, [isAuthenticated, user]);

  // Get featured products from the products array
  const featuredProducts = products && Array.isArray(products) 
    ? products.filter(product => product.isFeatured).slice(0, 16) 
    : [];

  useEffect(() => {
    // First fetch all products, then filter for featured ones
    dispatch(fetchProducts());
  }, [dispatch]);

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    // Only allow customers to add to cart
    if (user && user.role !== 'customer') {
      if (user.role === 'admin') {
        window.location.href = '/admin';
        return;
      }
      if (user.role === 'employee') {
        window.location.href = '/employee';
        return;
      }
    }
    
    addItem(product);
  };

  const handleSearch = () => {
    // Only allow customers to search products
    if (isAuthenticated && user && user.role !== 'customer') {
      if (user.role === 'admin') {
        window.location.href = '/admin';
        return;
      }
      if (user.role === 'employee') {
        window.location.href = '/employee';
        return;
      }
    }
    
    // Navigate to products page with search
    window.location.href = '/products';
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Helper function to check if product is in wishlist
  const isInWishlist = (productId: string) => {
    if (!wishlist?.items) return false;
    return wishlist.items.some(item => 
      item.product && (item.product._id === productId || item.product.id === productId)
    );
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error('Please login to add items to your wishlist');
      navigate('/login');
      return;
    }

    const productId = product._id || product.id || '';
    if (!productId) {
      toast.error('Invalid product');
      return;
    }

    setWishlistLoading(prev => ({ ...prev, [productId]: true }));

    try {
      if (isInWishlist(productId)) {
        await dispatch(removeItemFromWishlist(productId)).unwrap();
        // Force refresh wishlist to ensure UI updates
        await dispatch(fetchWishlist());
        toast.success('❤️ Removed from wishlist!');
      } else {
        await dispatch(addItemToWishlist({ productId })).unwrap();
        // Force refresh wishlist to ensure UI updates
        await dispatch(fetchWishlist());
        toast.success('💚 Added to wishlist successfully!');
      }
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to update wishlist');
      }
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DollersElectro",
    "description": "Premium electrical products and solutions for professionals and enthusiasts",
    "url": "https://dollerselectro.com",
    "logo": "https://dollerselectro.com/logo512.png",
    "sameAs": [
      "https://facebook.com/dollerselectro",
      "https://twitter.com/dollerselectro",
      "https://linkedin.com/company/dollerselectro"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="DollersElectro - Premium Electrical Solutions"
        description="Discover premium electrical products and solutions at DollersElectro. Quality electrical components, tools, and equipment for professionals and enthusiasts."
        keywords="electrical products, electrical tools, electrical components, electrical equipment, electrical solutions, DollersElectro"
        structuredData={structuredData}
      />
      {/* Hero Section - Apple iOS Style with Liquid Ether Background */}
      <section className="relative overflow-hidden">
        {/* Liquid Ether Background - Shiny Silver (receives mouse events) */}
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={['#E8E8E8', '#F5F5F5', '#FFFFFF']}
            mouseForce={35}
            cursorSize={180}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.5}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>
        
        {/* Silver Shine Overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.3) 0%, transparent 40%), linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 255, 255, 0.15) 100%)',
          mixBlendMode: 'overlay'
        }}></div>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-[2] pointer-events-none"></div>

        <div className="relative container-custom py-20 lg:py-32 z-20 pointer-events-none">
          <div className="text-center">
            {/* Small Badge - Apple Style with Liquid Glass Effect */}
            <div className="mb-6 pointer-events-auto">
              <NewProductsBadge variant="hero" />
            </div>

            {/* Main Heading - San Francisco Style */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] mb-6 tracking-tight pointer-events-none">
              Power Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Electrical Dreams
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light pointer-events-none">
              Premium electrical supplies and smart home solutions.
              <br className="hidden sm:block" />
              Experience innovation at your fingertips.
            </p>

            {/* CTA Buttons - iOS Style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-none">
              <button
                onClick={handleSearch}
                className="group relative overflow-hidden px-10 py-4 bg-white text-black rounded-full font-semibold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center pointer-events-auto"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Search Products
              </button>

              <button
                onClick={() => {
                  if (isAuthenticated && user && user.role !== 'customer') {
                    if (user.role === 'admin') {
                      window.location.href = '/admin';
                      return;
                    }
                    if (user.role === 'employee') {
                      window.location.href = '/employee';
                      return;
                    }
                  }
                  window.location.href = '/products';
                }}
                className="group relative text-white px-10 py-4 rounded-full font-semibold text-lg bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center pointer-events-auto"
              >
                Browse All
                <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* Magic Bento Grid Section - Apple iOS Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Why Choose <span className="bg-gradient-to-r from-gray-600 to-gray-900 bg-clip-text text-transparent">DollersElectro</span>
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Experience excellence in every aspect of our service
            </p>
          </div>
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={false}
            clickEffect={true}
            spotlightRadius={200}
            particleCount={6}
            glowColor="192, 192, 192"
          />
        </div>
      </section>

      {/* Weekly Deals Section - Apple iOS Style */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              This Week's Deals
            </h2>
            <p className="text-lg text-gray-600 font-light">Handpicked for you</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Cards Column */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 4).map((product) => {
                  const discountPercentage = product.originalPrice && product.originalPrice > product.price
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;
                  
                  return (
                    <div 
                      key={product._id} 
                      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 border border-gray-100"
                      style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.1), 0 0 60px rgba(192, 192, 192, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 1)';
                      }}
                    >
                      <div className="relative overflow-hidden">
                        {discountPercentage > 0 && (
                          <div className="absolute top-3 left-3 z-10">
                            <div className="backdrop-blur-xl bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                              -{discountPercentage}%
                            </div>
                          </div>
                        )}
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={productHelpers.getPrimaryImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700"
                            onClick={() => window.location.href = `/products/${product._id}`}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">DollersElectro</div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[40px]">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-gray-500 ml-1 font-medium">4.8</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl font-bold text-gray-900">
                            {productHelpers.formatPrice(product.price)}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-sm text-gray-400 line-through font-medium">
                              {productHelpers.formatPrice(product.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Banner Column - Apple iOS Style */}
            <div className="lg:col-span-1">
              <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
                
                {/* Mesh Gradient Overlay */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl"></div>
                </div>

                <div className="relative h-full flex flex-col items-center justify-center text-center px-8 z-10">
                  <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-8 border border-white/20">
                    <h2 className="text-5xl font-black text-white mb-3 tracking-tight">
                      Weekly
                    </h2>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      Transform Your
                      <br />Space With Light
                    </h3>
                    <p className="text-lg text-white/80 tracking-wide mb-6 font-light">
                      Your Vibe, Your Style
                    </p>
                    <button 
                      onClick={() => window.location.href = '/products'}
                      className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-semibold text-base hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Most In-Demand Categories Section - Apple iOS Style */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600 font-light">Explore what's trending</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { name: 'Lamp Shade', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop', color: 'from-slate-500 to-slate-600' },
              { name: 'Table Lamp', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop', color: 'from-amber-500 to-orange-600' },
              { name: 'Wall Lights', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=400&fit=crop', color: 'from-gray-500 to-gray-600' },
              { name: 'Pipe Light', image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop', color: 'from-amber-700 to-amber-800' },
              { name: 'LED Module', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', color: 'from-gray-800 to-gray-900' }
            ].map((category, idx) => (
              <div key={idx} className="flex flex-col items-center group cursor-pointer" onClick={() => window.location.href = '/products'}>
                <div className="relative w-44 h-44 rounded-full overflow-hidden mb-4 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105">
                  {/* Gradient Ring */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                  
                  {/* Image */}
                  <div className="absolute inset-2 rounded-full overflow-hidden bg-white">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Apple iOS Style */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Handpicked selection of premium electrical solutions
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
              <p className="text-xl text-gray-600">Loading featured products...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className="group bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 border border-gray-100"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.1), 0 0 60px rgba(192, 192, 192, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 1)';
                    }}
                  >
                    {/* Clickable image and text area */}
                    <Link to={`/products/${product._id}`} className="block">
                      <div className="relative overflow-hidden aspect-square">
                        <img
                          src={productHelpers.getPrimaryImage(product)}
                          alt={`${product.name} - ${product.description || 'Premium electrical product'}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                          decoding="async"
                        />
                        {product.isOnSale && (
                          <div className="absolute top-3 left-3">
                            <div className="backdrop-blur-xl bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                              {productHelpers.getDiscountPercentage(product)}% OFF
                            </div>
                          </div>
                        )}
                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleWishlistToggle(product, e)}
                          disabled={wishlistLoading[product._id || product.id || '']}
                          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-xl transition-all duration-300 z-10 ${
                            isInWishlist(product._id || product.id || '')
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                          }`}
                          title={isInWishlist(product._id || product.id || '') ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          {wishlistLoading[product._id || product.id || ''] ? (
                            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                          ) : isInWishlist(product._id || product.id || '') ? (
                            <HeartSolidIcon className="h-5 w-5" />
                          ) : (
                            <HeartIcon className="h-5 w-5" />
                          )}
                        </button>
                        
                        {!product.isInStock && (
                          <div className="absolute top-16 right-3">
                            <div className="backdrop-blur-xl bg-gray-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                              Out of Stock
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickView(product);
                            }}
                            className="w-full backdrop-blur-xl bg-white/90 text-gray-900 py-2.5 px-4 rounded-full font-semibold hover:bg-white transition-colors"
                            aria-label={`View details for ${product.name}`}
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-5 pb-3">
                        <div className="mb-2">
                          <span className="inline-block bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[56px]">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed font-light">
                          {product.description}
                        </p>
                        
                        <div className="flex items-baseline justify-between mb-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {productHelpers.formatPrice(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-400 line-through font-medium">
                                {productHelpers.formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm font-medium text-gray-600">4.8</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Interactive button outside the link */}
                    <div className="px-5 pb-5">
                      <LiquidGlassButton
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.isInStock}
                        variant={
                          !isAuthenticated 
                            ? 'primary' 
                            : isInCart(product.id || product._id || '')
                            ? 'success'
                            : 'dark'
                        }
                        size="md"
                        fullWidth
                        icon={<ShoppingCartIcon className="h-4 w-4" />}
                        iconPosition="left"
                        showIndicator={isInCart(product.id || product._id || '')}
                      >
                        {!isAuthenticated
                          ? 'Login to Add'
                          : isInCart(product.id || product._id || '')
                          ? `In Cart (${getItemQuantity(product.id || product._id || '')})`
                          : 'Add to Cart'}
                      </LiquidGlassButton>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/products">
                  <LiquidGlassButton
                    variant="dark"
                    size="lg"
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    }
                    iconPosition="right"
                  >
                    View All Products
                  </LiquidGlassButton>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Recently Viewed Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <RecentlyViewedProducts />
        </div>
      </section>

      {/* AI Chatbox */}
      {isAuthenticated && user?.role === 'customer' && (
        <AIChatbox
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
        />
      )}

      {/* Quick View Modal */}
      {isQuickViewOpen && quickViewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row">
              {/* Product Image */}
              <div className="lg:w-1/2 p-8">
                <div className="relative">
                  <img
                    src={productHelpers.getPrimaryImage(quickViewProduct)}
                    alt={quickViewProduct.name}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                  {quickViewProduct.isOnSale && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {productHelpers.getDiscountPercentage(quickViewProduct)}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="lg:w-1/2 p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide mb-3">
                      {quickViewProduct.category}
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {quickViewProduct.name}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseQuickView}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {productHelpers.formatPrice(quickViewProduct.price)}
                    </span>
                    {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                      <span className="text-xl text-gray-400 line-through">
                        {productHelpers.formatPrice(quickViewProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-blue-700">
                    <StarIcon className="h-5 w-5 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-600">4.8</span>
                  </div>
                </div>

                {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800 font-semibold">
                      You save {productHelpers.formatPrice(quickViewProduct.originalPrice - quickViewProduct.price)}!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <LiquidGlassButton
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      handleCloseQuickView();
                    }}
                    disabled={!quickViewProduct.isInStock}
                    variant={
                      !isAuthenticated 
                        ? 'primary' 
                        : isInCart(quickViewProduct.id || quickViewProduct._id || '')
                        ? 'success'
                        : 'primary'
                    }
                    size="lg"
                    fullWidth
                    icon={<ShoppingCartIcon className="h-5 w-5" />}
                    iconPosition="left"
                    showIndicator={isInCart(quickViewProduct.id || quickViewProduct._id || '')}
                  >
                    {!isAuthenticated
                      ? 'Login to Add to Cart'
                      : isInCart(quickViewProduct.id || quickViewProduct._id || '')
                      ? `In Cart (${getItemQuantity(quickViewProduct.id || quickViewProduct._id || '')})`
                      : 'Add to Cart'}
                  </LiquidGlassButton>

                  <Link to={`/products/${quickViewProduct._id}`} onClick={handleCloseQuickView}>
                    <LiquidGlassButton
                      variant="light"
                      size="lg"
                      fullWidth
                    >
                      View Full Details
                    </LiquidGlassButton>
                  </Link>
                </div>

                {!quickViewProduct.isInStock && (
                  <div className="mt-4 text-center">
                    <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;