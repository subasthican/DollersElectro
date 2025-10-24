import api from './api';

export interface LowStockAlert {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
  };
  currentStock: number;
  threshold: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  alertType: 'low_stock' | 'out_of_stock' | 'reorder_point';
  createdAt: string;
  urgencyScore: number;
  ageInDays: number;
  acknowledgedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  resolvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AlertFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  alertType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Low Stock Alerts API functions
export const lowStockAlertsAPI = {
  // Get all low stock alerts
  getAlerts: async (filters: AlertFilters = {}): Promise<{ success: boolean; data: { alerts: LowStockAlert[]; pagination: any } }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/low-stock-alerts?${params.toString()}`);
    return response.data;
  },

  // Get alert statistics
  getStats: async (): Promise<{ success: boolean; data: { stats: AlertStats; activeAlerts: LowStockAlert[] } }> => {
    const response = await api.get('/low-stock-alerts/stats');
    return response.data;
  },

  // Get dashboard data
  getDashboard: async (): Promise<{ success: boolean; data: { stats: AlertStats; activeAlerts: LowStockAlert[]; criticalAlerts: LowStockAlert[]; recentAlerts: LowStockAlert[] } }> => {
    const response = await api.get('/low-stock-alerts/dashboard');
    return response.data;
  },

  // Acknowledge an alert
  acknowledgeAlert: async (alertId: string, notes?: string): Promise<{ success: boolean; message: string; data: { alert: LowStockAlert } }> => {
    const response = await api.put(`/low-stock-alerts/${alertId}/acknowledge`, { notes });
    return response.data;
  },

  // Resolve an alert
  resolveAlert: async (alertId: string, notes?: string): Promise<{ success: boolean; message: string; data: { alert: LowStockAlert } }> => {
    const response = await api.put(`/low-stock-alerts/${alertId}/resolve`, { notes });
    return response.data;
  },

  // Dismiss an alert
  dismissAlert: async (alertId: string, notes?: string): Promise<{ success: boolean; message: string; data: { alert: LowStockAlert } }> => {
    const response = await api.put(`/low-stock-alerts/${alertId}/dismiss`, { notes });
    return response.data;
  },

  // Check for low stock products and create alerts
  checkLowStock: async (): Promise<{ success: boolean; message: string; data: { productsChecked: number; alertsCreated: number; alerts: LowStockAlert[] } }> => {
    const response = await api.post('/low-stock-alerts/check');
    return response.data;
  },

  // Delete an alert
  deleteAlert: async (alertId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/low-stock-alerts/${alertId}`);
    return response.data;
  }
};

export default lowStockAlertsAPI;



