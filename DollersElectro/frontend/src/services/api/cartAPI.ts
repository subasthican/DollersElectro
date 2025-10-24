import api from './api';

export interface CartItem {
  product: string; // Product ID
  quantity: number;
}

export interface Cart {
  _id?: string;
  user: string; // User ID
  items: CartItem[];
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data?: {
    items: CartItem[];
    itemCount: number;
    total?: number;
  };
}

export const cartAPI = {
  // Get cart items
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
    const response = await api.post('/cart', {
      productId,
      quantity
    });
    return response.data;
  },

  // Update item quantity
  updateQuantity: async (productId: string, quantity: number): Promise<CartResponse> => {
    const response = await api.put(`/cart/${productId}`, {
      quantity
    });
    return response.data;
  },

  // Remove item from cart
  removeItem: async (productId: string): Promise<CartResponse> => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete('/cart');
    return response.data;
  }
};
