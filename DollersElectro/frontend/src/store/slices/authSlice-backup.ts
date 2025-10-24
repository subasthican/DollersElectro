import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI, AuthResponse, UserResponse, TwoFactorSetupResponse } from '../../services/api/authAPI';

export interface User {
  id: string;
  _id?: string; // MongoDB ObjectId
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string; // Changed from union type to string to match API response
  isEmailVerified: boolean;
  isPhoneVerified?: boolean; // Made optional to match API response
  isTwoFactorEnabled: boolean;
  profilePicture?: string;
  addresses?: Address[]; // Made optional to match API response
  preferences?: UserPreferences; // Made optional to match API response
  lastLogin?: string;
  createdAt?: string; // Made optional to match API response
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
  requires2FA: boolean;
  isEmailVerificationSent: boolean;
  isPasswordResetSent: boolean;
}

const initialState: AuthState = {
  user: (() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {

      return null;
    }
  })(),
  tokens: {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  },
  isAuthenticated: Boolean(localStorage.getItem('accessToken') && localStorage.getItem('user')),
  isLoading: false,
  error: null,
  requires2FA: false,
  isEmailVerificationSent: false,
  isPasswordResetSent: false,
};

// Async thunks
export const login = createAsyncThunk<AuthResponse, { email: string; password: string; totpCode?: string }, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
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
      return response;
    } catch (error: any) {

      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const refreshToken = createAsyncThunk<{ tokens: { accessToken: string; refreshToken: string } }, void, { rejectValue: string }>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken();
      return { tokens: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const logout = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const verifyEmail = createAsyncThunk<{ message: string }, string, { rejectValue: string }>(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      await authAPI.verifyEmail(token);
      return { message: 'Email verified successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const resendVerification = createAsyncThunk<{ message: string }, string, { rejectValue: string }>(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      await authAPI.resendVerification(email);
      return { message: 'Verification email sent successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend verification');
    }
  }
);

export const forgotPassword = createAsyncThunk<{ message: string }, string, { rejectValue: string }>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await authAPI.forgotPassword(email);
      return { message: 'Password reset email sent successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send password reset email');
    }
  }
);

export const resetPassword = createAsyncThunk<{ message: string }, { token: string; password: string }, { rejectValue: string }>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      await authAPI.resetPassword(data);
      return { message: 'Password reset successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

export const getCurrentUser = createAsyncThunk<UserResponse, void, { rejectValue: string }>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response;
    } catch (error: any) {
      // If token is expired, try to refresh it
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedRefreshToken && error.response?.status === 401) {
        try {
          const refreshResponse = await authAPI.refreshToken();
          // Update tokens in localStorage
          localStorage.setItem('accessToken', refreshResponse.accessToken);
          localStorage.setItem('refreshToken', refreshResponse.refreshToken);
          // Retry getting current user
          const retryResponse = await authAPI.getCurrentUser();
          return retryResponse;
        } catch (refreshError) {
          // If refresh fails, clear auth state
          dispatch(clearAuthState());
          return rejectWithValue('Session expired. Please login again.');
        }
      }
      // For network errors or other issues, don't clear auth state immediately
      // Just return the error without clearing the stored data
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return rejectWithValue('Network error. Please check your connection.');
      }
      
      return rejectWithValue(error.response?.data?.message || 'Failed to get current user');
    }
  }
);

export const setup2FA = createAsyncThunk<TwoFactorSetupResponse, void, { rejectValue: string }>(
  'auth/setup2FA',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.setup2FA();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to setup 2FA');
    }
  }
);

export const enable2FA = createAsyncThunk<{ message: string }, string, { rejectValue: string }>(
  'auth/enable2FA',
  async (code, { rejectWithValue }) => {
    try {
      await authAPI.enable2FA(code);
      return { message: '2FA enabled successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enable 2FA');
    }
  }
);

