import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CubeIcon,
  HomeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  analyticsAPI, 
  analyticsHelpers,
  DashboardStats,
  SalesData
} from '../../services/api/analyticsAPI';

const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | '90days' | '3months' | '6months' | '1year'>('30days');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, salesResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getSalesData(salesPeriod)
      ]);
      
      if (statsResponse.success && salesResponse.success) {
        setStats(statsResponse.data);
        setSalesData(salesResponse.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (error) {

      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [salesPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, timeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-2xl bg-white/80 rounded-3xl p-12 shadow-2xl border-2 border-white/60">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-2xl bg-white/80 rounded-3xl p-12 shadow-2xl border-2 border-white/60">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6">{error || 'No data available'}</p>
          <button
            onClick={fetchDashboardData}
            className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate growth percentages
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Get previous period data for comparison
  const getPreviousPeriodData = () => {
    if (salesData.length < 2) return { revenue: 0, orders: 0, customers: 0 };
    
    const previous = salesData[salesData.length - 2];
    
    return {
      revenue: previous.revenue,
      orders: previous.orders,
      customers: previous.customers
    };
  };

  const previousData = getPreviousPeriodData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
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
              <span className="text-gray-900 font-medium">Analytics Dashboard</span>
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
              <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
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
                    <ChartBarIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">View business metrics, reports, and insights</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Key Metrics Cards - iOS 26 Glassy Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Revenue */}
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 border-2 border-white/60 hover:border-green-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                      {analyticsHelpers.formatCurrency(stats.totalRevenue)}
                </p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className={`h-4 w-4 ${
                        calculateGrowth(stats.totalRevenue, previousData.revenue) >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`} />
                  <span className={`text-sm ml-1 font-semibold ${
                        calculateGrowth(stats.totalRevenue, previousData.revenue) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {calculateGrowth(stats.totalRevenue, previousData.revenue).toFixed(1)}%
                      </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 border-2 border-white/60 hover:border-blue-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className={`h-4 w-4 ${
                        calculateGrowth(stats.totalOrders, previousData.orders) >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`} />
                  <span className={`text-sm ml-1 font-semibold ${
                        calculateGrowth(stats.totalOrders, previousData.orders) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {calculateGrowth(stats.totalOrders, previousData.orders).toFixed(1)}%
                      </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 border-2 border-white/60 hover:border-purple-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                <UsersIcon className="h-6 w-6 text-white" />
                </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className={`h-4 w-4 ${
                        calculateGrowth(stats.totalCustomers, previousData.customers) >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`} />
                  <span className={`text-sm ml-1 font-semibold ${
                        calculateGrowth(stats.totalCustomers, previousData.customers) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {calculateGrowth(stats.totalCustomers, previousData.customers).toFixed(1)}%
                      </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 border-2 border-white/60 hover:border-indigo-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform duration-300">
                <CubeIcon className="h-6 w-6 text-white" />
                </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-gray-500 mt-1">
                      {stats.activeProducts} active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Overview - iOS 26 Glassy Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-green-600">{stats.completedOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="text-sm font-medium text-red-600">{stats.cancelledOrders}</span>
              </div>
            </div>
          </div>

          {/* Sales Period Selector - iOS 26 Glassy Style */}
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Time Period</h3>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem 1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 1 Year</option>
            </select>
          </div>

          {/* Quick Actions - iOS 26 Glassy Style */}
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/products')}
                className="w-full backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold text-sm"
              >
                Manage Products
              </button>
              <button
                onClick={() => navigate('/admin/customers')}
                className="w-full backdrop-blur-2xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 hover:from-purple-600/95 hover:to-purple-700/95 text-white px-5 py-3 rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold text-sm"
              >
                View Customers
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white px-5 py-3 rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold text-sm"
              >
                Manage Orders
              </button>
            </div>
          </div>
        </div>

        {/* Order Status Chart - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Order Status Distribution</h3>
              <span className="text-sm text-gray-600 font-medium">Overview of all order statuses</span>
            </div>
          </div>
          
          {/* Pie Chart */}
          <div className="h-80 flex items-center justify-center px-4">
              {stats.completedOrders > 0 || stats.pendingOrders > 0 || stats.cancelledOrders > 0 ? (
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-4xl mx-auto">
                  {/* Pie Chart Container */}
                  <div className="relative flex-shrink-0">
                    <svg width="320" height="320" viewBox="0 0 320 320" className="drop-shadow-2xl">
                      <defs>
                        <filter id="shadow-green">
                          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.3"/>
                        </filter>
                        <filter id="shadow-yellow">
                          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.3"/>
                        </filter>
                        <filter id="shadow-red">
                          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.3"/>
                        </filter>
                      </defs>
                      <g>
                        {/* Background circle */}
                        <circle cx="160" cy="160" r="130" fill="#f3f4f6" />
                        
                        {/* Pie segments using simple approach */}
                        {(() => {
                          const total = stats.completedOrders + stats.pendingOrders + stats.cancelledOrders;
                          const centerX = 160;
                          const centerY = 160;
                          const radius = 130;
                          
                          // Special case: If 100% is one category, draw a full circle instead of path
                          if (stats.pendingOrders === total) {
                            return (
                              <circle 
                                cx={centerX} 
                                cy={centerY} 
                                r={radius} 
                                fill="#f59e0b" 
                                filter="url(#shadow-yellow)"
                              />
                            );
                          }
                          
                          if (stats.completedOrders === total) {
                            return (
                              <circle 
                                cx={centerX} 
                                cy={centerY} 
                                r={radius} 
                                fill="#10b981" 
                                filter="url(#shadow-green)"
                              />
                            );
                          }
                          
                          if (stats.cancelledOrders === total) {
                            return (
                              <circle 
                                cx={centerX} 
                                cy={centerY} 
                                r={radius} 
                                fill="#ef4444" 
                                filter="url(#shadow-red)"
                              />
                            );
                          }
                          
                          // Calculate angles for mixed segments
                          const completedAngle = (stats.completedOrders / total) * 360;
                          const pendingAngle = (stats.pendingOrders / total) * 360;
                          const cancelledAngle = (stats.cancelledOrders / total) * 360;
                          
                          let currentAngle = 0;
                          const segments = [];
                          
                          // Helper function to create pie slice path
                          const createPieSlice = (startAngle: number, sweepAngle: number, color: string, filter: string) => {
                            const start = (startAngle - 90) * (Math.PI / 180);
                            const end = (startAngle + sweepAngle - 90) * (Math.PI / 180);
                            
                            const x1 = centerX + radius * Math.cos(start);
                            const y1 = centerY + radius * Math.sin(start);
                            const x2 = centerX + radius * Math.cos(end);
                            const y2 = centerY + radius * Math.sin(end);
                            
                            const largeArcFlag = sweepAngle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                fill={color}
                                filter={filter}
                                className="transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                              />
                            );
                          };
                          
                          // Completed - Green
                          if (stats.completedOrders > 0) {
                            segments.push(
                              <g key="completed">
                                {createPieSlice(currentAngle, completedAngle, '#10b981', 'url(#shadow-green)')}
                              </g>
                            );
                            currentAngle += completedAngle;
                          }
                          
                          // Pending - Yellow/Orange
                          if (stats.pendingOrders > 0) {
                            segments.push(
                              <g key="pending">
                                {createPieSlice(currentAngle, pendingAngle, '#f59e0b', 'url(#shadow-yellow)')}
                              </g>
                            );
                            currentAngle += pendingAngle;
                          }
                          
                          // Cancelled - Red
                          if (stats.cancelledOrders > 0) {
                            segments.push(
                              <g key="cancelled">
                                {createPieSlice(currentAngle, cancelledAngle, '#ef4444', 'url(#shadow-red)')}
                              </g>
                            );
                          }
                          
                          return segments;
                        })()}
                        
                        {/* Center white circle - donut effect */}
                        <circle cx="160" cy="160" r="85" fill="white" filter="url(#shadow-green)" />
                      </g>
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-5xl font-bold bg-gradient-to-br from-gray-800 to-gray-900 bg-clip-text text-transparent">
                        {stats.totalOrders}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold mt-1">Total Orders</div>
                    </div>
                  </div>
                  
                  {/* Legend - Better aligned */}
                  <div className="space-y-5 flex-shrink-0">
                    <div className="flex items-center gap-4 group cursor-pointer hover:scale-105 transition-transform duration-300 p-3 rounded-xl hover:bg-green-50">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50 group-hover:shadow-green-500/70 transition-all duration-300 flex-shrink-0"></div>
                      <div>
                        <div className="text-base font-bold text-gray-900">Completed Orders</div>
                        <div className="text-sm text-gray-600 font-medium">
                          {stats.completedOrders} orders 
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer hover:scale-105 transition-transform duration-300 p-3 rounded-xl hover:bg-yellow-50">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50 group-hover:shadow-yellow-500/70 transition-all duration-300 flex-shrink-0"></div>
                      <div>
                        <div className="text-base font-bold text-gray-900">Pending Orders</div>
                        <div className="text-sm text-gray-600 font-medium">
                          {stats.pendingOrders} orders
                          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                            {((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer hover:scale-105 transition-transform duration-300 p-3 rounded-xl hover:bg-red-50">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 group-hover:shadow-red-500/70 transition-all duration-300 flex-shrink-0"></div>
                      <div>
                        <div className="text-base font-bold text-gray-900">Cancelled Orders</div>
                        <div className="text-sm text-gray-600 font-medium">
                          {stats.cancelledOrders} orders
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            {((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-4">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Order Data</h3>
                  <p className="text-gray-600">Order distribution will appear here once orders are placed</p>
                </div>
              )}
          </div>
        </div>

        {/* Top Products and Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products by Revenue</h3>
            <div className="space-y-3">
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {analyticsHelpers.formatCurrency(product.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers by Spending</h3>
            <div className="space-y-3">
              {stats.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {analyticsHelpers.formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500">{customer.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.map((order) => {
                  const statusColors = analyticsHelpers.getStatusColor(order.status);
                  const paymentColors = analyticsHelpers.getPaymentStatusColor(order.paymentStatus);
                  
                  return (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId.slice(-8)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {analyticsHelpers.formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentColors.bg} ${paymentColors.text}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {analyticsHelpers.formatDate(order.orderDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
