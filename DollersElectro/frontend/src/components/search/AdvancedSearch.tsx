import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import LiquidGlassButton from '../LiquidGlassButton';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  categories: string[];
  loading?: boolean;
}

interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  categories,
  loading = false
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    minPrice: 0,
    maxPrice: 10000,
    inStock: false,
    isFeatured: false,
    isOnSale: false,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const handleInputChange = (field: keyof SearchFilters, value: string | number | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange = [...priceRange];
    newRange[index] = value;
    setPriceRange(newRange);
    
    setFilters(prev => ({
      ...prev,
      minPrice: newRange[0],
      maxPrice: newRange[1]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 10000,
      inStock: false,
      isFeatured: false,
      isOnSale: false,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    
    setFilters(clearedFilters);
    setPriceRange([0, 10000]);
    onClear();
  };

  const hasActiveFilters = () => {
    return (
      filters.query ||
      filters.category !== 'all' ||
      filters.minPrice > 0 ||
      filters.maxPrice < 10000 ||
      filters.inStock ||
      filters.isFeatured ||
      filters.isOnSale ||
      filters.sortBy !== 'name' ||
      filters.sortOrder !== 'asc'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Search Products</h3>
          <div className="flex items-center gap-2">
            <LiquidGlassButton
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="dark"
              size="sm"
              icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
              iconPosition="left"
            >
              {showAdvanced ? 'Hide' : 'Show'} Filters
            </LiquidGlassButton>
            {hasActiveFilters() && (
              <LiquidGlassButton
                type="button"
                onClick={handleClear}
                variant="danger"
                size="sm"
                icon={<XMarkIcon className="h-4 w-4" />}
                iconPosition="left"
              >
                Clear All
              </LiquidGlassButton>
            )}
          </div>
        </div>

        {/* Basic Search */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-400 shadow-sm transition-all hover:border-gray-300"
              />
            </div>
          </div>
          <LiquidGlassButton
            type="submit"
            disabled={loading}
            variant="primary"
            size="md"
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            iconPosition="left"
          >
            {loading ? 'Searching...' : 'Search'}
          </LiquidGlassButton>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer hover:border-gray-300 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value) || 0)}
                    placeholder="Min"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-400 shadow-sm transition-all hover:border-gray-300"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value) || 10000)}
                    placeholder="Max"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-400 shadow-sm transition-all hover:border-gray-300"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  LKR {priceRange[0]} - LKR {priceRange[1]}
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer hover:border-gray-300 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="createdAt">Newest</option>
                <option value="reviewCount">Most Reviewed</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer hover:border-gray-300 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Filters
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleInputChange('inStock', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Products</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isOnSale}
                    onChange={(e) => handleInputChange('isOnSale', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">On Sale</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{filters.query}"
                  </span>
                )}
                {filters.category !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Category: {filters.category}
                  </span>
                )}
                {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Price: LKR {filters.minPrice} - LKR {filters.maxPrice}
                  </span>
                )}
                {filters.inStock && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    In Stock
                  </span>
                )}
                {filters.isFeatured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    Featured
                  </span>
                )}
                {filters.isOnSale && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    On Sale
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedSearch;
