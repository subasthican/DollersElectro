import api from './api';

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'customer';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTemporaryPassword: boolean;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  fullName?: string;
  displayName?: string;
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username?: string;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  username?: string;
  isActive?: boolean;
}

export interface CustomerResponse {
  success: boolean;
  message?: string;
  data: {
    customers?: Customer[];
    customer?: Customer;
    temporaryPassword?: string;
  };
}

// Get all customers
export const getCustomers = async (): Promise<CustomerResponse> => {
  const response = await api.get('/users/admin/customers');
  return response.data;
};

// Get specific customer
export const getCustomer = async (id: string): Promise<CustomerResponse> => {
  const response = await api.get(`/users/admin/customers/${id}`);
  return response.data;
};

// Create new customer
export const createCustomer = async (customerData: CreateCustomerData): Promise<CustomerResponse> => {
  const response = await api.post('/users/admin/customers', customerData);
  return response.data;
};

// Update customer
export const updateCustomer = async (id: string, customerData: UpdateCustomerData): Promise<CustomerResponse> => {
  const response = await api.put(`/users/admin/customers/${id}`, customerData);
  return response.data;
};

// Delete customer (soft delete - deactivate)
export const deleteCustomer = async (id: string): Promise<CustomerResponse> => {
  const response = await api.delete(`/users/admin/customers/${id}`);
  return response.data;
};

// Toggle customer status
export const toggleCustomerStatus = async (id: string, isActive: boolean): Promise<CustomerResponse> => {
  const response = await api.patch(`/users/admin/customers/${id}/status`, { isActive });
  return response.data;
};

// Customer helper functions
export const customerHelpers = {
  // Get full name
  getFullName: (customer: Customer): string => {
    return `${customer.firstName} ${customer.lastName}`;
  },

  // Get display name
  getDisplayName: (customer: Customer): string => {
    return customer.username || customer.email;
  },

  // Get initials for avatar
  getInitials: (customer: Customer): string => {
    return `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase();
  },

  // Format join date
  formatJoinDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Get status badge info
  getStatusInfo: (customer: Customer) => {
    if (customer.isActive) {
      return {
        text: 'Active',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-green-500'
      };
    } else {
      return {
        text: 'Inactive',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        dotColor: 'bg-red-500'
      };
    }
  },

  // Check if customer is verified
  isVerified: (customer: Customer): boolean => {
    return customer.isEmailVerified && customer.isPhoneVerified;
  }
};
