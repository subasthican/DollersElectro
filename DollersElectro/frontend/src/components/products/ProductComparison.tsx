import React from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useProductComparison } from '../../contexts/ProductComparisonContext';
import { productHelpers, Product } from '../../services/api/productAPI';

const ProductComparison: React.FC = () => {
  const { comparedProducts, removeFromComparison, clearComparison } = useProductComparison();

  if (comparedProducts.length === 0) {
    return null;
  }

  const comparisonFeatures = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Stock' },
    { key: 'rating', label: 'Rating' },
    { key: 'warranty', label: 'Warranty' },
    { key: 'weight', label: 'Weight' },
    { key: 'shippingClass', label: 'Shipping Class' }
  ];

  const getFeatureValue = (product: Product, feature: string) => {
    switch (feature) {
      case 'name':
        return product.name;
      case 'price':
        return productHelpers.formatPrice(product.price);
      case 'category':
        return product.category;
      case 'stock':
        return product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
      case 'rating':
        return product.rating ? `${product.rating}/5` : 'No rating';
      case 'warranty':
        return product.warranty || 'N/A';
      case 'weight':
        return product.weight || 'N/A';
      case 'shippingClass':
        return product.shippingClass || 'Standard';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Comparison</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {comparedProducts.length} of 4 products
          </span>
          <button
            onClick={clearComparison}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-900">Features</th>
              {comparedProducts.map((product) => (
                <th key={product._id} className="text-center py-3 px-2 font-medium text-gray-900 min-w-[200px]">
                  <div className="relative">
                    <button
                      onClick={() => removeFromComparison(product._id || '')}
                      className="absolute -top-2 -right-2 bg-gray-200 text-gray-600 rounded-full p-1 hover:bg-gray-300 transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                    <div className="aspect-square mb-2 mx-auto w-16 h-16 overflow-hidden rounded-lg">
                      <img
                        src={productHelpers.getPrimaryImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h4>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((feature) => (
              <tr key={feature.key} className="border-b border-gray-100">
                <td className="py-3 px-2 font-medium text-gray-700">
                  {feature.label}
                </td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="py-3 px-2 text-center text-sm text-gray-600">
                    {getFeatureValue(product, feature.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex space-x-2">
          {comparedProducts.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              View Details
            </Link>
          ))}
        </div>
        
        <Link
          to="/products"
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>Add More Products</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ProductComparison;
