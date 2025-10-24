import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    sku: string;
    image: string;
  };
  quantity: number;
  price: number;
  total: number;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  delivery: {
    method: string;
    status: string;
    address: DeliveryAddress;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    deliveryNotes?: string;
  };
  orderDate: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  customerNotes?: string;
  internalNotes?: string;
}

const EmployeeDeliveryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');

  const [updateForm, setUpdateForm] = useState({
    deliveryStatus: '',
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    deliveryNotes: '',
    internalNotes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          customer: {
            _id: 'cust1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890'
          },
          items: [
            {
              product: {
                _id: 'prod1',
                name: 'Smartphone',
                sku: 'SMART-001',
                image: 'https://via.placeholder.com/50'
              },
              quantity: 1,
              price: 599.99,
              total: 599.99
            }
          ],
          total: 599.99,
          status: 'confirmed',
          delivery: {
            method: 'home_delivery',
            status: 'processing',
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA',
              phone: '+1234567890'
            },
            estimatedDelivery: '2024-01-15'
          },
          orderDate: '2024-01-10',
          estimatedDeliveryDate: '2024-01-15'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {

      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDelivery = async () => {
    if (!selectedOrder) return;

    try {
      const updatedOrders = orders.map(order => 
        order._id === selectedOrder._id 
          ? { 
              ...order, 
              delivery: { 
                ...order.delivery, 
                status: updateForm.deliveryStatus,
                trackingNumber: updateForm.trackingNumber,
                carrier: updateForm.carrier,
                estimatedDelivery: updateForm.estimatedDelivery,
                deliveryNotes: updateForm.deliveryNotes
              },
              internalNotes: updateForm.internalNotes
            }
          : order
      );
      
      setOrders(updatedOrders);
      toast.success('Delivery status updated successfully');
      setShowUpdateModal(false);
      setSelectedOrder(null);
      resetUpdateForm();
    } catch (error) {

      toast.error('Failed to update delivery status');
    }
  };

  const resetUpdateForm = () => {
    setUpdateForm({
      deliveryStatus: '',
      trackingNumber: '',
      carrier: '',
      estimatedDelivery: '',
      deliveryNotes: '',
      internalNotes: ''
    });
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateForm({
      deliveryStatus: order.delivery.status,
      trackingNumber: order.delivery.trackingNumber || '',
      carrier: order.delivery.carrier || '',
      estimatedDelivery: order.delivery.estimatedDelivery || '',
      deliveryNotes: order.delivery.deliveryNotes || '',
      internalNotes: order.internalNotes || ''
    });
    setShowUpdateModal(true);
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-5 w-5" />;
      case 'confirmed': return <CheckCircleIcon className="h-5 w-5" />;
      case 'processing': return <TruckIcon className="h-5 w-5" />;
      case 'shipped': return <TruckIcon className="h-5 w-5" />;
      case 'out_for_delivery': return <TruckIcon className="h-5 w-5" />;
      case 'delivered': return <CheckCircleIcon className="h-5 w-5" />;
      case 'failed': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'returned': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    // Safe customer name extraction
    let customerName = '';
    let customerEmail = '';
    
    if (order.customer) {
      if (typeof order.customer === 'string') {
        customerName = order.customer;
      } else {
        customerName = `${(order.customer as any).firstName || ''} ${(order.customer as any).lastName || ''}`.trim();
        customerEmail = (order.customer as any).email || '';
      }
    }
    
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDelivery = deliveryFilter === 'all' || order.delivery?.status === deliveryFilter;
    
    return matchesSearch && matchesStatus && matchesDelivery;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-t-4 border-orange-600 mx-auto shadow-xl"></div>
          <p className="mt-6 text-gray-800 font-bold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <div className="py-4 border-b border-white/40">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/employee')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Employee Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Delivery Management</span>
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
              <h1 className="text-xl font-bold text-gray-900">Delivery Management</h1>
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
                    <TruckIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Delivery Management
                  </h1>
                  <p className="text-gray-600 mt-1">Manage and track order deliveries and shipping</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Total Orders: {orders.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters and Search - iOS 26 Glassy */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Delivery Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Orders Table - iOS 26 Glassy */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/40">
            <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Orders ({filteredOrders.length})
            </h3>
          </div>
          
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
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer ? 
                          (typeof order.customer === 'string' ? 
                            order.customer : 
                            `${(order.customer as any).firstName || ''} ${(order.customer as any).lastName || ''}`.trim() || 'Unknown Customer'
                          ) : 'Unknown Customer'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer && typeof order.customer !== 'string' ? 
                          (order.customer as any).email || 'N/A' : 
                          'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item(s)
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items[0]?.product.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.delivery.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.delivery.status)}</span>
                        {order.delivery.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openUpdateModal(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Update Delivery"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || deliveryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No orders available at the moment'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                Order Details - {selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  {selectedOrder.customer ? (
                    typeof selectedOrder.customer === 'string' ? (
                      <p><span className="font-medium">Customer ID:</span> {selectedOrder.customer}</p>
                    ) : (
                      <>
                        <p><span className="font-medium">Name:</span> {(selectedOrder.customer as any).firstName || ''} {(selectedOrder.customer as any).lastName || ''}</p>
                        <p><span className="font-medium">Email:</span> {(selectedOrder.customer as any).email || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {(selectedOrder.customer as any).phone || 'N/A'}</p>
                      </>
                    )
                  ) : (
                    <p><span className="font-medium">Customer information not available</span></p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Method:</span> {selectedOrder.delivery.method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.delivery.status)}`}>
                      {selectedOrder.delivery.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </p>
                  {selectedOrder.delivery.trackingNumber && (
                    <p><span className="font-medium">Tracking:</span> {selectedOrder.delivery.trackingNumber}</p>
                  )}
                  {selectedOrder.delivery.carrier && (
                    <p><span className="font-medium">Carrier:</span> {selectedOrder.delivery.carrier}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
                <div className="text-sm">
                  <p>{selectedOrder.delivery.address.street}</p>
                  <p>{selectedOrder.delivery.address.city}, {selectedOrder.delivery.address.state} {selectedOrder.delivery.address.zipCode}</p>
                  <p>{selectedOrder.delivery.address.country}</p>
                  <p>Phone: {selectedOrder.delivery.address.phone}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.product?.image || '/placeholder-image.jpg'} 
                        alt={item.product?.name || 'Product'} 
                        className="w-16 h-16 object-cover rounded" 
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h5>
                        <p className="text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${item.price?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-500">Total: ${item.total?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Delivery Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                Update Delivery Status - {selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateDelivery(); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Status</label>
                  <select
                    required
                    value={updateForm.deliveryStatus}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, deliveryStatus: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carrier</label>
                  <input
                    type="text"
                    value={updateForm.carrier}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, carrier: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., FedEx, UPS, DHL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                  <input
                    type="text"
                    value={updateForm.trackingNumber}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Delivery</label>
                  <input
                    type="date"
                    value={updateForm.estimatedDelivery}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Notes</label>
                <textarea
                  rows={3}
                  value={updateForm.deliveryNotes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                  className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special delivery instructions or notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Internal Notes</label>
                <textarea
                  rows={3}
                  value={updateForm.internalNotes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                  className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Internal notes for staff only"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDeliveryManagement;
