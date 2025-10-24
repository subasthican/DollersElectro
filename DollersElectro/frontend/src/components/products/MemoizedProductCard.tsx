import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../services/api/productAPI';
import { productHelpers } from '../../services/api/productAPI';
import { StarIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface MemoizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  isInCart: boolean;
  getItemQuantity: (productId: string) => number;
}

const MemoizedProductCard: React.FC<MemoizedProductCardProps> = memo(({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  isInCart,
  getItemQuantity
}) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product);
  }, [onAddToCart, product]);

  const handleToggleWishlist = useCallback(() => {
    onToggleWishlist(product._id || product.id || '');
  }, [onToggleWishlist, product._id, product.id]);

  const productId = product._id || product.id || '';
  const cartQuantity = getItemQuantity(productId);

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <Link to={`/products/${productId}`}>
          <img
            src={productHelpers.getPrimaryImage(product)}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        {product.isOnSale && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {productHelpers.getDiscountPercentage(product)}% OFF
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <Link to={`/products/${productId}`}>
          <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {productHelpers.formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {productHelpers.formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center text-blue-700">
            <StarIcon className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-600">
              {product.rating || 4.8}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.isInStock}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            <span>
              {!product.isInStock
                ? 'Out of Stock'
                : isInCart
                ? `In Cart (${cartQuantity})`
                : 'Add to Cart'}
            </span>
          </button>
          
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isInWishlist
                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

MemoizedProductCard.displayName = 'MemoizedProductCard';

export default MemoizedProductCard;



