import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  orderDate: string;
  deliveryDate?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

const EmployeeOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      orderNumber: 'ORD-001',
      status: 'pending',
      total: 299.99,
      priority: 'high',
      items: [
        { id: '1', productName: 'Smart LED Bulb', quantity: 2, price: 149.99 }
      ],
      orderDate: '2024-01-15',
      notes: 'Customer requested express delivery'
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      orderNumber: 'ORD-002',
      status: 'processing',
      total: 199.99,
      priority: 'medium',
      items: [
        { id: '2', productName: 'Wireless Switch', quantity: 1, price: 199.99 }
      ],
      orderDate: '2024-01-14'
    },
    {
      id: '3',
      customerName: 'Bob Wilson',
      customerEmail: 'bob@example.com',
      orderNumber: 'ORD-003',
      status: 'shipped',
      total: 449.98,
      priority: 'low',
      items: [
        { id: '3', productName: 'Smart Thermostat', quantity: 1, price: 249.99 },
        { id: '4', productName: 'Motion Sensor', quantity: 1, price: 199.99 }
      ],
      orderDate: '2024-01-13',
      deliveryDate: '2024-01-16'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
                <span className="text-sm text-gray-500">Welcome, Employee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards - iOS 26 Glassy Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 border-2 border-white/60 hover:border-blue-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 border-2 border-white/60 hover:border-green-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 border-2 border-white/60 hover:border-blue-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform duration-300">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}</p>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 border-2 border-white/60 hover:border-purple-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/80 shadow-2xl rounded-3xl border-2 border-white/60 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl bg-gradient-to-r from-gray-50/80 to-white/60 border-b border-white/60">
            <h3 className="text-xl font-bold text-gray-900">📋 Order Management</h3>
          </div>
          
          {/* Search and Filters */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders by customer name or order number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 sm:pl-10 pr-3 py-2 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base backdrop-blur-xl bg-white/70 border-2 border-white/60 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl focus:ring-2 transition-all duration-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base backdrop-blur-xl bg-white/70 border-2 border-white/60 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl focus:ring-2 transition-all duration-300"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'No orders match your current filters.' 
                            : 'No orders available at the moment.'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{order.items.length} items</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                          {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {/* View order details */}}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors duration-150"
                              title="Start Processing"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors duration-150"
                              title="Mark as Shipped"
                            >
                              <TruckIcon className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors duration-150"
                              title="Mark as Delivered"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                              title="Cancel Order"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeOrdersPage;
