import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, CreateProductData } from '../../services/api/productAPI';
import productAPI from '../../services/api/productAPI';

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  categories: string[];
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  categories: []
};

// Fetch all products from API
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProducts();
      return response.data.products;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Fetch featured products from API
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getFeaturedProducts();
      return response.data.products;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

// Add new product via API
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData: CreateProductData, { rejectWithValue }) => {
    try {
      const response = await productAPI.createProduct(productData);
      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

// Update product via API
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (productData: Product, { rejectWithValue }) => {
    try {
      const response = await productAPI.updateProduct(productData);
      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

// Delete product via API
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      await productAPI.deleteProduct(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// Toggle product status via API
export const toggleProductStatus = createAsyncThunk(
  'products/toggleProductStatus',
  async ({ id, isActive }: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await productAPI.toggleProductStatus(id, isActive);
      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle product status');
    }
  }
);

// Update product stock via API
export const updateProductStock = createAsyncThunk(
  'products/updateProductStock',
  async ({ id, stock }: { id: string; stock: number }, { rejectWithValue }) => {
    try {
      const response = await productAPI.updateProductStock(id, stock);
      // The API returns a different structure, so we need to handle it properly
      const productData = {
        _id: response.data.product.id,
        name: response.data.product.name,
        stock: response.data.product.stock,
        isInStock: response.data.product.isInStock
      } as Product;
      return productData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product stock');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload || [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(action.payload.map((p: Product) => p.category)));
        state.categories = uniqueCategories;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Update only featured products
        const featuredProducts = action.payload;
        state.products = state.products.map(p => {
          const featured = featuredProducts.find(fp => fp._id === p._id);
          return featured ? { ...p, ...featured } : p;
        });
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        // Add category if new
        if (state.categories && !state.categories.includes(action.payload.category)) {
          state.categories.push(action.payload.category);
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        // Update category if changed
        if (state.categories && !state.categories.includes(action.payload.category)) {
          state.categories.push(action.payload.category);
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Soft delete - mark product as inactive instead of removing from array
        const productId = action.payload;
        const product = state.products.find(p => p._id === productId);
        if (product) {
          product.isActive = false;
          product.isInStock = false; // Also mark as out of stock
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Toggle product status
      .addCase(toggleProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update product stock
      .addCase(updateProductStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, setProducts, setCategories } = productSlice.actions;
export default productSlice.reducer;

