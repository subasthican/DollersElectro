import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '../services/api/productAPI';
import { cartAPI } from '../services/api/cartAPI';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CART'; payload: CartItem[] | { items: CartItem[] } }
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'LOAD_CART':
      // Handle both API response format and direct cart items
      const cartItems: CartItem[] = Array.isArray(action.payload) ? action.payload : action.payload.items || [];
      const total = cartItems.reduce((sum: number, item: CartItem) => {
        // Handle both populated product and direct product structure
        const product = item.product || item;
        const price = product?.price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
      }, 0);
      const itemCount = cartItems.reduce((sum: number, item: CartItem) => sum + (item.quantity || 0), 0);
      return {
        ...state,
        items: cartItems,
        total,
        itemCount,
        loading: false,
        error: null
      };
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => {
        const product = item.product || item;
        return product._id === action.payload._id || product.id === action.payload.id;
      });
      
      if (existingItem) {
        const updatedItems = state.items.map(item => {
          const product = item.product || item;
          if (product._id === action.payload._id || product.id === action.payload.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
        
        const total = updatedItems.reduce((sum: number, item: CartItem) => {
          const product = item.product || item;
          return sum + ((product?.price || 0) * item.quantity);
        }, 0);
        const itemCount = updatedItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: updatedItems,
          total,
          itemCount
        };
      } else {
        const newItem: CartItem = { product: action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        
        const total = updatedItems.reduce((sum: number, item: CartItem) => {
          const product = item.product || item;
          return sum + ((product?.price || 0) * item.quantity);
        }, 0);
        const itemCount = updatedItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: updatedItems,
          total,
          itemCount
        };
      }
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => {
        const product = item.product || item;
        return product._id !== action.payload && product.id !== action.payload;
      });
      
      const totalAfterRemove = filteredItems.reduce((sum: number, item: CartItem) => {
        const product = item.product || item;
        return sum + ((product?.price || 0) * item.quantity);
      }, 0);
      const itemCountAfterRemove = filteredItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: filteredItems,
        total: totalAfterRemove,
        itemCount: itemCountAfterRemove
      };
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item => {
        const product = item.product || item;
        if (product._id === action.payload.productId || product.id === action.payload.productId) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
      
      const totalAfterUpdate = updatedItems.reduce((sum: number, item: CartItem) => {
        const product = item.product || item;
        return sum + ((product?.price || 0) * item.quantity);
      }, 0);
      const itemCountAfterUpdate = updatedItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItems,
        total: totalAfterUpdate,
        itemCount: itemCountAfterUpdate
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };
    
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addToCart: (product: Product) => Promise<void>;
  addItem: (product: Product) => Promise<void>; // Alias for addToCart
  removeFromCart: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>; // Alias for removeFromCart
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  refreshCart: () => Promise<void>; // Force refresh cart data
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  logoutCleanup: () => void; // For cleanup on logout
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Load cart when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.getCart();
      
      if (response.success && response.data) {
        // Convert API response to CartItem format
        const cartItems: CartItem[] = response.data.items.map((item: any) => {
          // Ensure product has both _id and id fields for compatibility
          const product = item.product;
          if (product && product._id && !product.id) {
            product.id = product._id.toString();
          }
          
          return {
            product: product,
            quantity: item.quantity
          };
        });
        
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      }
    } catch (error: any) {

      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const productId = product._id || product.id || '';
      if (!productId) {
        toast.error('Invalid product ID');
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.addToCart(productId, 1);
      
      if (response.success) {
        dispatch({ type: 'ADD_ITEM', payload: product });
        toast.success('Item added to cart');
      } else {
        toast.error(response.message || 'Failed to add item to cart');
      }
    } catch (error: any) {

      toast.error('Failed to add item to cart');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.removeItem(productId);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
        toast.success('Item removed from cart');
      } else {

        toast.error(response.message || 'Failed to remove item from cart');
      }
    } catch (error: any) {

      toast.error('Failed to remove item from cart');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.updateQuantity(productId, quantity);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
        toast.success('Quantity updated');
      } else {

        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error: any) {

      toast.error('Failed to update quantity');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.clearCart();
      
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
        toast.success('Cart cleared');
      } else {
        toast.error(response.message || 'Failed to clear cart');
      }
    } catch (error: any) {

      toast.error('Failed to clear cart');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => {
      const product = item.product || item;
      return product._id === productId || product.id === productId;
    });
  };

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => {
      const product = item.product || item;
      return product._id === productId || product.id === productId;
    });
    return item ? item.quantity : 0;
  };

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    await loadCart();
  };

  const logoutCleanup = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value: CartContextType = {
    state,
    addToCart,
    addItem: addToCart, // Alias
    removeFromCart,
    removeItem: removeFromCart, // Alias
    updateQuantity,
    clearCart,
    loadCart,
    refreshCart,
    isInCart,
    getItemQuantity,
    logoutCleanup
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};