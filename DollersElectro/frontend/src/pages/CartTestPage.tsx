import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchFeaturedProducts } from '../store/slices/productSlice';

const CartTestPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const { state, addItem, removeItem, clearCart, isInCart, getItemQuantity } = useCart();
  
  // Get featured products for testing
  const testProducts = products?.filter(product => product.isFeatured).slice(0, 3) || [];

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart Test Page</h1>
        
        {/* Cart Status */}
        <div className="bg-gray-100/30 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{state.itemCount}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Unique Products</p>
              <p className="text-2xl font-bold text-gray-900">{state.items.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-2xl font-bold text-gray-900">LKR {state.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-gray-100/30 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Items</h2>
          {state.items.length === 0 ? (
            <p className="text-gray-500">No items in cart</p>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.product._id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Price: LKR {item.product?.price || 0}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id || item.product._id || '')}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Products */}
        <div className="bg-gray-100/30 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Products</h2>
          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testProducts.map((product) => (
                <div key={product._id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">${product.price}</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => addItem(product)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                    >
                      {isInCart(product.id || product._id || '') ? `In Cart (${getItemQuantity(product.id || product._id || '')})` : 'Add to Cart'}
                    </button>
                    {isInCart(product.id || product._id || '') && (
                      <button
                        onClick={() => removeItem(product.id || product._id || '')}
                        className="btn btn-outline btn-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-100/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={clearCart}
              className="btn btn-destructive"
              disabled={state.items.length === 0}
            >
              Clear Cart
            </button>
            <button
              onClick={() => {

              }}
              className="btn btn-outline"
            >
              Log Cart State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTestPage;
