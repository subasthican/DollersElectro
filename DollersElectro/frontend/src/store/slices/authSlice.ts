import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, AuthResponse, UserResponse } from '../../services/api/authAPI';

export interface User {
  id: string;
  _id?: string; // MongoDB ObjectId
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
  addresses: Address[];
  preferences: UserPreferences;
  lastLogin?: string;
  createdAt: string;
}

export interface Address {
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  currency: string;
  language: string;
}

export interface AuthState {
  user: User | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadInitialState = (): AuthState => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userStr = localStorage.getItem('user');
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {

      localStorage.removeItem('user');
    }
  }
  
  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
    isAuthenticated: !!(accessToken && user),
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = loadInitialState();

// Helper function to ensure user has both id and _id
const ensureUserIds = (user: any): User => {
  if (user) {
    if (user._id && !user.id) {
      user.id = user._id;
    }
    if (user.id && !user._id) {
      user._id = user.id;
    }
    // Ensure all required fields have default values
    return {
      id: user.id || user._id || '',
      _id: user._id || user.id || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone,
      role: user.role || 'customer',
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      isTwoFactorEnabled: user.isTwoFactorEnabled || false,
      isTemporaryPassword: user.isTemporaryPassword || false,
      profilePicture: user.profilePicture,
      addresses: user.addresses || [],
      preferences: user.preferences || {},
      lastLogin: user.lastLogin,
      createdAt: user.createdAt || new Date().toISOString()
    };
  }
  return user;
};

// Helper function to clear auth state
const clearAuthStateHelper = (state: AuthState) => {
  state.user = null;
  state.isAuthenticated = false;
  state.tokens = { accessToken: null, refreshToken: null };
  state.error = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Async thunks
export const login = createAsyncThunk<AuthResponse, { email: string; password: string; totpCode?: string }, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Ensure user has both id and _id
      if (response.data.user) {
        response.data.user = ensureUserIds(response.data.user);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk<AuthResponse, {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}, { rejectValue: string }>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {

      const response = await authAPI.register(userData);
      
      // Ensure user has both id and _id
      if (response.data.user) {
        response.data.user = ensureUserIds(response.data.user);
      }
      
      return response;
    } catch (error: any) {

      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk<UserResponse, void, { rejectValue: string }>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have a token first
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }
      
      const response = await authAPI.getCurrentUser();
      
      // Ensure user has both id and _id
      if (response.data.user) {
        response.data.user = ensureUserIds(response.data.user);
      }
      
      return response;
    } catch (error: any) {

      // If it's a network error or no token, don't clear auth state
      if (error.message === 'No access token found' || error.code === 'NETWORK_ERROR' || !error.response) {
        return rejectWithValue('No access token found');
      }
      
      // Only clear auth state for actual authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Try to refresh token first
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken && error.response?.data?.code === 'TOKEN_EXPIRED') {
          try {
            const refreshResponse = await authAPI.refreshToken(refreshToken);
            // Update tokens
            localStorage.setItem('accessToken', refreshResponse.accessToken);
            localStorage.setItem('refreshToken', refreshResponse.refreshToken);
            
            // Retry the original request
            const retryResponse = await authAPI.getCurrentUser();
            return retryResponse;
          } catch (refreshError) {
            // Refresh failed, clear auth state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            return rejectWithValue('Session expired. Please login again.');
          }
        } else {
          // Clear stored tokens and user data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          return rejectWithValue('Session expired. Please login again.');
        }
      }
      
      return rejectWithValue(error.response?.data?.message || 'Failed to get current user');
    }
  }
);

export const refreshToken = createAsyncThunk<{ accessToken: string; refreshToken: string }, void, { rejectValue: string }>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error: any) {
      // Even if logout fails on server, we should clear local state

    }
  }
);

export const updateUserPassword = createAsyncThunk<{ success: boolean; message: string }, {
  currentPassword?: string;
  newPassword: string;
  isFirstLogin?: boolean;
}, { rejectValue: string }>(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updatePassword(passwordData);
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuthState: (state) => {
      clearAuthStateHelper(state);
    },
    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      
      if (token && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.tokens = { accessToken: token, refreshToken };
          state.user = ensureUserIds(user);
          state.isAuthenticated = true;
        } catch (error) {

          clearAuthStateHelper(state);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = ensureUserIds(action.payload.data.user);
        state.tokens = action.payload.data.tokens;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store in localStorage
        localStorage.setItem('accessToken', action.payload.data.tokens.accessToken);
        localStorage.setItem('refreshToken', action.payload.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(ensureUserIds(action.payload.data.user)));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        // Don't clear auth state on login failure - user isn't logged in yet!
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = ensureUserIds(action.payload.data.user);
        state.tokens = action.payload.data.tokens;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store in localStorage
        localStorage.setItem('accessToken', action.payload.data.tokens.accessToken);
        localStorage.setItem('refreshToken', action.payload.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(ensureUserIds(action.payload.data.user)));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
        clearAuthStateHelper(state);
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = ensureUserIds(action.payload.data.user);
        state.isAuthenticated = true;
        state.error = null;
        
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(ensureUserIds(action.payload.data.user)));
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        
        // Only clear auth state for actual authentication errors
        if (action.payload && action.payload.includes('Session expired')) {
          clearAuthStateHelper(state);
        } else if (action.payload && action.payload.includes('No access token found')) {
          // Don't clear state if just no token found
          state.error = null;
        } else {
          // For other errors, just set error but don't clear state
          state.error = action.payload || 'Failed to get current user';
        }
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = action.payload;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        clearAuthStateHelper(state);
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        clearAuthStateHelper(state);
      })
      .addCase(logout.rejected, (state) => {
        clearAuthStateHelper(state);
      });

    // Update Password
    builder
      .addCase(updateUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Update user to mark password as no longer temporary
        if (state.user) {
          state.user.isTemporaryPassword = false;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update password';
      });
  },
});

export const { clearError, clearAuthState, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
