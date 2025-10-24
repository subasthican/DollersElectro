import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies and sessions
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access

    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
      isTwoFactorEnabled: boolean;
      isTemporaryPassword?: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role: string;
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      isTwoFactorEnabled: boolean;
      isTemporaryPassword?: boolean;
      profilePicture?: string;
      addresses: any[];
      preferences: any;
      lastLogin?: string;
      createdAt: string;
    };
  };
}

export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  data: {
    secret: string;
    qrCode: string;
    otpauthUrl: string;
  };
}

// Auth API functions
export const authAPI = {
  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {

    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginCredentials): Promise<AuthResponse> => {

    try {
      const response = await api.post('/auth/login', data);

      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Try the protected logout first
      await api.post('/auth/logout');
    } catch (error: any) {
      // If protected logout fails (e.g., token expired), use public logout
      if (error.response?.status === 401) {

        await api.post('/auth/logout-public');
      } else {
        throw error;
      }
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const token = localStorage.getItem('accessToken');
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Check session status
  checkSession: async (): Promise<{ isAuthenticated: boolean; userId?: string; userRole?: string }> => {
    const response = await api.get('/auth/session');
    return response.data;
  },

  // Refresh token (if needed)
  refreshToken: async (refreshToken?: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const token = refreshToken || localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken: token });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<void> => {
    await api.post('/auth/resend-verification', { email });
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  // Setup 2FA
  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const response = await api.post('/auth/setup-2fa');
    return response.data;
  },

  // Enable 2FA
  enable2FA: async (code: string): Promise<void> => {
    await api.post('/auth/enable-2fa', { code });
  },

  // Disable 2FA
  disable2FA: async (code: string): Promise<void> => {
    await api.post('/auth/disable-2fa', { code });
  },

  // Update password
  updatePassword: async (data: {
    currentPassword?: string;
    newPassword: string;
    isFirstLogin?: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('🔵 Calling update password API:', {
        hasToken: !!token,
        endpoint: '/auth/update-password',
        data: { ...data, newPassword: '***' }
      });
      
      const response = await api.put('/auth/update-password', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Update password API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update password API error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },
};
