import api from './api';

export interface PromoCode {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit: number;
  usedCount: number;
  userUsageLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableCategories: string[];
  applicableProducts: string[];
  excludedCategories: string[];
  excludedProducts: string[];
  userRestrictions: {
    newUsersOnly: boolean;
    existingUsersOnly: boolean;
    specificUsers: string[];
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastModifiedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodeData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  validFrom?: string;
  validUntil: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  userRestrictions?: {
    newUsersOnly?: boolean;
    existingUsersOnly?: boolean;
    specificUsers?: string[];
  };
}

export interface UpdatePromoCodeData extends Partial<CreatePromoCodeData> {}

export interface PromoCodeValidationRequest {
  code: string;
  orderData: {
    subtotal: number;
    userType?: 'new' | 'existing';
  };
}

export interface PromoCodeValidationResponse {
  success: boolean;
  message: string;
  data?: {
    promoCode: {
      id: string;
      code: string;
      name: string;
      type: string;
      value: number;
      discount: number;
    };
  };
}

export interface PromoCodeListResponse {
  success: boolean;
  data: {
    promoCodes: PromoCode[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface PromoCodeAnalytics {
  success: boolean;
  data: {
    stats: {
      totalCodes: number;
      activeCodes: number;
      totalUsage: number;
      averageUsage: number;
    };
    topCodes: Array<{
      _id: string;
      code: string;
      name: string;
      usedCount: number;
    }>;
  };
}

export const promoCodeAPI = {
  // ==================== ADMIN ROUTES ====================

  // Get all promo codes (admin only)
  getPromoCodes: async (page = 1, limit = 20, status?: string, type?: string): Promise<PromoCodeListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    
    const response = await api.get(`/promo-codes?${params.toString()}`);
    return response.data;
  },

  // Create new promo code (admin only)
  createPromoCode: async (data: CreatePromoCodeData): Promise<{ success: boolean; message: string; data: PromoCode }> => {
    const response = await api.post('/promo-codes', data);
    return response.data;
  },

  // Get promo code by ID (admin only)
  getPromoCode: async (id: string): Promise<{ success: boolean; data: PromoCode }> => {
    const response = await api.get(`/promo-codes/${id}`);
    return response.data;
  },

  // Update promo code (admin only)
  updatePromoCode: async (id: string, data: UpdatePromoCodeData): Promise<{ success: boolean; message: string; data: PromoCode }> => {
    const response = await api.put(`/promo-codes/${id}`, data);
    return response.data;
  },

  // Delete promo code (admin only)
  deletePromoCode: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/promo-codes/${id}`);
    return response.data;
  },

  // Toggle promo code status (admin only)
  togglePromoCode: async (id: string): Promise<{ success: boolean; message: string; data: PromoCode }> => {
    const response = await api.patch(`/promo-codes/${id}/toggle`);
    return response.data;
  },

  // Get promo code analytics (admin only)
  getAnalytics: async (startDate?: string, endDate?: string): Promise<PromoCodeAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/promo-codes/analytics/usage?${params.toString()}`);
    return response.data;
  },

  // ==================== CUSTOMER ROUTES ====================

  // Validate promo code for customer
  validatePromoCode: async (data: PromoCodeValidationRequest): Promise<PromoCodeValidationResponse> => {
    const response = await api.post('/promo-codes/validate', data);
    return response.data;
  },

  // Get available promo codes for customer
  getAvailablePromoCodes: async (): Promise<{ success: boolean; data: PromoCode[] }> => {
    const response = await api.get('/promo-codes/available');
    return response.data;
  }
};

// Helper functions for promo codes
export const promoCodeHelpers = {
  // Format discount value for display
  formatDiscountValue: (type: string, value: number): string => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed':
        return `LKR ${value.toFixed(2)}`;
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return value.toString();
    }
  },

  // Format discount amount for display
  formatDiscountAmount: (type: string, value: number, subtotal: number): string => {
    switch (type) {
      case 'percentage':
        const percentageAmount = (subtotal * value) / 100;
        return `-LKR ${percentageAmount.toFixed(2)}`;
      case 'fixed':
        return `-LKR ${value.toFixed(2)}`;
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return `-LKR ${value.toFixed(2)}`;
    }
  },

  // Check if promo code is expired
  isExpired: (validUntil: string): boolean => {
    return new Date(validUntil) < new Date();
  },

  // Check if promo code is active
  isActive: (promoCode: PromoCode): boolean => {
    const now = new Date();
    return promoCode.isActive && 
           now >= new Date(promoCode.validFrom) && 
           now <= new Date(promoCode.validUntil);
  },

  // Get promo code status
  getStatus: (promoCode: PromoCode): string => {
    if (!promoCode.isActive) return 'Inactive';
    if (promoCodeHelpers.isExpired(promoCode.validUntil)) return 'Expired';
    if (promoCode.usageLimit !== -1 && promoCode.usedCount >= promoCode.usageLimit) return 'Usage Limit Reached';
    return 'Active';
  },

  // Get status color for UI
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'Expired':
        return 'text-red-600 bg-red-100';
      case 'Inactive':
        return 'text-gray-600 bg-gray-100';
      case 'Usage Limit Reached':
        return 'text-blue-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
};



