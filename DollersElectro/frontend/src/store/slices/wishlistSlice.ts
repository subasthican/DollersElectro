import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  checkWishlistStatus,
  clearWishlist,
  moveToCart,
  Wishlist
} from '../../services/api/wishlistAPI';

interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
  checkingStatus: { [productId: string]: boolean };
  updateCounter: number;
}

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
  checkingStatus: {},
  updateCounter: 0
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔵 Fetching wishlist...');
      const response = await getWishlist();
      console.log('✅ Fetch wishlist response:', response);
      return response.data.wishlist;
    } catch (error: any) {
      console.error('❌ Fetch wishlist error:', error);
      console.error('❌ Error response:', error.response);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch wishlist');
    }
  }
);

export const addItemToWishlist = createAsyncThunk(
  'wishlist/addItem',
  async ({ productId, notes }: { productId: string; notes?: string }, { rejectWithValue }) => {
    try {
      console.log('🔵 Adding to wishlist:', productId);
      const response = await addToWishlist(productId, notes);
      console.log('✅ Add to wishlist response:', response);
      return response.data.wishlist;
    } catch (error: any) {
      console.error('❌ Add to wishlist error:', error);
      console.error('❌ Error response:', error.response);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add item to wishlist');
    }
  }
);

export const removeItemFromWishlist = createAsyncThunk(
  'wishlist/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      console.log('🔵 Removing from wishlist:', productId);
      const response = await removeFromWishlist(productId);
      console.log('✅ Remove from wishlist response:', response);
      return response.data.wishlist;
    } catch (error: any) {
      console.error('❌ Remove from wishlist error:', error);
      console.error('❌ Error response:', error.response);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove item from wishlist');
    }
  }
);

export const checkItemWishlistStatus = createAsyncThunk(
  'wishlist/checkStatus',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await checkWishlistStatus(productId);
      return { productId, isInWishlist: response.data.isInWishlist };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check wishlist status');
    }
  }
);

export const clearUserWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearWishlist();
      return response.data.wishlist;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
    }
  }
);

export const moveItemToCart = createAsyncThunk(
  'wishlist/moveToCart',
  async ({ productId, quantity }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await moveToCart(productId, quantity);
      return { productId, response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move item to cart');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    setWishlist: (state, action: PayloadAction<Wishlist>) => {
      state.wishlist = action.payload;
    },
    clearWishlistState: (state) => {
      state.wishlist = null;
      state.loading = false;
      state.error = null;
      state.checkingStatus = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.error = null;
        state.updateCounter += 1;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add item to wishlist
      .addCase(addItemToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.error = null;
        state.updateCounter += 1;
      })
      .addCase(addItemToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove item from wishlist
      .addCase(removeItemFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.error = null;
        state.updateCounter += 1;
      })
      .addCase(removeItemFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Check wishlist status
      .addCase(checkItemWishlistStatus.pending, (state, action) => {
        state.checkingStatus[action.meta.arg] = true;
      })
      .addCase(checkItemWishlistStatus.fulfilled, (state, action) => {
        state.checkingStatus[action.meta.arg] = false;
        // You can store the status in a separate state if needed
      })
      .addCase(checkItemWishlistStatus.rejected, (state, action) => {
        state.checkingStatus[action.meta.arg] = false;
        state.error = action.payload as string;
      })
      
      // Clear wishlist
      .addCase(clearUserWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearUserWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.error = null;
      })
      .addCase(clearUserWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Move to cart
      .addCase(moveItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the item from wishlist after moving to cart
        if (state.wishlist) {
          state.wishlist.items = state.wishlist.items.filter(
            item => item.product.id !== action.payload.productId
          );
          state.wishlist.itemCount = state.wishlist.items.length;
        }
        state.error = null;
      })
      .addCase(moveItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearWishlistError, setWishlist, clearWishlistState } = wishlistSlice.actions;

export default wishlistSlice.reducer;
