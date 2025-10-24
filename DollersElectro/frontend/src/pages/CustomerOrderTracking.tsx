import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MapPinIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon
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
}

const CustomerOrderTracking: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const getDeliveryStep = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
      { key: 'confirmed', label: 'Order Confirmed', description: 'Order has been confirmed and is being processed' },
      { key: 'processing', label: 'Preparing to Ship', description: 'Your order is being prepared for shipping' },
      { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
      { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order is out for delivery today' },
      { key: 'delivered', label: 'Delivered', description: 'Your order has been delivered' }
    ];

    const currentIndex = steps.findIndex(step => step.key === status);
    return { steps, currentIndex };
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/profile')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Orders & Tracking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Total Orders: {orders.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Order Placed</option>
              <option value="confirmed">Order Confirmed</option>
              <option value="processing">Preparing to Ship</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.delivery.status)}`}>
                    <span className="mr-1">{getStatusIcon(order.delivery.status)}</span>
                    {order.delivery.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">LKR {item.total.toFixed(2)}</p>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Order Total */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">LKR {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Progress */}
              <div className="px-6 py-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Delivery Progress</h4>
                <div className="space-y-2">
                  {getDeliveryStep(order.delivery.status).steps.map((step, index) => {
                    const isCompleted = index <= getDeliveryStep(order.delivery.status).currentIndex;
                    const isCurrent = index === getDeliveryStep(order.delivery.status).currentIndex;
                    
                    return (
                      <div key={step.key} className={`flex items-center space-x-2 text-sm ${
                        isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                          {isCompleted && <CheckCircleIcon className="w-3 h-3 text-white" />}
                        </div>
                        <span className={isCurrent ? 'font-medium' : ''}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => openOrderModal(order)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View Details & Track
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You haven\'t placed any orders yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details - {selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}</p>
                  <p><span className="font-medium">Order Date:</span> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </p>
                  <p><span className="font-medium">Total:</span> LKR {selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Delivery Information */}
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
                    <p><span className="font-medium">Tracking Number:</span> {selectedOrder.delivery.trackingNumber}</p>
                  )}
                  {selectedOrder.delivery.carrier && (
                    <p><span className="font-medium">Carrier:</span> {selectedOrder.delivery.carrier}</p>
                  )}
                  {selectedOrder.delivery.estimatedDelivery && (
                    <p><span className="font-medium">Estimated Delivery:</span> {selectedOrder.delivery.estimatedDelivery}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <p>{selectedOrder.delivery.address.street}</p>
                    <p>{selectedOrder.delivery.address.city}, {selectedOrder.delivery.address.state} {selectedOrder.delivery.address.zipCode}</p>
                    <p>{selectedOrder.delivery.address.country}</p>
                    <p className="text-gray-500">Phone: {selectedOrder.delivery.address.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                        <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">LKR {item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Total: LKR {item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Timeline */}
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Timeline</h4>
                <div className="relative">
                  {getDeliveryStep(selectedOrder.delivery.status).steps.map((step, index) => {
                    const isCompleted = index <= getDeliveryStep(selectedOrder.delivery.status).currentIndex;
                    const isCurrent = index === getDeliveryStep(selectedOrder.delivery.status).currentIndex;
                    
                    return (
                      <div key={step.key} className="flex items-start space-x-4 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                          {isCompleted && <CheckCircleIcon className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h5 className={`text-sm font-medium ${
                            isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h5>
                          <p className={`text-sm ${
                            isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                          {isCurrent && (
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Current Status
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderTracking;
