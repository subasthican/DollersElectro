import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRecentlyViewed } from '../../contexts/RecentlyViewedContext';
import { productHelpers } from '../../services/api/productAPI';

const RecentlyViewedProducts: React.FC = () => {
  const { recentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <EyeIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
        </div>
        <button
          onClick={clearRecentlyViewed}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recentlyViewed.map((product) => (
          <div key={product._id} className="group relative">
            <Link
              to={`/products/${product._id}`}
              className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="aspect-square mb-2 overflow-hidden rounded-lg">
                <img
                  src={productHelpers.getPrimaryImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                {product.name}
              </h4>
              <p className="text-sm font-semibold text-blue-600">
                {productHelpers.formatPrice(product.price)}
              </p>
            </Link>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                removeFromRecentlyViewed(product._id || '');
              }}
              className="absolute -top-1 -right-1 bg-gray-200 text-gray-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedProducts;
