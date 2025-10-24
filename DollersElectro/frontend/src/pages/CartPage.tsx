import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { useAppSelector } from '../store';
import { toast } from 'react-hot-toast';
import { productHelpers } from '../services/api/productAPI';
import PromoCodeInput from '../components/cart/PromoCodeInput';
import GameModal from '../components/GameModal';
import LiquidGlassButton from '../components/LiquidGlassButton';

const CartPage: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentPromoCode, setCurrentPromoCode] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your cart');
      navigate('/login', { 
        state: { 
          returnUrl: '/cart',
          returnState: { from: 'cart' }
        } 
      });
    }
  }, [isAuthenticated, navigate]);

  const handleProceedToCheckout = () => {
    // Go to delivery info page first
    navigate('/delivery-info', { 
      state: { 
        items: state.items,
        total: state.total,
        promoCode: currentPromoCode,
        discountAmount: discountAmount
      } 
    });
  };

  const handlePromoCodeApplied = (promoData: any) => {
    setCurrentPromoCode(promoData);
    // Calculate discount amount
    if (promoData.type === 'percentage') {
      setDiscountAmount((state.total * promoData.value) / 100);
    } else if (promoData.type === 'fixed') {
      setDiscountAmount(promoData.value);
    } else if (promoData.type === 'free_shipping') {
      setDiscountAmount(0); // Free shipping handled separately
    }
  };

  const handlePromoCodeRemoved = () => {
    setCurrentPromoCode(null);
    setDiscountAmount(0);
  };

  const handleRefreshCart = async () => {
    setIsRefreshing(true);
    try {
      await refreshCart();
      toast.success('Cart refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh cart');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Don't render cart content if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner - Apple iOS Style */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Review your selected items and proceed to checkout
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 font-light">
            Looks like you haven't added any products yet.
          </p>
          <Link to="/products">
            <LiquidGlassButton
              variant="dark"
              size="lg"
              icon={<ShoppingBagIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              Start Shopping
            </LiquidGlassButton>
          </Link>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section - Apple iOS 26 Glassy */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="container-custom py-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🛒 Shopping Cart
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review and manage your selected products ({state.itemCount} items)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-3xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Cart Items</h2>
                    <p className="text-gray-600 mt-1">Review and manage your selected products</p>
                  </div>
                  <LiquidGlassButton
                    onClick={handleRefreshCart}
                    disabled={isRefreshing}
                    variant="dark"
                    size="md"
                    icon={<ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                    iconPosition="left"
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </LiquidGlassButton>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {state.items.map((item) => {
                  const product = item.product || item;
                  const productId = product.id || product._id || '';

                  return (
                    <div key={productId} className="p-8 hover:bg-white/50 transition-colors">
                      <div className="flex space-x-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={productHelpers.getPrimaryImage(product)}
                            alt={product.name || 'Product'}
                            className="w-28 h-28 object-cover rounded-2xl"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {product.name || 'Unknown Product'}
                              </h3>
                              <p className="text-gray-600 mb-3 line-clamp-2 font-light">
                                {product.description || 'No description available'}
                              </p>
                              <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-bold text-gray-900">
                                  {productHelpers.formatPrice(product.price || 0)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-sm text-gray-400 line-through font-medium">
                                    {productHelpers.formatPrice(product.originalPrice)}
                                  </span>
                                )}
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-sm text-green-600 font-semibold">
                                    Save {productHelpers.formatPrice(product.originalPrice - product.price)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-col items-end space-y-4">
                              <div className="flex items-center space-x-2 bg-gray-200 rounded-full px-3 py-2">
                                <button
                                  onClick={() => {

                                    updateQuantity(productId, item.quantity - 1);
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={item.quantity <= 1}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="text-gray-900 font-bold text-base min-w-[2.5rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {

                                    updateQuantity(productId, item.quantity + 1);
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => {

                                  removeItem(productId);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                                title="Remove from cart"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary - Apple iOS 26 Glassy */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8 sticky top-24">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Order Summary</h2>
              
              {/* Available Promo Codes - iOS 26 Glassy */}
              <div className="mb-6 p-5 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 border-2 border-blue-200/60 rounded-2xl shadow-lg">
                <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  Available Promo Codes
                </h3>
                <div className="text-sm text-blue-800 space-y-3">
                  <div className="backdrop-blur-xl bg-white/60 p-3 rounded-xl border border-white/60 shadow-sm">
                    <strong className="font-bold text-blue-900">SAVE20:</strong> 
                    <span className="font-medium"> 20% off orders above LKR 15,000</span>
                  </div>
                  <div className="backdrop-blur-xl bg-white/60 p-3 rounded-xl border border-white/60 shadow-sm">
                    <strong className="font-bold text-blue-900">FREESHIP:</strong> 
                    <span className="font-medium"> Free shipping above LKR 7,500</span>
                  </div>
                  <div className="backdrop-blur-xl bg-white/60 p-3 rounded-xl border border-white/60 shadow-sm">
                    <strong className="font-bold text-blue-900">NEWCUST:</strong> 
                    <span className="font-medium"> LKR 1,500 off for new customers</span>
                  </div>
                </div>
              </div>
              
              {/* Promo Code Input */}
              <div className="mb-6">
                <PromoCodeInput
                  subtotal={state.total}
                  onPromoCodeApplied={handlePromoCodeApplied}
                  onPromoCodeRemoved={handlePromoCodeRemoved}
                  currentPromoCode={currentPromoCode}
                />
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-base text-gray-600">
                  <span className="font-light">Subtotal ({state.itemCount} items)</span>
                  <span className="font-semibold">{productHelpers.formatPrice(state.total)}</span>
                </div>
                
                {/* Promo Code Discount */}
                {currentPromoCode && (
                  <div className="flex justify-between text-base text-green-600 bg-green-50 p-3 rounded-2xl">
                    <span className="font-light">Discount ({currentPromoCode.code})</span>
                    <span className="font-bold">-{productHelpers.formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-base text-gray-600">
                  <span className="font-light">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-base text-gray-600">
                  <span className="font-light">Tax</span>
                  <span className="font-semibold">{productHelpers.formatPrice((state.total - discountAmount) * 0.08)}</span>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span className="tracking-tight">Total</span>
                    <span className="tracking-tight">{productHelpers.formatPrice((state.total - discountAmount) * 1.08)}</span>
                  </div>
                </div>
              </div>

              <LiquidGlassButton
                onClick={handleProceedToCheckout}
                variant="primary"
                size="lg"
                fullWidth
              >
                Proceed to Checkout
              </LiquidGlassButton>

              <div className="mt-3">
                <LiquidGlassButton
                  onClick={clearCart}
                  variant="danger"
                  size="lg"
                  fullWidth
                >
                  Clear Cart
                </LiquidGlassButton>
              </div>

              {/* Game Section */}
              <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-100">
                <div className="text-center">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    🎮 While You Wait...
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 font-light">
                    Play our fun Snake game and collect electronic items!
                  </p>
                  <LiquidGlassButton
                    onClick={() => setIsGameOpen(true)}
                    variant="success"
                    size="lg"
                    fullWidth
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    iconPosition="left"
                  >
                    Play Snake Game
                  </LiquidGlassButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modal */}
      <GameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
      />
    </div>
  );
};

export default CartPage;