export const disable2FA = createAsyncThunk<{ message: string }, string, { rejectValue: string }>(
  'auth/disable2FA',
  async (code, { rejectWithValue }) => {
    try {
      await authAPI.disable2FA(code);
      return { message: '2FA disabled successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable 2FA');
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
      state.user = null;
      state.tokens = { accessToken: null, refreshToken: null };
      state.isAuthenticated = false;
      state.requires2FA = false;
      state.isEmailVerificationSent = false;
      state.isPasswordResetSent = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setRequires2FA: (state, action: PayloadAction<boolean>) => {
      state.requires2FA = action.payload;
    },
    setEmailVerificationSent: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerificationSent = action.payload;
    },
    setPasswordResetSent: (state, action: PayloadAction<boolean>) => {
      state.isPasswordResetSent = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
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
        // Handle MongoDB ObjectId properly
        const user = action.payload.data.user as any;
        if (user._id && !user.id) {
          user.id = user._id; // Set id from _id for compatibility
        }
        state.user = user;
        state.tokens = action.payload.data.tokens;
        state.isAuthenticated = true;
        state.requires2FA = false;
        state.error = null;
        
        // Store tokens and user data in localStorage
        localStorage.setItem('accessToken', action.payload.data.tokens.accessToken);
        localStorage.setItem('refreshToken', action.payload.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        // Check if 2FA is required
        if (action.payload === 'Two-factor authentication code required') {
          state.requires2FA = true;
        }
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.tokens = action.payload.data.tokens;
        state.isAuthenticated = true;
        state.error = null;
        state.isEmailVerificationSent = true;
        
        // Store tokens and user data in localStorage
        localStorage.setItem('accessToken', action.payload.data.tokens.accessToken);
        localStorage.setItem('refreshToken', action.payload.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(action.payload.data.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        localStorage.setItem('accessToken', action.payload.tokens.accessToken);
        localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.tokens = { accessToken: null, refreshToken: null };
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tokens = { accessToken: null, refreshToken: null };
        state.isAuthenticated = false;
        state.requires2FA = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      });

    // Verify Email
    builder
      .addCase(verifyEmail.fulfilled, (state) => {
        if (state.user) {
          state.user.isEmailVerified = true;
        }
        state.isEmailVerificationSent = false;
      });

    // Resend Verification
    builder
      .addCase(resendVerification.fulfilled, (state) => {
        state.isEmailVerificationSent = true;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isPasswordResetSent = true;
      });

    // Reset Password
    builder
      .addCase(resetPassword.fulfilled, (state) => {
        state.isPasswordResetSent = false;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle MongoDB ObjectId properly
        const user = action.payload.data.user as any;
        if (user._id && !user.id) {
          user.id = user._id; // Set id from _id for compatibility
        }
        state.user = user;
        state.isAuthenticated = true;
        // Restore tokens and user data from localStorage
        state.tokens = {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken')
        };
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        // Only clear auth state if it's a real authentication error
        // Don't clear if it's just a network error
        if (action.payload && action.payload.includes('Session expired')) {
          state.user = null;
          state.isAuthenticated = false;
          state.tokens = { accessToken: null, refreshToken: null };
          // Clear localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      });

    // Setup 2FA
    builder
      .addCase(setup2FA.fulfilled, (state) => {
        // 2FA setup initiated - no user data to update
        state.isLoading = false;
      })
      .addCase(setup2FA.rejected, (state) => {
        state.isLoading = false;
        state.requires2FA = false;
      });

    // Enable 2FA
    builder
      .addCase(enable2FA.fulfilled, (state) => {
        if (state.user) {
          state.user.isTwoFactorEnabled = true;
        }
      });

    // Disable 2FA
    builder
      .addCase(disable2FA.fulfilled, (state) => {
        if (state.user) {
          state.user.isTwoFactorEnabled = false;
        }
      });
  },
});

export const {
  clearError,
  clearAuthState,
  setRequires2FA,
  setEmailVerificationSent,
  setPasswordResetSent,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
