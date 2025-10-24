import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | string;
  status: 'pending_payment' | 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
  orderDate: string;
  deliveryDate?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  payment: {
    method: string;
    status: 'pending' | 'pending_verification' | 'verified' | 'rejected' | 'completed' | 'failed' | 'refunded';
    billImage?: string;
    billUploadDate?: string;
    billRejectionReason?: string;
    adminNotes?: string;
  };
  delivery?: {
    method: string;
    pickupCode?: string;
  };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

interface OrderItem {
  product: string;
  productName?: string;
  quantity: number;
  price: number;
}

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch orders and pending verifications from API
  useEffect(() => {
    fetchOrders();
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/orders/pending-verification', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingVerifications(data.data?.orders || []);
      } else {
        console.error('Failed to fetch pending verifications:', response.statusText);
        setPendingVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      setPendingVerifications([]);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // Admin endpoint to get ALL orders (not just customer's orders)
      const response = await fetch('/api/orders/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin orders fetched:', data);
        // Backend returns: { success: true, data: { orders: [...] } }
        setOrders(data.data?.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.statusText);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show success message based on status
        if (newStatus === 'processing') {
          alert('✅ Order marked as Processing!');
        } else if (newStatus === 'ready') {
          alert('✅ Order marked as Ready for Pickup!\n📱 Customer has been notified with pickup code.');
        } else {
          alert(`✅ Order status updated to ${newStatus}`);
        }
        
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus as any } : order
        ));
        
        // Refresh orders to get latest data
        fetchOrders();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        alert('❌ Failed to update status: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update order status');
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/orders/${selectedOrder._id}/verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Payment verified! Pickup Code: ${data.data.pickupCode}`);
        setShowVerifyModal(false);
        setAdminNotes('');
        setSelectedOrder(null);
        // Refresh both lists
        fetchOrders();
        fetchPendingVerifications();
      } else {
        alert('❌ Failed to verify payment: ' + data.message);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('❌ Failed to verify payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      alert('⚠️ Please provide a rejection reason');
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/orders/${selectedOrder._id}/reject-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason, adminNotes })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Payment rejected. Customer will be notified.');
        setShowRejectModal(false);
        setRejectionReason('');
        setAdminNotes('');
        setSelectedOrder(null);
        // Refresh both lists
        fetchOrders();
        fetchPendingVerifications();
      } else {
        alert('❌ Failed to reject payment: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('❌ Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    // Handle customer being null, string, or object
    const customerName = !order.customer 
      ? 'Unknown Customer'
      : typeof order.customer === 'string' 
      ? order.customer 
      : `${order.customer.firstName} ${order.customer.lastName}`;
    
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer && typeof order.customer === 'object' && order.customer.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-2xl bg-white/80 rounded-3xl p-12 shadow-2xl border-2 border-white/60">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <div className="py-4 border-b border-white/40">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Admin Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Order Management</span>
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
              <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
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
                    <ClipboardDocumentListIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Order Management
                  </h1>
                  <p className="text-gray-600 mt-1">Manage and track customer orders</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Payment Verifications Section */}
        {pendingVerifications.length > 0 && (
          <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-50/90 to-orange-50/90 rounded-2xl shadow-xl border-2 border-yellow-300/60 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-900 flex items-center">
                <svg className="w-6 h-6 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                ⚠️ Pending Payment Verifications ({pendingVerifications.length})
              </h2>
            </div>

            <div className="space-y-3">
              {pendingVerifications.map((order) => {
                const customerName = !order.customer 
                  ? 'Unknown Customer'
                  : typeof order.customer === 'string' 
                  ? order.customer 
                  : `${order.customer.firstName} ${order.customer.lastName}`;
                
                return (
                  <div key={order._id} className="backdrop-blur-xl bg-white/80 rounded-xl border-2 border-yellow-200 p-4 hover:bg-white/90 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-blue-600 text-lg">{order.orderNumber}</span>
                          <span className="text-sm text-gray-600">|</span>
                          <span className="font-medium text-gray-900">{customerName}</span>
                          <span className="text-sm text-gray-600">|</span>
                          <span className="font-bold text-lg">Rs. {order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📅 Uploaded: {order.payment.billUploadDate ? new Date(order.payment.billUploadDate).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.payment.billImage && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowBillModal(true);
                            }}
                            className="px-4 py-2 backdrop-blur-xl bg-blue-500/90 hover:bg-blue-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Bill
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowVerifyModal(true);
                          }}
                          className="px-4 py-2 backdrop-blur-xl bg-green-500/90 hover:bg-green-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRejectModal(true);
                          }}
                          className="px-4 py-2 backdrop-blur-xl bg-red-500/90 hover:bg-red-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by order number, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer font-medium"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5rem 1.5rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer font-medium"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5rem 1.5rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchOrders}
                className="w-full backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white px-5 py-3 rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold text-sm"
              >
                🔄 Refresh Orders
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/40/50 bg-gradient-to-r from-white/50 to-white/30">
            <h3 className="text-lg font-bold text-gray-900">
              Orders ({filteredOrders.length})
            </h3>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Orders will appear here when customers place them'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const customerName = !order.customer 
                      ? 'Unknown Customer'
                      : typeof order.customer === 'string' 
                      ? order.customer 
                      : `${order.customer.firstName} ${order.customer.lastName}`;
                    
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customerName}</div>
                          <div className="text-sm text-gray-500">
                            {order.customer && typeof order.customer === 'object' ? order.customer.email : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs. {order.total.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Order Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {/* Direct status update button removed - Admin must use proper pickup verification flow */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal - Apple iOS 26 Glassy Style */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📋 Order Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 transition-all duration-300 hover:scale-110"
                >
                  <XCircleIcon className="h-7 w-7" />
                </button>
              </div>
              
              {/* Order Number Badge */}
              <div className="mb-6 backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border-2 border-blue-300/60">
                <p className="text-center">
                  <span className="text-sm font-medium text-gray-700">Order Number:</span>
                  <span className="ml-3 text-xl font-bold text-blue-600">{selectedOrder.orderNumber}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information Card */}
                <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-6 border-2 border-white/60 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Order Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Priority:</span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(selectedOrder.priority)}`}>
                        {selectedOrder.priority || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 backdrop-blur-xl bg-green-50/80 rounded-xl border border-green-200/60 px-4">
                      <span className="text-sm font-bold text-gray-700">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">Rs. {selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Order Date:</span>
                      <span className="text-sm font-semibold text-gray-900">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                    </div>
                    {selectedOrder.deliveryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Delivery Date:</span>
                        <span className="text-sm font-semibold text-gray-900">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {/* Items to Pack - Prominent Display */}
                    <div className="mt-4 pt-4 border-t-2 border-blue-200/60">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-900">Items to Pack:</span>
                      </div>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => {
                          // Get product name from different possible sources
                          const productName = item.productName || 
                                            (typeof item.product === 'object' && item.product ? (item.product as any).name : null) || 
                                            (typeof item.product === 'string' ? `Product ID: ${item.product}` : 'Unknown Product');
                          
                          return (
                            <div key={index} className="backdrop-blur-xl bg-orange-50/60 rounded-lg p-3 border border-orange-200/60">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 text-sm">
                                    {productName}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Rs. {item.price.toFixed(2)} each
                                  </p>
                                </div>
                                <div className="text-right ml-3">
                                  <span className="inline-block px-3 py-1 bg-orange-500 text-white font-bold text-sm rounded-full">
                                    ×{item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information Card */}
                <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-6 border-2 border-white/60 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    {typeof selectedOrder.customer === 'string' ? (
                      <p className="text-sm"><span className="font-medium text-gray-600">Customer ID:</span> <span className="text-gray-900 font-semibold">{selectedOrder.customer}</span></p>
                    ) : selectedOrder.customer ? (
                      <>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">Full Name</span>
                          <p className="text-base font-bold text-gray-900 mt-1">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200/60">
                          <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                          <p className="text-sm text-gray-900 font-medium mt-1">{selectedOrder.customer.email}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-200/60">
                          <span className="text-xs font-medium text-gray-500 uppercase">Phone</span>
                          <p className="text-sm text-gray-900 font-medium mt-1">{selectedOrder.customer.phone || 'N/A'}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Customer information unavailable</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mt-6 p-6 backdrop-blur-xl bg-gradient-to-br from-blue-50/90 to-purple-50/90 rounded-2xl border-2 border-blue-200/60 shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Payment Method:</span>
                    <span className="ml-2 text-gray-900 capitalize">{selectedOrder.payment.method.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Payment Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${
                      selectedOrder.payment.status === 'verified' || selectedOrder.payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedOrder.payment.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.payment.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {selectedOrder.payment.billUploadDate && (
                    <div>
                      <span className="font-medium text-gray-700">Bill Uploaded:</span>
                      <span className="ml-2 text-gray-900">{new Date(selectedOrder.payment.billUploadDate).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {selectedOrder.delivery?.pickupCode && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Pickup Code:</span>
                      <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 font-bold text-lg rounded-lg border-2 border-green-300">
                        {selectedOrder.delivery.pickupCode}
                      </span>
                    </div>
                  )}
                  
                  {selectedOrder.payment.adminNotes && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Admin Notes:</span>
                      <p className="mt-1 text-gray-900 bg-white/60 p-2 rounded-lg">{selectedOrder.payment.adminNotes}</p>
                    </div>
                  )}
                  
                  {/* View Bill Button */}
                  {selectedOrder.payment.billImage && (
                    <div className="md:col-span-2">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setShowBillModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Uploaded Payment Bill
                      </button>
                    </div>
                  )}
                  
                  {!selectedOrder.payment.billImage && selectedOrder.payment.status === 'pending' && (
                    <div className="md:col-span-2">
                      <p className="text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                        ⏳ Customer has not uploaded payment bill yet
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6 backdrop-blur-xl bg-white/60 rounded-2xl p-6 border-2 border-white/60 shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b-2 border-blue-200/60">
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {selectedOrder.items.map((item, index) => {
                        // Get product name from different possible sources
                        const productName = item.productName || 
                                          (typeof item.product === 'object' && item.product ? (item.product as any).name : null) || 
                                          (typeof item.product === 'string' ? `Product ID: ${item.product}` : 'Unknown Product');
                        
                        return (
                          <tr key={index} className="hover:bg-blue-50/30 transition-colors duration-200">
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-900">
                              {productName}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-700">
                              <span className="px-3 py-1 bg-blue-100/80 text-blue-700 rounded-full">
                                ×{item.quantity}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-700">
                              Rs. {item.price.toFixed(2)}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-bold text-green-600">
                              Rs. {(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions - Logic-Based Flow */}
              <div className="mt-8">
                {/* Payment Rejected - No Actions */}
                {selectedOrder.payment.status === 'rejected' && (
                  <div className="backdrop-blur-xl bg-red-50/80 rounded-2xl p-4 border-2 border-red-300/60 mb-4">
                    <p className="text-red-700 font-bold text-center">
                      ❌ Payment Rejected - Order cannot proceed
                    </p>
                    {selectedOrder.payment.billRejectionReason && (
                      <p className="text-red-600 text-sm text-center mt-2">
                        Reason: {selectedOrder.payment.billRejectionReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Not Verified - Show Warning */}
                {(selectedOrder.payment.status === 'pending' || selectedOrder.payment.status === 'pending_verification') && (
                  <div className="backdrop-blur-xl bg-yellow-50/80 rounded-2xl p-4 border-2 border-yellow-300/60 mb-4">
                    <p className="text-yellow-700 font-bold text-center">
                      ⏳ Payment must be verified before order can proceed
                    </p>
                    <p className="text-yellow-600 text-sm text-center mt-2">
                      Please verify the payment in "Pending Payment Verifications" section first
                    </p>
                  </div>
                )}

                {/* Order Completed */}
                {selectedOrder.status === 'completed' && (
                  <div className="backdrop-blur-xl bg-green-50/80 rounded-2xl p-4 border-2 border-green-300/60 mb-4">
                    <p className="text-green-700 font-bold text-center">
                      ✅ Order Completed - Customer has picked up the order
                    </p>
                  </div>
                )}

                {/* Pickup Ready - Show Pickup Code */}
                {selectedOrder.status === 'ready' && selectedOrder.delivery?.pickupCode && (
                  <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/90 to-blue-50/90 rounded-2xl p-6 border-2 border-green-300/60 mb-4">
                    <div className="text-center">
                      <p className="text-green-700 font-bold text-lg mb-3">
                        🎉 Order Ready for Pickup!
                      </p>
                      <div className="backdrop-blur-xl bg-white/80 rounded-xl p-4 border-2 border-green-400 mb-4">
                        <p className="text-sm text-gray-600 mb-2">Pickup Code:</p>
                        <p className="text-4xl font-bold text-green-600">{selectedOrder.delivery.pickupCode}</p>
                      </div>
                      <p className="text-sm text-gray-700">
                        📱 Customer has been notified with pickup code
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-end gap-3">
                  {/* Close Button - Always Show */}
                <button
                  onClick={() => setShowModal(false)}
                    className="px-6 py-3 backdrop-blur-xl bg-white/70 hover:bg-white/90 text-gray-700 font-bold rounded-2xl border-2 border-gray-300/60 hover:border-gray-400/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Close
                </button>

                  {/* Mark as Processing - Only if payment verified and status is confirmed/pending_payment */}
                  {selectedOrder.payment.status === 'verified' && 
                   (selectedOrder.status === 'confirmed' || selectedOrder.status === 'pending_payment' || selectedOrder.status === 'pending') && (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder._id, 'processing')}
                      className="px-6 py-3 backdrop-blur-xl bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white font-bold rounded-2xl border-2 border-white/30 hover:border-white/50 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                      📦 Mark as Processing
                </button>
                  )}

                  {/* Mark as Ready for Pickup - Only if status is processing */}
                  {selectedOrder.status === 'processing' && (
                <button
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'ready')}
                      className="px-6 py-3 backdrop-blur-xl bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white font-bold rounded-2xl border-2 border-white/30 hover:border-white/50 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
                >
                      ✅ Mark as Ready for Pickup
                </button>
                  )}

                  {/* Go to Pickup Verification - Only if status is ready */}
                  {selectedOrder.status === 'ready' && selectedOrder.delivery?.pickupCode && (
                    <button
                      onClick={() => {
                        setShowModal(false);
                        window.location.href = '/admin/pickup-verification';
                      }}
                      className="px-6 py-3 backdrop-blur-xl bg-gradient-to-r from-purple-500/90 to-purple-600/90 hover:from-purple-600/95 hover:to-purple-700/95 text-white font-bold rounded-2xl border-2 border-white/30 hover:border-white/50 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                    >
                      📍 Go to Pickup Verification
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Image Modal */}
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
                    <span className="font-semibold">Customer:</span> {typeof selectedOrder.customer === 'string' ? selectedOrder.customer : `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`}
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span> Rs. {selectedOrder.total.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Uploaded:</span> {selectedOrder.payment.billUploadDate ? new Date(selectedOrder.payment.billUploadDate).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> 
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {selectedOrder.payment.status}
                    </span>
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

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBillModal(false);
                    setShowRejectModal(true);
                  }}
                  className="px-6 py-3 backdrop-blur-xl bg-red-500/90 hover:bg-red-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Reject Payment
                </button>
                <button
                  onClick={() => {
                    setShowBillModal(false);
                    setShowVerifyModal(true);
                  }}
                  className="px-6 py-3 backdrop-blur-xl bg-green-500/90 hover:bg-green-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Verify Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Payment Modal */}
      {showVerifyModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-green-900 flex items-center">
                  <CheckCircleIcon className="w-8 h-8 mr-2" />
                  ✅ Verify Payment
                </h3>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedOrder(null);
                    setAdminNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <XCircleIcon className="h-8 w-8" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-900 mb-2">
                  <span className="font-bold">Order:</span> {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-green-900 mb-2">
                  <span className="font-bold">Customer:</span> {typeof selectedOrder.customer === 'string' ? selectedOrder.customer : `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`}
                </p>
                <p className="text-sm text-green-900">
                  <span className="font-bold">Amount:</span> Rs. {selectedOrder.total.toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Add any notes about this payment verification..."
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ What happens after verification:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>A <strong>4-digit pickup code</strong> will be generated</li>
                  <li>Order status will change to <strong>"Confirmed"</strong></li>
                  <li>Customer will receive notification with pickup code</li>
                  <li>Customer can pick up the order from store</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedOrder(null);
                    setAdminNotes('');
                  }}
                  className="px-6 py-3 backdrop-blur-xl bg-gray-300/90 hover:bg-gray-400/90 text-gray-800 rounded-xl shadow-lg transition-all"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPayment}
                  className="px-6 py-3 backdrop-blur-xl bg-green-500/90 hover:bg-green-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Confirm Verification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-red-900 flex items-center">
                  <XCircleIcon className="w-8 h-8 mr-2" />
                  ❌ Reject Payment
                </h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedOrder(null);
                    setRejectionReason('');
                    setAdminNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <XCircleIcon className="h-8 w-8" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <p className="text-sm text-red-900 mb-2">
                  <span className="font-bold">Order:</span> {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-red-900 mb-2">
                  <span className="font-bold">Customer:</span> {typeof selectedOrder.customer === 'string' ? selectedOrder.customer : `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`}
                </p>
                <p className="text-sm text-red-900">
                  <span className="font-bold">Amount:</span> Rs. {selectedOrder.total.toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Why are you rejecting this payment? (Customer will see this message)"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Notes (Optional - Internal Only)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Internal notes (customer won't see this)..."
                />
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-900 font-semibold mb-2">⚠️ What happens after rejection:</p>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Order status will change back to <strong>"Pending Payment"</strong></li>
                  <li>Customer will be notified with rejection reason</li>
                  <li>Customer can upload a new/clearer payment bill</li>
                  <li>You'll see the order again in pending verifications after re-upload</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedOrder(null);
                    setRejectionReason('');
                    setAdminNotes('');
                  }}
                  className="px-6 py-3 backdrop-blur-xl bg-gray-300/90 hover:bg-gray-400/90 text-gray-800 rounded-xl shadow-lg transition-all"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectPayment}
                  className="px-6 py-3 backdrop-blur-xl bg-red-500/90 hover:bg-red-600/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
                  disabled={isProcessing || !rejectionReason.trim()}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-5 h-5" />
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
