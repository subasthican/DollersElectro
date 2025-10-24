import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  KeyIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  ShoppingBagIcon,
  ClockIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    product: {
      name: string;
      sku: string;
      images: Array<{ url: string }>;
    };
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  status: string;
  orderDate: string;
  pickupCode: string;
}

interface VerificationResult {
  success: boolean;
  message: string;
  data?: OrderDetails;
}

const PickupVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [pickupCode, setPickupCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [notes, setNotes] = useState('');
  const [pendingOrders, setPendingOrders] = useState<OrderDetails[]>([]);
  const [showPendingOrders, setShowPendingOrders] = useState(true);
  const [pickupHistory, setPickupHistory] = useState<OrderDetails[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch pending pickup orders
  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/orders/pickup/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setPendingOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  // Fetch pickup history (completed pickups)
  const fetchPickupHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/orders/pickup/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setPickupHistory(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching pickup history:', error);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchPickupHistory();
  }, []);

  // Verify pickup code
  const verifyPickupCode = async () => {
    if (!pickupCode || pickupCode.length !== 4) {
      setVerificationResult({
        success: false,
        message: 'Please enter a valid 4-digit pickup code'
      });
      return;
    }

    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/orders/pickup/verify/${pickupCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      setVerificationResult({
        success: false,
        message: 'Error verifying pickup code'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Complete pickup
  const completePickup = async () => {
    if (!verificationResult?.data) return;

    setIsCompleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/orders/pickup/complete/${pickupCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      
      const data = await response.json();
      if (data.success) {
        setVerificationResult({
          success: true,
          message: 'Order pickup completed successfully!',
          data: data.data.order
        });
        setPickupCode('');
        setNotes('');
        fetchPendingOrders(); // Refresh pending orders
        fetchPickupHistory(); // Refresh history
      } else {
        setVerificationResult({
          success: false,
          message: data.message || 'Error completing pickup'
        });
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message: 'Error completing pickup'
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <div className="py-4 border-b border-gray-200">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Admin Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Pickup Verification</span>
            </nav>
          </div>
          
          <div className="py-6">
            {/* Mobile Navigation */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Pickup Verification</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <KeyIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Pickup Verification
                  </h1>
                  <p className="text-gray-600 mt-1">Verify and complete customer order pickups using 4-digit codes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pickup Code Verification - iOS 26 Glassy Style */}
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <KeyIcon className="h-6 w-6 mr-2 text-green-600" />
              Verify Pickup Code
            </h2>

            {/* Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4-Digit Pickup Code
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={pickupCode}
                  onChange={(e) => setPickupCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  className="flex-1 px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-center text-2xl font-mono tracking-widest text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                  maxLength={4}
                />
                <button
                  onClick={verifyPickupCode}
                  disabled={isVerifying || pickupCode.length !== 4}
                  className="px-6 py-3 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center"
                >
                  {isVerifying ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <KeyIcon className="h-5 w-5 mr-2" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`p-4 rounded-lg mb-6 ${
                verificationResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {verificationResult.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    verificationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationResult.message}
                  </span>
                </div>
              </div>
            )}

            {/* Order Details */}
            {verificationResult?.success && verificationResult.data && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">
                        {verificationResult.data.customer.firstName} {verificationResult.data.customer.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{verificationResult.data.customer.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{verificationResult.data.customer.email}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <ShoppingBagIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Order Items
                  </h3>
                  <div className="space-y-2">
                    {verificationResult.data.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.product.name}</div>
                          <div className="text-sm text-gray-600">SKU: {item.product.sku}</div>
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatPrice(item.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(verificationResult.data.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Order Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order Number:</span>
                      <span className="ml-2 font-medium">{verificationResult.data.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pickup Code:</span>
                      <span className="ml-2 font-mono font-bold text-lg">{verificationResult.data.pickupCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <span className="ml-2 font-medium">{formatDate(verificationResult.data.orderDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium capitalize">{verificationResult.data.status}</span>
                    </div>
                  </div>
                </div>

                {/* Complete Pickup */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Complete Pickup</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about the pickup..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={completePickup}
                      disabled={isCompleting}
                      className="w-full px-6 py-3 backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center"
                    >
                      {isCompleting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Complete Pickup
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pending Orders - iOS 26 Glassy Style */}
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-orange-600" />
                Pending Pickups
              </h2>
              <button
                onClick={() => setShowPendingOrders(!showPendingOrders)}
                className="px-4 py-2 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-blue-600 hover:text-blue-700 hover:bg-white/75 text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105"
              >
                {showPendingOrders ? 'Hide' : 'Show'} ({pendingOrders.length})
              </button>
            </div>

            {showPendingOrders && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending pickup orders</p>
                  </div>
                ) : (
                  pendingOrders.map((order) => (
                    <div key={order._id} className="backdrop-blur-xl bg-gradient-to-br from-blue-50/50 to-white/80 border-2 border-blue-100/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-lg">{order.orderNumber}</div>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📞 {order.customer.phone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-2xl text-blue-600 bg-white/80 px-3 py-1 rounded-xl shadow-sm">
                            {order.pickupCode}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Pickup Code</div>
                        </div>
                      </div>
                      
                      {/* Product List */}
                      <div className="bg-white/60 rounded-xl p-3 mb-2">
                        <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                          <ShoppingBagIcon className="h-4 w-4 mr-1 text-blue-500" />
                          Products:
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-700 flex justify-between">
                              <span>• {item.product?.name || 'Product'}</span>
                              <span className="text-gray-500">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 inline mr-1" />
                          {formatDate(order.orderDate)}
                        </div>
                        <div className="font-bold text-green-600">
                          {formatPrice(order.total)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pickup History Section - iOS 26 Glassy Style */}
        <div className="mt-8 backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" />
              Pickup History
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-green-600 hover:text-green-700 hover:bg-white/75 text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105"
            >
              {showHistory ? 'Hide' : 'Show'} ({pickupHistory.length})
            </button>
          </div>

          {showHistory && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pickupHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pickup history yet</p>
                </div>
              ) : (
                pickupHistory.map((order) => (
                  <div key={order._id} className="backdrop-blur-xl bg-gradient-to-br from-green-50/50 to-white/80 border-2 border-green-100/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ✓ Completed
                        </div>
                      </div>
                    </div>
                    
                    {/* Product List */}
                    <div className="bg-white/60 rounded-xl p-3 mb-2">
                      <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                        <ShoppingBagIcon className="h-4 w-4 mr-1 text-green-500" />
                        Products:
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-700 flex justify-between">
                            <span>• {item.product?.name || 'Product'}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 inline mr-1" />
                        Picked up: {formatDate(order.orderDate)}
                      </div>
                      <div className="font-bold text-gray-700">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Floating Back Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <button
            onClick={() => navigate(-1)}
            className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white p-4 rounded-full shadow-2xl shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-110"
            title="Go Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupVerificationPage;
