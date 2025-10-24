import api from './api';

// Define proper types for API responses
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  subcategory?: string;
  tags: string[];
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  features: string[];
  specifications: Record<string, string>;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass: 'light' | 'standard' | 'heavy' | 'oversized';
  metaTitle?: string;
  metaDescription?: string;
  supplier?: {
    name: string;
    contact: string;
    email: string;
  };
  warranty: string;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  isInStock: boolean;
  viewCount: number;
  purchaseCount: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination?: PaginationInfo;
  };
}

export interface SingleProductResponse {
  success: boolean;
  message?: string;
  data: {
    product: Product;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  description: string;
  sku: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  category: string;
  subcategory?: string;
  tags?: string[];
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  features?: string[];
  specifications?: Record<string, string>;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass?: 'light' | 'standard' | 'heavy' | 'oversized';
  metaTitle?: string;
  metaDescription?: string;
  supplier?: {
    name: string;
    contact: string;
    email: string;
  };
  warranty?: string;
  isFeatured?: boolean;
  isOnSale?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  _id?: string;
  id?: string;
}

// Product API functions
export const productAPI = {
  // Get all products with filtering and pagination
  getProducts: async (filters: ProductFilters = {}): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<ProductResponse> => {
    const response = await api.get(`/products/featured?limit=${limit}`);
    return response.data;
  },

  // Get products on sale
  getOnSaleProducts: async (limit: number = 12): Promise<ProductResponse> => {
    const response = await api.get(`/products/on-sale?limit=${limit}`);
    return response.data;
  },

  // Get product categories
  getCategories: async (): Promise<{ success: boolean; data: { categories: string[] } }> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, limit: number = 20): Promise<ProductResponse> => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<SingleProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (Admin only)
  createProduct: async (productData: CreateProductData): Promise<SingleProductResponse> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (Admin only)
  updateProduct: async (productData: UpdateProductData): Promise<SingleProductResponse> => {
    const { _id, id, ...updateData } = productData;
    const productId = _id || id;
    if (!productId) {
      throw new Error('Product ID is required for update');
    }

    try {
      const response = await api.put(`/products/${productId}`, updateData);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (error: any) {

      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to update product');
      }
      throw error;
    }
  },

  // Delete product (Admin only)
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Toggle product status (Admin only)
  toggleProductStatus: async (id: string, isActive: boolean): Promise<SingleProductResponse> => {
    const response = await api.patch(`/products/${id}/toggle-status`, { isActive });
    return response.data;
  },

  // Update product stock (Admin only)
  updateProductStock: async (
    id: string, 
    stock: number, 
    operation: 'set' | 'increase' | 'decrease' = 'set'
  ): Promise<{ success: boolean; message: string; data: { product: { id: string; name: string; stock: number; isInStock: boolean } } }> => {
    const response = await api.patch(`/products/${id}/stock`, { stock, operation });
    return response.data;
  },

  // Get all products for admin (including inactive)
  getAdminProducts: async (filters: ProductFilters = {}): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/products/admin/all?${params.toString()}`);
    return response.data;
  },

};

// Helper functions for common operations
export const productHelpers = {
  // Get primary image URL
  getPrimaryImage: (product: Product): string => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return '/placeholder-product.jpg';
    }
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url || '/placeholder-product.jpg';
  },

  // Calculate discount percentage
  getDiscountPercentage: (product: Product): number => {
    if (product.originalPrice && product.originalPrice > product.price && product.price > 0) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  },

  // Check if product is on sale
  isOnSale: (product: Product): boolean => {
    return Boolean(product.isOnSale && product.originalPrice && product.originalPrice > product.price);
  },

  // Format price with currency
  formatPrice: (price: number): string => {
    // Format with thousand separators and always show "LKR" prefix
    const formattedNumber = new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
    return `LKR ${formattedNumber}`;
  },

  // Get stock status
  getStockStatus: (product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (typeof product.stock !== 'number' || product.stock === 0) return 'out_of_stock';
    if (typeof product.lowStockThreshold !== 'number' || product.stock <= product.lowStockThreshold) return 'low_stock';
    return 'in_stock';
  },

  // Filter products by category
  filterByCategory: (products: Product[], category: string): Product[] => {
    if (!category || category === 'all') return products;
    return products.filter(product => product.category === category);
  },

  // Sort products
  sortProducts: (products: Product[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Product[] => {
    const sorted = [...products].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product];
      let bValue: any = b[sortBy as keyof Product];

      // Handle nested properties
      if (sortBy === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortBy === 'rating') {
        // Rating property doesn't exist in Product interface, use 0 as default
        aValue = 0;
        bValue = 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  },

  // Search products locally
  searchProductsLocal: (products: Product[], query: string): Product[] => {
    if (!query.trim()) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
};

export default productAPI;
