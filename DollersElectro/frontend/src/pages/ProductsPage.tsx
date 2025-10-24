import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts } from '../store/slices/productSlice';
import { addItemToWishlist, removeItemFromWishlist, fetchWishlist } from '../store/slices/wishlistSlice';
import { useCart } from '../contexts/CartContext';
import { productHelpers, Product } from '../services/api/productAPI';
import { MagnifyingGlassIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import AdvancedSearch from '../components/search/AdvancedSearch';
import ComparisonButton from '../components/products/ComparisonButton';
import ProductComparison from '../components/products/ProductComparison';
import LiquidGlassButton from '../components/LiquidGlassButton';

interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, loading } = useAppSelector((state) => state.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const { addItem } = useCart();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filteredProducts, setFilteredProducts] = useState(products || []);
  const [wishlistLoading, setWishlistLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products?.map(p => p.category) || []))];

  // Update filtered products when products or filters change
  useEffect(() => {
    if (!products) return;

    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return 0; // Rating not available in Product interface
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Search functionality handled by AdvancedSearch component

  const handleAdvancedSearch = (filters: SearchFilters) => {
    if (!products) return;

    let filtered = [...products];

    // Apply all filters
    if (filters.query) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.minPrice > 0 || filters.maxPrice < 10000) {
      filtered = filtered.filter(product => 
        product.price >= filters.minPrice && product.price <= filters.maxPrice
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    if (filters.isFeatured) {
      filtered = filtered.filter(product => product.isFeatured);
    }

    if (filters.isOnSale) {
      filtered = filtered.filter(product => product.isOnSale);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = 0; // Rating not available in Product interface
          bValue = 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'reviewCount':
          aValue = a.viewCount || 0; // Using viewCount instead of reviewCount
          bValue = b.viewCount || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    setSearchParams({});
    if (products) {
      setFilteredProducts(products);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    addItem(product);
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

    console.log('🔍 Wishlist toggle clicked - Auth:', isAuthenticated);

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

    console.log('🔍 Product ID:', productId, 'Is in wishlist:', isInWishlist(productId));

    setWishlistLoading(prev => ({ ...prev, [productId]: true }));

    try {
      if (isInWishlist(productId)) {
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
        navigate('/login');
      } else {
        toast.error(error.message || error || 'Failed to update wishlist');
      }
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-gray-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Matching Categories Style */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <div className="mb-6">
            <span className="inline-block px-6 py-2 backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/20 rounded-full text-blue-600 font-semibold text-sm mb-6">
              🛍️ Shop Now
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Our Products
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Discover our complete range of premium electrical products
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Advanced Search */}
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClear={handleClearSearch}
          categories={categories}
          loading={loading}
        />

        {/* Product Comparison */}
        <ProductComparison />

        {/* Results Summary - Apple iOS Style */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
            </h2>
            {searchTerm && (
              <p className="text-gray-600 mt-2 font-light">
                Results for "{searchTerm}"
              </p>
            )}
          </div>
        </div>

        {/* Products Grid - Apple iOS Style */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-gray-50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Clickable image and text area */}
                <Link to={`/products/${product._id}`} className="block cursor-pointer">
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={productHelpers.getPrimaryImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.isOnSale && (
                      <div className="absolute top-3 left-3">
                        <div className="backdrop-blur-xl bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          SALE
                        </div>
                      </div>
                    )}
                    {product.isFeatured && !product.isOnSale && (
                      <div className="absolute top-3 left-3">
                        <div className="backdrop-blur-xl bg-yellow-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          FEATURED
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
                          <span className="text-lg text-gray-500 line-through">
                            {productHelpers.formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600">
                          {product.rating || 0}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Interactive buttons outside the link */}
                <div className="px-5 pb-5">
                  <div className="flex flex-col gap-2">
                    <Link to={`/products/${product._id}`}>
                      <LiquidGlassButton
                        variant="dark"
                        size="md"
                        fullWidth
                      >
                        View Details
                      </LiquidGlassButton>
                    </Link>
                    <div className="flex gap-2">
                      <ComparisonButton product={product} size="sm" showText={false} />
                      <div className="flex-1">
                        <LiquidGlassButton
                          onClick={() => handleAddToCart(product)}
                          disabled={!isAuthenticated || product.stock === 0}
                          variant={!isAuthenticated ? 'primary' : 'success'}
                          size="md"
                          fullWidth
                          icon={<ShoppingCartIcon className="h-4 w-4" />}
                          iconPosition="left"
                        >
                          {!isAuthenticated ? 'Login to Add' : 'Add to Cart'}
                        </LiquidGlassButton>
                      </div>
                    </div>
                  </div>
                  
                  {product.stock === 0 && (
                    <div className="mt-2 text-center">
                      <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-300 mb-6">
              <MagnifyingGlassIcon className="h-20 w-20 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">No Products Found</h3>
            <p className="text-gray-600 mb-8 font-light">
              Try adjusting your search criteria or browse all products
            </p>
            <LiquidGlassButton
              onClick={handleClearSearch}
              variant="dark"
              size="lg"
            >
              Clear Filters
            </LiquidGlassButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;