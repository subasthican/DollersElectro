import api from './api';

export interface WishlistItem {
  id: string;
  _id: string;
  product: {
    id: string;
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    images?: Array<{ url: string; alt?: string }>;
    rating: number;
    reviewCount: number;
    category: string;
    isInStock: boolean;
    isActive: boolean;
  };
  addedAt: string;
  notes?: string;
}

export interface Wishlist {
  id: string;
  _id: string;
  itemCount: number;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    wishlist: Wishlist;
  };
}

export interface WishlistCheckResponse {
  success: boolean;
  message: string;
  data: {
    isInWishlist: boolean;
    productId: string;
  };
}

// Get user's wishlist
export const getWishlist = async (): Promise<WishlistResponse> => {
  const response = await api.get('/wishlist');
  return response.data;
};

// Add item to wishlist
export const addToWishlist = async (productId: string, notes?: string): Promise<WishlistResponse> => {
  const response = await api.post('/wishlist', {
    productId,
    notes: notes || ''
  });
  return response.data;
};

// Remove item from wishlist
export const removeFromWishlist = async (productId: string): Promise<WishlistResponse> => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// Check if product is in wishlist
export const checkWishlistStatus = async (productId: string): Promise<WishlistCheckResponse> => {
  const response = await api.get(`/wishlist/check/${productId}`);
  return response.data;
};

// Clear entire wishlist
export const clearWishlist = async (): Promise<WishlistResponse> => {
  const response = await api.delete('/wishlist');
  return response.data;
};

// Move item from wishlist to cart
export const moveToCart = async (productId: string, quantity: number = 1): Promise<{ success: boolean; message: string; data: { productId: string; quantity: number } }> => {
  const response = await api.post(`/wishlist/move-to-cart/${productId}`, { quantity });
  return response.data;
};

const wishlistAPI = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  clearWishlist,
  moveToCart
};

export default wishlistAPI;
