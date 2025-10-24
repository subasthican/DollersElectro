import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchCustomerOrders } from '../../store/slices/orderSlice';
import { orderHelpers } from '../../services/api/orderAPI';
import { Order } from '../../store/slices/orderSlice';
import { 
  MagnifyingGlassIcon, 
  TruckIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, isLoading, error } = useAppSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [billImage, setBillImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCustomerOrders());
  }, [dispatch]);

  const filteredOrders = orders
    .filter((order: Order) => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.items.some((item: any) => item.productSnapshot.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: Order, b: Order) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.orderDate || a.createdAt).getTime();
          bValue = new Date(b.orderDate || b.createdAt).getTime();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.orderDate || a.createdAt).getTime();
          bValue = new Date(b.orderDate || b.createdAt).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusBadge = (status: string) => {
    const statusColors = orderHelpers.getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors = orderHelpers.getPaymentStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBillUpload = async () => {
    if (!billImage || !selectedOrder) {
      alert('Please select an image first');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/orders/${selectedOrder._id}/upload-payment-bill`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ billImage })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Payment bill uploaded successfully! Admin will verify within 24 hours.');
        setShowUploadModal(false);
        setBillImage('');
        setSelectedOrder(null);
        // Refresh orders
        dispatch(fetchCustomerOrders());
      } else {
        alert('❌ Failed to upload bill: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload payment bill. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-2xl bg-white/80 rounded-3xl p-12 shadow-2xl border-2 border-white/60">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500/90 to-red-600/90 shadow-xl shadow-red-500/50 mb-6">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Error Loading Orders</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => dispatch(fetchCustomerOrders())}
              className="backdrop-blur-xl bg-gradient-to-br from-red-500/90 to-red-600/90 hover:from-red-600/95 hover:to-red-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-red-500/40 hover:shadow-red-500/60 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Banner - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📦 Your Order History
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              View and track all your orders and purchase history
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters and Search - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none pr-10"
              >
                <option value="all">All Status</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none pr-10"
              >
                <option value="date">Sort by Date</option>
                <option value="total">Sort by Total</option>
                <option value="status">Sort by Status</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 backdrop-blur-xl bg-white/60 hover:bg-white/80 border-2 border-white/60 hover:border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-900 font-semibold"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-6">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders found</h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You haven\'t placed any orders yet'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/products')}
                className="backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-purple-600/90 hover:from-blue-600/95 hover:to-purple-700/95 text-white px-8 py-3 rounded-2xl shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Start Shopping 🛍️
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order: Order) => (
              <div key={order._id} className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 hover:bg-white/90 transition-all duration-300 transform hover:scale-[1.01]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment.status)}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={item.productSnapshot.image || '/placeholder-product.jpg'}
                            alt={item.productSnapshot.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.productSnapshot.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × LKR {item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">LKR {item.total.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">LKR {order.subtotal.toFixed(2)}</span>
                      </div>
                      {order.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax:</span>
                          <span className="text-gray-900">LKR {order.tax.toFixed(2)}</span>
                        </div>
                      )}
                      {order.shipping > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="text-gray-900">LKR {order.shipping.toFixed(2)}</span>
                        </div>
                      )}
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="text-gray-900">-LKR {order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span className="text-blue-600">LKR {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions & Payment Status */}
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-3 min-w-[220px]">
                    {/* Payment Status Card */}
                    {order.status === 'pending_payment' && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-yellow-900 mb-1 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          Payment Pending
                        </p>
                        <p className="text-xs text-yellow-800">Please upload your bank transfer receipt</p>
                      </div>
                    )}

                    {order.payment.status === 'pending_verification' && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          Under Review
                        </p>
                        <p className="text-xs text-blue-800">Admin is verifying your payment</p>
                      </div>
                    )}

                    {order.payment.status === 'verified' && order.status !== 'ready' && !order.delivery?.pickupCode && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-900 mb-1 flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          Payment Verified ✓
                        </p>
                        <p className="text-xs text-green-800">Your order is being prepared for pickup</p>
                      </div>
                    )}

                    {order.payment.status === 'verified' && order.status === 'ready' && order.delivery?.pickupCode && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-900 mb-1 flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          Ready for Pickup!
                        </p>
                        <p className="text-xs text-green-800 mb-2">Pickup Code: <span className="font-bold text-lg">{order.delivery.pickupCode}</span></p>
                      </div>
                    )}

                    {order.payment.status === 'rejected' && order.payment.billRejectionReason && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1">
                          <XCircleIcon className="w-4 h-4" />
                          Payment Rejected
                        </p>
                        <p className="text-xs text-red-800">{order.payment.billRejectionReason}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {order.delivery.trackingNumber && (
                      <button className="flex items-center justify-center gap-2 px-4 py-2 backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold">
                        <TruckIcon className="h-4 w-4" />
                        Track Package
                      </button>
                    )}
                    
                    {(order.status === 'pending_payment' && !order.payment.billImage) && (
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowUploadModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <DocumentArrowUpIcon className="h-4 w-4" />
                        Upload Bill
                      </button>
                    )}

                    {(order.payment.status === 'pending_verification' || (order.payment.status === 'verified' && order.payment.billImage)) && (
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowBillModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        View Bill
                      </button>
                    )}

                    {order.payment.status === 'rejected' && (
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setBillImage(''); // Clear previous image
                          setShowUploadModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <DocumentArrowUpIcon className="h-4 w-4" />
                        Re-upload Bill
                      </button>
                    )}
                    
                    {/* View Details Button */}
                    <button 
                      onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold"
                    >
                      <EyeIcon className="h-4 w-4" />
                      {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                      {expandedOrderId === order._id ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrderId === order._id && (
                  <div className="mt-6 pt-6 border-t-2 border-blue-100 animate-in fade-in-50 slide-in-from-top-3 duration-300">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      Complete Order Details
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Delivery Information */}
                        <div className="backdrop-blur-xl bg-white/60 rounded-xl p-4 border border-gray-200">
                          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <TruckIcon className="h-5 w-5 text-green-600" />
                            Delivery Information
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-medium text-gray-900">
                                {order.delivery?.method === 'store_pickup' ? 'Store Pickup' : 
                                 order.delivery?.method === 'home_delivery' ? 'Home Delivery' : 
                                 order.delivery?.method === 'express_delivery' ? 'Express Delivery' : 
                                 'Store Pickup'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className="font-medium text-gray-900 capitalize">{order.delivery?.status || 'pending'}</span>
                            </div>
                            {order.status === 'ready' && order.delivery?.pickupCode && (
                              <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                                <span className="text-gray-700 font-medium">Pickup Code:</span>
                                <span className="font-bold text-2xl text-green-700">{order.delivery.pickupCode}</span>
                              </div>
                            )}
                            {order.delivery?.trackingNumber && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tracking #:</span>
                                <span className="font-medium text-blue-600">{order.delivery.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delivery Address (if exists) */}
                        {order.delivery?.address && (
                          <div className="backdrop-blur-xl bg-white/60 rounded-xl p-4 border border-gray-200">
                            <h5 className="font-bold text-gray-900 mb-3">Delivery Address</h5>
                            <div className="text-sm space-y-1">
                              <p className="text-gray-600">{order.delivery.address.street}</p>
                              <p className="text-gray-600">
                                {order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zipCode}
                              </p>
                              <p className="text-gray-600">{order.delivery.address.country}</p>
                              <p className="text-gray-600">📞 {order.delivery.address.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Payment Information */}
                        <div className="backdrop-blur-xl bg-white/60 rounded-xl p-4 border border-gray-200">
                          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCardIcon className="h-5 w-5 text-purple-600" />
                            Payment Information
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-medium text-gray-900 capitalize">
                                {order.payment.method.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium capitalize ${
                                order.payment.status === 'verified' || order.payment.status === 'completed' ? 'text-green-600' :
                                order.payment.status === 'pending_verification' ? 'text-blue-600' :
                                order.payment.status === 'rejected' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {order.payment.status.replace('_', ' ')}
                              </span>
                            </div>
                            {order.payment.billUploadDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Bill Uploaded:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(order.payment.billUploadDate).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {order.payment.billVerifiedDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Verified On:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(order.payment.billVerifiedDate).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {order.payment.adminNotes && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs font-medium text-blue-900 mb-1">Admin Notes:</p>
                                <p className="text-xs text-blue-800">{order.payment.adminNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Notes (if exists) */}
                        {(order.customerNotes || order.internalNotes) && (
                          <div className="backdrop-blur-xl bg-white/60 rounded-xl p-4 border border-gray-200">
                            <h5 className="font-bold text-gray-900 mb-3">Order Notes</h5>
                            {order.customerNotes && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">Customer Notes:</p>
                                <p className="text-sm text-gray-700">{order.customerNotes}</p>
                              </div>
                            )}
                            {order.internalNotes && (
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Internal Notes:</p>
                                <p className="text-sm text-gray-700">{order.internalNotes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Order Timeline */}
                        <div className="backdrop-blur-xl bg-white/60 rounded-xl p-4 border border-gray-200">
                          <h5 className="font-bold text-gray-900 mb-3">Order Timeline</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-gray-600">Order Placed:</span>
                              <span className="font-medium text-gray-900">
                                {new Date(order.orderDate || order.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {order.payment.billUploadDate && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-600">Bill Uploaded:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(order.payment.billUploadDate).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {order.payment.billVerifiedDate && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-600">Payment Verified:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(order.payment.billVerifiedDate).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {order.estimatedDeliveryDate && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600">Expected Delivery:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(order.estimatedDeliveryDate).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {order.actualDeliveryDate && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                <span className="text-gray-600">Delivered On:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(order.actualDeliveryDate).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Bill Modal */}
      {showUploadModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  📤 Upload Payment Bill
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedOrder(null);
                    setBillImage('');
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <XCircleIcon className="h-8 w-8" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-900 mb-1">
                  <span className="font-bold">Order:</span> {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-blue-900">
                  <span className="font-bold">Amount:</span> LKR {selectedOrder.total.toFixed(2)}
                </p>
              </div>

              {!billImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors mb-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="space-y-2">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                        <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">Click to upload bill</p>
                      <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  <div className="border-2 border-green-300 rounded-xl p-4 bg-green-50">
                    <img 
                      src={billImage} 
                      alt="Payment Bill" 
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                    />
                  </div>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Change Image
                    </div>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedOrder(null);
                    setBillImage('');
                  }}
                  className="px-6 py-3 backdrop-blur-xl bg-gray-300/90 hover:bg-gray-400/90 text-gray-800 rounded-xl shadow-lg transition-all"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBillUpload}
                  className="px-6 py-3 backdrop-blur-xl bg-green-500/90 hover:bg-green-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                  disabled={isUploading || !billImage}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Submit for Verification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {showBillModal && selectedOrder && selectedOrder.payment.billImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  📄 Payment Bill - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => {
                    setShowBillModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <XCircleIcon className="h-8 w-8" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Order:</span> {selectedOrder.orderNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span> LKR {selectedOrder.total.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Uploaded:</span> {selectedOrder.payment.billUploadDate ? new Date(selectedOrder.payment.billUploadDate).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> 
                    <span className="ml-2">{getPaymentStatusBadge(selectedOrder.payment.status)}</span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                <img 
                  src={selectedOrder.payment.billImage} 
                  alt="Payment Bill" 
                  className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowBillModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-6 py-3 backdrop-blur-xl bg-gray-300/90 hover:bg-gray-400/90 text-gray-800 rounded-xl shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;

