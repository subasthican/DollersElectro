import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { productHelpers } from '../services/api/productAPI';
import { 
  ArrowLeftIcon,
  TruckIcon, 
  MapPinIcon, 
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import LiquidGlassButton from '../components/LiquidGlassButton';

interface DeliveryInfo {
  deliveryType: 'delivery' | 'pickup';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryInstructions: string;
  pickupLocation?: string;
  preferredDeliveryDate?: string;
  preferredDeliveryTime?: string;
}

const DeliveryInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, promoCode, discountAmount } = location.state || { 
    items: [], 
    total: 0,
    promoCode: null,
    discountAmount: 0
  };
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    deliveryType: 'pickup',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    deliveryInstructions: '',
    pickupLocation: '',
    preferredDeliveryDate: '',
    preferredDeliveryTime: ''
  });

  const [errors, setErrors] = useState<Partial<DeliveryInfo>>({});

  // Auto-fill user information if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setDeliveryInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          returnUrl: '/delivery-info',
          returnState: { items, total, promoCode, discountAmount }
        }
      });
    }
  }, [isAuthenticated, navigate, items, total, promoCode, discountAmount]);

  const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleProceedToPayment = () => {
    if (!validateForm()) {
      return;
    }

    // Navigate to payment page with delivery info
    navigate('/payment', {
      state: {
        items: items,
        total: total,
        deliveryInfo: deliveryInfo,
        promoCode: promoCode,
        discountAmount: discountAmount,
        fromDeliveryInfo: true
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryInfo> = {};

    // Only validate contact info if user is not logged in (for guest checkout)
    if (!isAuthenticated) {
      if (!deliveryInfo.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!deliveryInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!deliveryInfo.email.trim()) newErrors.email = 'Email is required';
      if (!deliveryInfo.phone.trim()) newErrors.phone = 'Phone is required';
    }

    // Since home delivery is coming soon, only validate pickup location
    if (deliveryInfo.deliveryType === 'pickup') {
      if (!deliveryInfo.pickupLocation?.trim()) newErrors.pickupLocation = 'Pickup location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    handleProceedToPayment();
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Apple iOS 26 Glassy */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              onClick={handleBackToCart}
              className="mr-4 p-2 text-gray-700 hover:text-blue-600 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">📍 Delivery Information</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Delivery Details</h2>
              
              {/* User Info Notice - iOS 26 Glassy */}
              {isAuthenticated && (
                <div className="mb-6 p-5 backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-2 border-green-300/60 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-green-900">Welcome back, {user?.firstName}!</p>
                      <p className="text-sm text-green-700 font-medium">
                        Your contact information has been automatically filled from your profile. 
                        You only need to select pickup location and add any special instructions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Type Selection - iOS 26 Glassy */}
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Delivery Type
                </label>
                <div className="grid grid-cols-2 gap-6">
                  <button
                    type="button"
                    disabled
                    className="relative p-6 border-2 backdrop-blur-xl bg-gray-100/60 border-gray-300/60 rounded-2xl text-center transition-all opacity-60 cursor-not-allowed shadow-sm overflow-hidden"
                  >
                    <TruckIcon className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <span className="font-bold text-gray-500 block mb-2">Home Delivery</span>
                    <p className="text-sm text-gray-400 mb-3">Coming Soon!</p>
                    <div className="px-4 py-2 backdrop-blur-xl bg-yellow-100/80 text-yellow-800 text-sm rounded-full font-bold border border-yellow-200">
                      Coming Soon
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange('deliveryType', 'pickup')}
                    className={`p-6 border-2 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
                      deliveryInfo.deliveryType === 'pickup'
                        ? 'backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 border-blue-500 shadow-xl shadow-blue-500/30'
                        : 'backdrop-blur-xl bg-white/60 border-white/60 hover:border-blue-300 shadow-lg'
                    }`}
                  >
                    <MapPinIcon className={`h-10 w-10 mx-auto mb-3 ${deliveryInfo.deliveryType === 'pickup' ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className={`font-bold block mb-2 ${deliveryInfo.deliveryType === 'pickup' ? 'text-blue-900' : 'text-gray-900'}`}>Store Pickup</span>
                    <p className={`text-sm ${deliveryInfo.deliveryType === 'pickup' ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>Pick up from our store</p>
                  </button>
                </div>
                
                {/* Coming Soon Notice - iOS 26 Glassy */}
                <div className="mt-6 p-5 backdrop-blur-xl bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border-2 border-yellow-300/60 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 shadow-lg shadow-yellow-500/50">
                      <ClockIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-yellow-900">Home Delivery Coming Soon! 🚚</p>
                      <p className="text-sm text-yellow-700 font-medium">
                        We're working hard to bring home delivery to your area. For now, please use our convenient store pickup service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  {isAuthenticated && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <UserIcon className="h-4 w-4" />
                      <span>Using your profile information</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all font-semibold ${
                        errors.firstName 
                          ? 'border-red-500 backdrop-blur-xl bg-red-50/80' 
                          : isAuthenticated 
                          ? 'backdrop-blur-xl bg-gray-100/60 border-gray-300/60 cursor-not-allowed' 
                          : 'backdrop-blur-xl bg-white/60 border-white/60 hover:border-blue-300'
                      }`}
                      placeholder={isAuthenticated ? "Auto-filled from profile" : "Enter first name"}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all font-semibold ${
                        errors.lastName 
                          ? 'border-red-500 backdrop-blur-xl bg-red-50/80' 
                          : isAuthenticated 
                          ? 'backdrop-blur-xl bg-gray-100/60 border-gray-300/60 cursor-not-allowed' 
                          : 'backdrop-blur-xl bg-white/60 border-white/60 hover:border-blue-300'
                      }`}
                      placeholder={isAuthenticated ? "Auto-filled from profile" : "Enter last name"}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all font-semibold ${
                        errors.email 
                          ? 'border-red-500 backdrop-blur-xl bg-red-50/80' 
                          : isAuthenticated 
                          ? 'backdrop-blur-xl bg-gray-100/60 border-gray-300/60 cursor-not-allowed' 
                          : 'backdrop-blur-xl bg-white/60 border-white/60 hover:border-blue-300'
                      }`}
                      placeholder={isAuthenticated ? "Auto-filled from profile" : "Enter email address"}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={deliveryInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all ${
                        errors.phone 
                          ? 'border-red-500 bg-red-50' 
                          : isAuthenticated 
                          ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                          : 'backdrop-blur-xl bg-white/60 border-white/60 hover:border-blue-300'
                      }`}
                      placeholder={isAuthenticated ? "Auto-filled from profile" : "Enter phone number"}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Your contact information is automatically filled from your profile. 
                      If you need to update this information, please go to your <button 
                        onClick={() => navigate('/profile')} 
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        profile page
                      </button>.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Address (Coming Soon) */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  Delivery Address
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Coming Soon
                  </span>
                </h3>
                <div className="space-y-4 opacity-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-900 shadow-sm cursor-not-allowed"
                      placeholder="Home delivery coming soon..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-900 shadow-sm cursor-not-allowed"
                        placeholder="Coming soon..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-900 shadow-sm cursor-not-allowed"
                        placeholder="Coming soon..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-900 shadow-sm cursor-not-allowed"
                        placeholder="Coming soon..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      disabled
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-900 shadow-sm cursor-not-allowed appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option>Home delivery coming soon...</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    🚚 <strong>Home delivery is coming soon!</strong> We're expanding our delivery network to serve your area.
                  </p>
                </div>
              </div>

              {/* Pickup Location (Available Now) */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  Pickup Location
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Available Now
                  </span>
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pickup Location *
                  </label>
                  <select
                    value={deliveryInfo.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none ${
                      errors.pickupLocation ? 'border-red-500 bg-red-50' : 'backdrop-blur-xl bg-white/60 border-white/60 hover:border-blue-300'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Choose a pickup location</option>
                    <option value="jaffna-store">Jaffna Store - DollersElectro, Jaffna</option>
                    <option value="sandilipay-branch">Sandilipay Branch - DollersElectro, Sandilipay</option>
                  </select>
                  {errors.pickupLocation && (
                    <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
                  )}
                </div>
                
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    🏪 <strong>Store pickup is available now!</strong> Choose from our convenient locations.
                  </p>
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={deliveryInfo.deliveryInstructions}
                  onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all hover:border-gray-300 resize-none"
                  placeholder="Any special instructions for delivery or pickup..."
                />
              </div>

              {/* Preferred Delivery/Pickup Time */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={deliveryInfo.preferredDeliveryDate}
                      onChange={(e) => handleInputChange('preferredDeliveryDate', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all hover:border-gray-300"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <select
                      value={deliveryInfo.preferredDeliveryTime}
                      onChange={(e) => handleInputChange('preferredDeliveryTime', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer hover:border-gray-300 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">Any time</option>
                      <option value="morning">Morning (8 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Order Button */}
              <div className="flex justify-end">
                <LiquidGlassButton
                  onClick={handleProceedToPayment}
                  variant="primary"
                  size="xl"
                >
                  Continue to Payment
                </LiquidGlassButton>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar - iOS 26 Glassy */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8 sticky top-24">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Order Summary</h3>
              
              {items.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {items.map((item: any) => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.product?.image || '/placeholder-product.jpg'} 
                          alt={item.product?.name || 'Product'} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {productHelpers.formatPrice((item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No items in cart</p>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm text-gray-900">{productHelpers.formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="text-sm text-green-600 font-medium">Free (Pickup)</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-sm text-gray-900">{productHelpers.formatPrice(total * 0.08)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {productHelpers.formatPrice(total * 1.08)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Status - iOS 26 Glassy */}
              <div className="mt-6 space-y-4">
                {/* Pickup Status */}
                <div className="p-4 backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-2 border-green-300/60 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50">
                        <MapPinIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-base font-bold text-green-900">Store Pickup</span>
                    </div>
                    <span className="px-3 py-1 backdrop-blur-xl bg-green-100/80 text-green-800 text-xs font-bold rounded-full border border-green-200">
                      Available Now
                    </span>
                  </div>
                  <p className="text-sm text-green-700 font-medium pl-11">
                    Pick up from our store locations
                  </p>
                </div>
                
                {/* Delivery Status */}
                <div className="p-4 backdrop-blur-xl bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border-2 border-yellow-300/60 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 shadow-lg shadow-yellow-500/50">
                        <TruckIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-base font-bold text-yellow-900">Home Delivery</span>
                    </div>
                    <span className="px-3 py-1 backdrop-blur-xl bg-yellow-100/80 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 font-medium pl-11">
                    Expanding delivery network
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfoPage;
