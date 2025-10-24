import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderAPI, Order as APIOrder, CreateOrderData } from '../../services/api/orderAPI';

// Use the Order interface from orderAPI for consistency
export type Order = APIOrder;

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

// Fetch customer orders
export const fetchCustomerOrders = createAsyncThunk(
  'orders/fetchCustomerOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getCustomerOrders();
      return response.data.orders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Fetch admin orders
export const fetchAdminOrders = createAsyncThunk(
  'orders/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getAdminOrders();
      return response.data.orders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin orders');
    }
  }
);

// Fetch employee pending orders
export const fetchEmployeePendingOrders = createAsyncThunk(
  'orders/fetchEmployeePendingOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getEmployeePendingOrders();
      return response.data.orders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee pending orders');
    }
  }
);

// Fetch employee delivery orders
export const fetchEmployeeDeliveryOrders = createAsyncThunk(
  'orders/fetchEmployeeDeliveryOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getEmployeeDeliveryOrders();
      return response.data.orders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee delivery orders');
    }
  }
);

// Create new order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      return response.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, status, notes);
      return response.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePaymentStatus',
  async ({ orderId, status, transactionId }: { orderId: string; status: string; transactionId?: string }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updatePaymentStatus(orderId, status, transactionId);
      return response.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment status');
    }
  }
);

// Update delivery status
export const updateDeliveryStatus = createAsyncThunk(
  'orders/updateDeliveryStatus',
  async ({ orderId, status, trackingNumber, carrier }: { orderId: string; status: string; trackingNumber?: string; carrier?: string }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateDeliveryStatus(orderId, status, trackingNumber, carrier);
      return response.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update delivery status');
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  'orders/getOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrder(orderId);
      return response.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }: { orderId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(orderId, reason);
      return response.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customer orders
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch admin orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch employee pending orders
      .addCase(fetchEmployeePendingOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeePendingOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchEmployeePendingOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch employee delivery orders
      .addCase(fetchEmployeeDeliveryOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDeliveryOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchEmployeeDeliveryOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(o => o._id === updatedOrder._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(o => o._id === updatedOrder._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update delivery status
      .addCase(updateDeliveryStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(o => o._id === updatedOrder._id);
        state.orders[orderIndex] = updatedOrder;
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateDeliveryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const cancelledOrder = action.payload;
        const orderIndex = state.orders.findIndex(o => o._id === cancelledOrder._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = cancelledOrder;
        }
        if (state.currentOrder?._id === cancelledOrder._id) {
          state.currentOrder = cancelledOrder;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentOrder, clearCurrentOrder, clearOrders } = orderSlice.actions;

export default orderSlice.reducer;

