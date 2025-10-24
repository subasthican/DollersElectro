import api from './api';

// Analytics interfaces
export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductAnalytics {
  productId: string;
  name: string;
  category: string;
  totalSold: number;
  revenue: number;
  stockLevel: number;
  isActive: boolean;
}

export interface CustomerAnalytics {
  customerId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  isActive: boolean;
}

export interface OrderAnalytics {
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  paymentStatus: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyRevenue: SalesData[];
  topProducts: ProductAnalytics[];
  topCustomers: CustomerAnalytics[];
  recentOrders: OrderAnalytics[];
}

// Analytics API functions
export const analyticsAPI = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const response = await api.get('/admin/analytics/dashboard');
    return response.data;
  },

  // Get sales data for charts
  getSalesData: async (period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<{ success: boolean; data: SalesData[] }> => {
    const response = await api.get(`/admin/analytics/sales?period=${period}`);
    return response.data;
  },

  // Get product analytics
  getProductAnalytics: async (): Promise<{ success: boolean; data: ProductAnalytics[] }> => {
    const response = await api.get('/admin/analytics/products');
    return response.data;
  },

  // Get customer analytics
  getCustomerAnalytics: async (): Promise<{ success: boolean; data: CustomerAnalytics[] }> => {
    const response = await api.get('/admin/analytics/customers');
    return response.data;
  },

  // Get order analytics
  getOrderAnalytics: async (): Promise<{ success: boolean; data: OrderAnalytics[] }> => {
    const response = await api.get('/admin/analytics/orders');
    return response.data;
  },

  // Get revenue by category
  getRevenueByCategory: async (): Promise<{ success: boolean; data: { category: string; revenue: number; count: number }[] }> => {
    const response = await api.get('/admin/analytics/revenue-by-category');
    return response.data;
  },

  // Get customer growth
  getCustomerGrowth: async (period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<{ success: boolean; data: { period: string; newCustomers: number; totalCustomers: number }[] }> => {
    const response = await api.get(`/admin/analytics/customer-growth?period=${period}`);
    return response.data;
  }
};

// Helper functions for analytics
export const analyticsHelpers = {
  // Format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  },

  // Format percentage
  formatPercentage: (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  },

  // Get status color
  getStatusColor: (status: string): { bg: string; text: string } => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  },

  // Get payment status color
  getPaymentStatusColor: (status: string): { bg: string; text: string } => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'refunded':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  },

  // Calculate growth percentage
  calculateGrowth: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Format date
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format date for charts
  formatChartDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
};

