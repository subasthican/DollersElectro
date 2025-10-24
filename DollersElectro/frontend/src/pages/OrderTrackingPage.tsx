import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import GameModal from '../components/GameModal';
import { 
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  KeyIcon,
  ShoppingCartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface OrderStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  timestamp: string;
  description: string;
  location?: string;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  estimatedPickup: string;
  pickupLocation: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  status: OrderStatus[];
  pickupCode: string;
  qrCodeData: string;
}

const OrderTrackingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: cartState } = useCart();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Generate order details from cart data
  const generateOrderFromCart = (): OrderDetails => {
    const timestamp = Date.now();
    const orderId = `ORD-${timestamp}`;
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    return {
      orderId: orderId,
      customerName: 'Your Name',
      customerEmail: 'your.email@example.com',
      customerPhone: '+1-555-0123',
      orderDate: new Date().toISOString().split('T')[0],
      estimatedPickup: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      pickupLocation: 'Jaffna Store - DollersElectro, Jaffna',
      items: cartState.items.map(item => ({
        name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.product?.price || 0,
        image: item.product?.images?.[0]?.url || '/placeholder-product.jpg'
      })),
      totalAmount: cartState.total,
      status: [
        {
          id: '1',
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          description: 'Order confirmed and payment received'
        },
        {
          id: '2',
          status: 'processing',
          timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes later
          description: 'Order is being prepared for pickup'
        }
      ],
      pickupCode: pickupCode,
      qrCodeData: `${orderId}-${pickupCode}-MAIN-STORE`
    };
  };

  useEffect(() => {
    // If order details are passed via location state, use them
    if (location.state?.orderDetails) {
      setOrderDetails(location.state.orderDetails);
      setShowOrderDetails(true);
    }
  }, [location.state]);

  const handleTrackOrder = () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (trackingNumber.toUpperCase() === 'ORD-2024-001' || trackingNumber.toUpperCase() === '1234') {
        setOrderDetails(generateOrderFromCart());
        setShowOrderDetails(true);
      } else {
        setError('Order not found. Please check your tracking number.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleShowMyOrder = () => {
    if (cartState.items.length === 0) {
      setError('No items in your cart. Please add some products first.');
      return;
    }
    
    const order = generateOrderFromCart();
    setOrderDetails(order);
    setShowOrderDetails(true);
    setError('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-blue-600" />;
      case 'ready':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'picked_up':
        return <TruckIcon className="h-6 w-6 text-purple-600" />;
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentStatus = () => {
    if (!orderDetails) return null;
    return orderDetails.status[orderDetails.status.length - 1];
  };

  const getProgressPercentage = () => {
    if (!orderDetails) return 0;
    const statusOrder = ['pending', 'confirmed', 'processing', 'ready', 'picked_up', 'delivered'];
    const currentIndex = statusOrder.indexOf(getCurrentStatus()?.status || 'pending');
    return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-lg text-gray-600">
            View your current order or enter a tracking number to check order status
          </p>
        </div>

        {/* My Current Order Section */}
        {cartState.items.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ShoppingCartIcon className="h-6 w-6 mr-2 text-blue-600" />
              My Current Order
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Items in Cart:</span> {cartState.itemCount}</p>
                  <p><span className="text-gray-600">Total Amount:</span> LKR {cartState.total.toFixed(2)}</p>
                  <p><span className="text-gray-600">Status:</span> <span className="text-blue-600 font-medium">Ready to Order</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleShowMyOrder}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Order Details
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Go to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Items Preview */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Items in Your Order:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cartState.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                                          {item.product?.images && item.product.images.length > 0 && (
                      <img src={item.product.images[0].url} alt={item.product?.name || 'Product'} className="w-12 h-12 object-cover rounded" />
                    )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">LKR {((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tracking Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Track Existing Order</h2>
          <div className="max-w-md mx-auto">
            <div className="flex space-x-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number or order ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
              <button
                onClick={handleTrackOrder}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Tracking...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    <span>Track</span>
                  </div>
                )}
              </button>
            </div>
            
            {error && (
              <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
            )}

            {/* Sample Tracking Numbers */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Try these sample tracking numbers:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTrackingNumber('ORD-2024-001')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200"
                >
                  ORD-2024-001
                </button>
                <button
                  onClick={() => setTrackingNumber('1234')}
                  className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full hover:bg-green-200"
                >
                  1234
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details and Tracking */}
        {showOrderDetails && orderDetails && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Order ID:</span> {orderDetails.orderId}</p>
                    <p><span className="text-gray-600">Order Date:</span> {new Date(orderDetails.orderDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Estimated Pickup:</span> {new Date(orderDetails.estimatedPickup).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Total Amount:</span> LKR {orderDetails.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Name:</span> {orderDetails.customerName}</p>
                    <p><span className="text-gray-600">Email:</span> {orderDetails.customerEmail}</p>
                    <p><span className="text-gray-600">Phone:</span> {orderDetails.customerPhone}</p>
                    <p><span className="text-gray-600">Pickup Location:</span> {orderDetails.pickupLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">LKR {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-t-2 border-gray-200">
                  <p className="font-semibold text-gray-900">Total</p>
                  <p className="font-semibold text-gray-900">LKR {orderDetails.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Pickup Verification */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pickup Verification</h2>
              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  4-Digit Pickup Code
                </h3>
                <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300 inline-block">
                  <span className="text-4xl font-bold text-gray-900 tracking-widest">
                    {orderDetails.pickupCode}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Provide this code to store staff for pickup verification
                </p>
              </div>
            </div>

            {/* Order Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Progress</h2>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Status */}
              {getCurrentStatus() && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getCurrentStatus()!.status)}
                    <div>
                      <h3 className="font-medium text-blue-900">Current Status</h3>
                      <p className="text-sm text-blue-800">{getCurrentStatus()!.description}</p>
                      {getCurrentStatus()!.location && (
                        <p className="text-xs text-blue-700 mt-1">
                          <MapPinIcon className="h-3 w-3 inline mr-1" />
                          {getCurrentStatus()!.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="space-y-4">
                {orderDetails.status.map((status, index) => (
                  <div key={status.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(status.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status.status)}`}>
                          {status.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(status.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{status.description}</p>
                      {status.location && (
                        <p className="text-xs text-gray-600 mt-1">
                          <MapPinIcon className="h-3 w-3 inline mr-1" />
                          {status.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <PhoneIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Call Support</h3>
                  <p className="text-sm text-gray-600">+1-555-0123</p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <EnvelopeIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
                  <p className="text-sm text-gray-600">support@dollerselectro.com</p>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
                  <p className="text-sm text-gray-600">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-300 font-medium"
          >
            Back to Home
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3 bg-gray-200 text-gray-900 rounded-full hover:bg-gray-300 transition-all duration-300 font-medium"
          >
            Continue Shopping
          </button>
        </div>

        {/* Game Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              🎮 While You Wait for Your Order...
            </h3>
            <p className="text-gray-600 mb-4">
              Play our fun Snake game and collect electronic items! Perfect way to pass the time.
            </p>
            <button
              onClick={() => setIsGameOpen(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Play Snake Game</span>
            </button>
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

export default OrderTrackingPage;
