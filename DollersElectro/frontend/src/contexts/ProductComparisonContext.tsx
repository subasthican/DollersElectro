import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../services/api/productAPI';

interface ProductComparisonContextType {
  comparedProducts: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddToComparison: (product: Product) => boolean;
}

const ProductComparisonContext = createContext<ProductComparisonContextType | undefined>(undefined);

interface ProductComparisonProviderProps {
  children: ReactNode;
}

const MAX_COMPARISON_ITEMS = 4;
const STORAGE_KEY = 'productComparison';

export const ProductComparisonProvider: React.FC<ProductComparisonProviderProps> = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  // Load comparison from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setComparedProducts(parsed);
      } catch (error) {

        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever comparedProducts changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  const addToComparison = (product: Product) => {
    setComparedProducts(prev => {
      // Check if already in comparison
      if (prev.some(p => p._id === product._id)) {
        return prev;
      }
      
      // Check if we can add more items
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        return prev;
      }
      
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparedProducts(prev => prev.filter(p => p._id !== productId));
  };

  const clearComparison = () => {
    setComparedProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isInComparison = (productId: string) => {
    return comparedProducts.some(p => p._id === productId);
  };

  const canAddToComparison = (product: Product) => {
    return !isInComparison(product._id || '') && comparedProducts.length < MAX_COMPARISON_ITEMS;
  };

  const value: ProductComparisonContextType = {
    comparedProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddToComparison
  };

  return (
    <ProductComparisonContext.Provider value={value}>
      {children}
    </ProductComparisonContext.Provider>
  );
};

export const useProductComparison = (): ProductComparisonContextType => {
  const context = useContext(ProductComparisonContext);
  if (context === undefined) {
    throw new Error('useProductComparison must be used within a ProductComparisonProvider');
  }
  return context;
};

export default ProductComparisonContext;
