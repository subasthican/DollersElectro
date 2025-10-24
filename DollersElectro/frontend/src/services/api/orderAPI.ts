import api from './api';

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  total: number;
  productSnapshot: {
    name: string;
    sku: string;
    image: string;
  };
}

export interface DeliveryInfo {
  method: 'home_delivery' | 'store_pickup' | 'express_delivery';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  deliveryNotes?: string;
  pickupCode?: string;
  qrCode?: string;
}

export interface PaymentInfo {
  method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled' | 'pending_verification' | 'verified' | 'rejected';
  transactionId?: string;
  paymentDate?: string;
  gateway?: string;
  amount: number;
  billImage?: string;
  billUploadDate?: string;
  billVerifiedDate?: string;
  billVerifiedBy?: string;
  billRejectionReason?: string;
  adminNotes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  payment: PaymentInfo;
  delivery: DeliveryInfo;
  status: 'pending_payment' | 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  orderDate: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  customerNotes?: string;
  internalNotes?: string;
  source: 'website' | 'mobile_app' | 'phone' | 'in_store';
  salesperson?: string;
  customerType: 'new' | 'returning' | 'vip';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  cartItems: Array<{
    product: string;
    quantity: number;
  }>;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery' | 'bank_transfer';
  deliveryMethod: 'home_delivery' | 'store_pickup' | 'express_delivery';
}

export interface OrderResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SingleOrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Order API functions
export const orderAPI = {
  // Create new order (Customer only)
  createOrder: async (orderData: CreateOrderData): Promise<SingleOrderResponse> => {
    const response = await api.post('/orders/checkout', orderData);
    return response.data;
  },

  // Get customer orders (Customer only)
  getCustomerOrders: async (filters: OrderFilters = {}): Promise<OrderResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Get single order details
  getOrder: async (id: string): Promise<SingleOrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Employee/Admin only)
  updateOrderStatus: async (id: string, status: string, notes?: string): Promise<SingleOrderResponse> => {
    const response = await api.patch(`/orders/${id}/status`, { status, notes });
    return response.data;
  },

  // Update payment status (Employee/Admin only)
  updatePaymentStatus: async (id: string, status: string, transactionId?: string): Promise<SingleOrderResponse> => {
    const response = await api.patch(`/orders/${id}/payment`, { status, transactionId });
    return response.data;
  },

  // Update delivery status (Employee/Admin only)
  updateDeliveryStatus: async (id: string, status: string, trackingNumber?: string, carrier?: string): Promise<SingleOrderResponse> => {
    const response = await api.patch(`/orders/${id}/delivery`, { status, trackingNumber, carrier });
    return response.data;
  },

  // Get all orders for admin (Admin only)
  getAdminOrders: async (filters: OrderFilters = {}): Promise<OrderResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/orders/admin/all?${params.toString()}`);
    return response.data;
  },

  // Get pending orders for employee (Employee only)
  getEmployeePendingOrders: async (page: number = 1, limit: number = 20): Promise<OrderResponse> => {
    const response = await api.get(`/orders/employee/pending?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get delivery orders for employee (Employee only)
  getEmployeeDeliveryOrders: async (page: number = 1, limit: number = 20): Promise<OrderResponse> => {
    const response = await api.get(`/orders/employee/delivery?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string): Promise<SingleOrderResponse> => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Track order by order number (Public)
  trackOrder: async (orderNumber: string): Promise<SingleOrderResponse> => {
    const response = await api.get(`/orders/tracking/${orderNumber}`);
    return response.data;
  }
};

// Helper functions for common operations
export const orderHelpers = {
  // Calculate order summary
  getOrderSummary: (order: Order) => {
    return {
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      totalItems: order.items.length,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total
    };
  },

  // Get order age in days
  getOrderAge: (order: Order): number => {
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check if order can be cancelled
  canCancel: (order: Order): boolean => {
    return ['pending', 'confirmed', 'processing'].includes(order.status);
  },

  // Check if order is delivered
  isDelivered: (order: Order): boolean => {
    return order.status === 'delivered';
  },

  // Check if order is cancelled
  isCancelled: (order: Order): boolean => {
    return order.status === 'cancelled';
  },

  // Get order status color for UI
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  // Get payment status color for UI
  getPaymentStatusColor: (status: string): string => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  // Get delivery status color for UI
  getDeliveryStatusColor: (status: string): string => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'out_for_delivery': return 'text-blue-600 bg-orange-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'returned': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  // Format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  },

  // Get delivery method display name
  getDeliveryMethodName: (method: string): string => {
    switch (method) {
      case 'home_delivery': return 'Home Delivery';
      case 'store_pickup': return 'Store Pickup';
      case 'express_delivery': return 'Express Delivery';
      default: return method;
    }
  },

  // Get payment method display name
  getPaymentMethodName: (method: string): string => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      case 'cash_on_delivery': return 'Cash on Delivery';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  },

  // Check if order needs attention (for employees)
  needsAttention: (order: Order): boolean => {
    return (
      order.status === 'pending' ||
      (order.status === 'confirmed' && order.payment.status === 'completed') ||
      order.delivery.status === 'confirmed'
    );
  },

  // Get estimated delivery date
  getEstimatedDelivery: (order: Order): string | null => {
    if (order.estimatedDeliveryDate) {
      return new Date(order.estimatedDeliveryDate).toLocaleDateString();
    }
    
    // Calculate estimated delivery based on order date and delivery method
    const orderDate = new Date(order.orderDate);
    let estimatedDays = 3; // Default 3 days
    
    if (order.delivery.method === 'express_delivery') {
      estimatedDays = 1;
    } else if (order.delivery.method === 'store_pickup') {
      estimatedDays = 0;
    }
    
    if (estimatedDays > 0) {
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
      return estimatedDate.toLocaleDateString();
    }
    
    return null;
  }
};

export default orderAPI;

