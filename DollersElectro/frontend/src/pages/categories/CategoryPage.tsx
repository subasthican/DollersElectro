import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BoltIcon, 
  ArrowLeftIcon, 
  LightBulbIcon,
  CogIcon,
  ShieldCheckIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { productHelpers } from '../../services/api/productAPI';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch products when component mounts
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Category configurations
  const categoryConfig = useMemo(() => {
    const configs: Record<string, { 
      name: string; 
      icon: any; 
      color: string; 
      description: string;
      image: string;
    }> = {
      'lighting': {
        name: 'Lighting Solutions',
        icon: LightBulbIcon,
        color: 'from-yellow-400 to-orange-500',
        description: 'Browse our selection of LED bulbs, fixtures, and smart lighting systems',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=400&fit=crop'
      },
      'electrical': {
        name: 'Electrical Components',
        icon: BoltIcon,
        color: 'from-blue-500 to-purple-600',
        description: 'Browse our selection of switches, outlets, wiring, and electrical accessories',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=400&fit=crop'
      },
      'smart-home': {
        name: 'Smart Home',
        icon: CogIcon,
        color: 'from-green-400 to-teal-500',
        description: 'Browse our selection of automation devices, IoT solutions, and smart controls',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=400&fit=crop'
      },
      'tools': {
        name: 'Tools & Equipment',
        icon: WrenchIcon,
        color: 'from-red-500 to-pink-600',
        description: 'Browse our selection of professional electrical tools and testing equipment',
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=400&fit=crop'
      },
      'safety': {
        name: 'Safety & Protection',
        icon: ShieldCheckIcon,
        color: 'from-indigo-500 to-blue-600',
        description: 'Browse our selection of circuit breakers, surge protectors, and safety gear',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=400&fit=crop'
      },
      'cables': {
        name: 'Cables & Wires',
        icon: BoltIcon,
        color: 'from-gray-500 to-slate-600',
        description: 'Browse our selection of high-quality cables, wires, and connectors',
        image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=400&fit=crop'
      }
    };

    const id = categoryId?.toLowerCase() || '';
    return configs[id] || {
      name: categoryId || 'Category',
      icon: BoltIcon,
      color: 'from-blue-500 to-purple-600',
      description: `Browse our selection of ${categoryId} products`,
      image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&h=400&fit=crop'
    };
  }, [categoryId]);

  // Filter products by category
  const categoryProducts = products?.filter(product => 
    product.category.toLowerCase() === categoryId?.toLowerCase()
  ) || [];

  const category = {
    id: categoryId,
    name: categoryConfig.name,
    description: categoryConfig.description,
    icon: categoryConfig.icon,
    color: categoryConfig.color,
    image: categoryConfig.image,
    products: categoryProducts
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Apple-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/categories"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{category.name}</h1>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apple-style Hero Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-5xl font-bold mb-4">
                Explore {category.name}
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Discover our comprehensive range of high-quality electrical products and solutions
              </p>
              <div className="flex items-center space-x-4 text-white">
                <span className="text-2xl font-semibold">{category.products.length}+ Products</span>
                <span className="text-blue-200">•</span>
                <span className="text-blue-100">Premium Quality</span>
              </div>
            </div>
            <div className="relative">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section - Apple Style */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Products in {category.name}</h3>
          <p className="text-gray-600">Handpicked electrical products for your needs</p>
        </div>

        {/* Apple-style Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {category.products.map((product) => (
            <div key={product._id} className="group">
              {/* Apple-style Product Card */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-50">
                  <img
                    src={productHelpers.getPrimaryImage(product)}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    SKU: {product.sku}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {productHelpers.formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {productHelpers.formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  {/* Add to Cart Button - Apple Style */}
                  <button
                    onClick={() => addItem(product)}
                    disabled={!product.isInStock}
                    className={`w-full py-3 px-4 rounded-full font-semibold text-sm transition-all duration-300
                      ${!product.isInStock 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : !isAuthenticated
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isInCart(product.id || product._id || '')
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                  >
                    {!product.isInStock 
                      ? 'Out of Stock'
                      : !isAuthenticated 
                        ? 'Login to Add'
                        : isInCart(product.id || product._id || '') 
                          ? `In Cart (${getItemQuantity(product.id || product._id || '')})` 
                          : 'Add to Cart'
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

