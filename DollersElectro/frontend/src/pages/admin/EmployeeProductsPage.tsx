import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { addProduct, updateProduct, toggleProductStatus } from '../../store/slices/productSlice';
import { productAPI } from '../../services/api/productAPI';
import { Product } from '../../services/api/productAPI';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const EmployeeProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, categories, loading } = useAppSelector((state) => state.products);
  // Removed unused isAuthenticated and user variables

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    description: '',
    image: '',
    tags: [''],
    features: [''],
    specifications: {} as Record<string, string>,
    warranty: '',
    weight: '',
    shippingClass: 'standard' as 'light' | 'standard' | 'heavy' | 'oversized',
    isActive: true,
    isInStock: true,
    isFeatured: false,
    isOnSale: false
  });

  // Fetch products when component mounts
  useEffect(() => {
    const fetchEmployeeProducts = async () => {
      try {
        const response = await productAPI.getAdminProducts();
        dispatch({ type: 'products/setProducts', payload: response.data.products });
        
        // Also fetch categories if they're empty
        if (!categories || categories.length === 0) {
          try {
            const categoriesResponse = await productAPI.getCategories();
            dispatch({ type: 'products/setCategories', payload: categoriesResponse.data.categories });
          } catch (error) {

          }
        }
      } catch (error) {

        toast.error('Failed to fetch products');
      }
    };
    
    fetchEmployeeProducts();
  }, [dispatch, categories?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.isActive : !product.isActive
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (stockFilter === 'out-of-stock') return product.stock === 0;
        if (stockFilter === 'low-stock') return product.stock <= (product.lowStockThreshold || 10);
        if (stockFilter === 'in-stock') return product.stock > (product.lowStockThreshold || 10);
        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter, categoryFilter, stockFilter]);

  // Reset form
  const resetForm = () => {
    setProductForm({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
      lowStockThreshold: '',
      description: '',
      image: '',
      tags: [''],
      features: [''],
      specifications: {},
      warranty: '',
      weight: '',
      shippingClass: 'standard',
      isActive: true,
      isInStock: true,
      isFeatured: false,
      isOnSale: false
    });
  };

  // Open modal for adding/editing
  const openModal = (type: 'add' | 'edit', product?: Product) => {
    setModalType(type);
    if (type === 'edit' && product) {

      setEditingItem(product);
      
      // Ensure all fields have proper default values
      const formData = {
        name: product.name?.trim() || '',
        sku: product.sku?.trim() || '',
        category: product.category?.trim() || '',
        price: product.price ? product.price.toString() : '0',
        stock: product.stock ? product.stock.toString() : '0',
        lowStockThreshold: (product.lowStockThreshold || 10).toString(),
        description: product.description?.trim() || '',
        image: product.images?.[0]?.url || '',
        tags: Array.isArray(product.tags) && product.tags.length > 0 ? product.tags : [''],
        features: Array.isArray(product.features) && product.features.length > 0 ? product.features : [''],
        specifications: product.specifications && typeof product.specifications === 'object' ? product.specifications : {},
        warranty: product.warranty?.trim() || '',
        weight: product.weight ? product.weight.toString() : '0',
        shippingClass: product.shippingClass || 'standard',
        isActive: product.isActive !== undefined ? product.isActive : true,
        isInStock: product.isInStock !== undefined ? product.isInStock : true,
        isFeatured: product.isFeatured || false,
        isOnSale: product.isOnSale || false
      };

      setProductForm(formData);
    } else {
      setEditingItem(null);
      resetForm();
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields - only check what's actually missing
    const missingFields = [];
    if (!productForm.name?.trim()) missingFields.push('Name');
    if (!productForm.sku?.trim()) missingFields.push('SKU');
    if (!productForm.category?.trim()) missingFields.push('Category');
    if (!productForm.price?.trim()) missingFields.push('Price');
    if (!productForm.stock?.trim()) missingFields.push('Stock');
    
    if (missingFields.length > 0) {

      toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate category is one of the allowed values
    const allowedCategories = ['Lighting', 'Tools', 'Electrical Panels', 'Cables', 'Switches', 'Sensors', 'Automation', 'Safety Equipment', 'Test Equipment'];
    if (!allowedCategories.includes(productForm.category.trim())) {
      toast.error(`Category must be one of: ${allowedCategories.join(', ')}`);
      return;
    }
    
    // Validate numeric fields
    if (isNaN(parseFloat(productForm.price)) || parseFloat(productForm.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    if (isNaN(parseInt(productForm.stock)) || parseInt(productForm.stock) < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    
    try {
      const productData = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim().toUpperCase(),
        category: productForm.category.trim(),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        lowStockThreshold: parseInt(productForm.lowStockThreshold),
        images: productForm.image?.trim() ? [{ url: productForm.image.trim(), alt: productForm.name.trim(), isPrimary: true }] : [{ url: 'https://via.placeholder.com/300x300?text=No+Image', alt: productForm.name.trim(), isPrimary: true }],
        description: productForm.description.trim() || 'No description provided',
        tags: productForm.tags.filter(tag => tag.trim() !== ''),
        features: productForm.features.filter(feature => feature.trim() !== ''),
        specifications: productForm.specifications || {},
        warranty: productForm.warranty.trim() || '1 Year Limited',
        weight: parseFloat(productForm.weight) || 0,
        shippingClass: productForm.shippingClass,
        isActive: productForm.isActive,
        isInStock: productForm.isInStock,
        isFeatured: productForm.isFeatured,
        isOnSale: productForm.isOnSale
      };

      if (modalType === 'add') {
        const response = await productAPI.createProduct(productData);
        if (response.success) {
          toast.success('Product added successfully!');
          dispatch(addProduct(response.data.product));
          closeModal();
        }
      } else {
        if (editingItem) {
          const productId = editingItem.id || editingItem._id;

          const response = await productAPI.updateProduct({ ...productData, id: productId, _id: productId });

          if (response.success) {
            toast.success('Product updated successfully!');
            dispatch(updateProduct(response.data.product));
            closeModal();
          } else {
            toast.error(response.message || 'Failed to update product');
          }
        }
      }
    } catch (error: any) {

      const errorMessage = error.message || error.response?.data?.message || 'Failed to save product';
      toast.error(`Save failed: ${errorMessage}`);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const response = await productAPI.deleteProduct(productId);
        if (response.success) {
          toast.success('Product deleted successfully!');
          // Refresh products
          const productsResponse = await productAPI.getAdminProducts({});
          dispatch({ type: 'products/setProducts', payload: productsResponse.data.products });
        }
      } catch (error) {

        toast.error('Failed to delete product');
      }
    }
  };

  // Handle toggle product status
  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await productAPI.toggleProductStatus(productId, !currentStatus);
      if (response.success) {
        toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        dispatch(toggleProductStatus({ id: productId, isActive: !currentStatus }));
      }
    } catch (error) {

      toast.error('Failed to toggle product status');
    }
  };

  // Handle bulk operations
  const handleBulkActivate = async () => {
    const inactiveProducts = filteredProducts.filter(p => !p.isActive);
    if (inactiveProducts.length === 0) {
      toast('No inactive products to activate');
      return;
    }

    try {
              await Promise.all(inactiveProducts.map(p => productAPI.toggleProductStatus(p.id || p._id || '', true)));
      toast.success(`${inactiveProducts.length} products activated successfully!`);
      // Refresh products
      const productsResponse = await productAPI.getAdminProducts({});
      dispatch({ type: 'products/setProducts', payload: productsResponse.data.products });
    } catch (error) {

      toast.error('Failed to bulk activate products');
    }
  };

  const handleBulkDeactivate = async () => {
    const activeProducts = filteredProducts.filter(p => p.isActive);
    if (activeProducts.length === 0) {
      toast('No active products to deactivate');
      return;
    }

    try {
              await Promise.all(activeProducts.map(p => productAPI.toggleProductStatus(p.id || p._id || '', false)));
      toast.success(`${activeProducts.length} products deactivated successfully!`);
      // Refresh products
      const productsResponse = await productAPI.getAdminProducts({});
      dispatch({ type: 'products/setProducts', payload: productsResponse.data.products });
    } catch (error) {

      toast.error('Failed to bulk deactivate products');
    }
  };

  // Add/remove form fields
  const addFormField = (field: 'tags' | 'features') => {
    setProductForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeFormField = (field: 'tags' | 'features', index: number) => {
    setProductForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateFormField = (field: 'tags' | 'features', index: number, value: string) => {
    setProductForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Add/remove specification fields
  const addSpecification = () => {
    setProductForm(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [`spec_${Date.now()}`]: '' }
    }));
  };

  const removeSpecification = (key: string) => {
    setProductForm(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const updateSpecification = (key: string, value: string) => {
    setProductForm(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <div className="py-4 border-b border-white/40">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/employee')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Employee Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Product Management</span>
            </nav>
          </div>
          
          <div className="py-6">
            {/* Mobile Navigation */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Product Management</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <CubeIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Product Management
                  </h1>
                  <p className="text-gray-600 mt-1">Manage products and inventory for the electrical equipment store</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => openModal('add')}
                  className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex space-x-3 md:hidden">
              <button
                onClick={() => openModal('add')}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards - iOS 26 Glassy Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 border-2 border-white/60 hover:border-blue-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                <CubeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 border-2 border-white/60 hover:border-green-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{products?.filter(p => p.isActive).length || 0}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-red-500/10 hover:shadow-red-500/20 border-2 border-white/60 hover:border-red-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/90 to-red-600/90 shadow-lg shadow-red-500/50 group-hover:scale-110 transition-transform duration-300">
                <XCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Products</p>
                <p className="text-2xl font-bold text-gray-900">{products?.filter(p => !p.isActive).length || 0}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/20 border-2 border-white/60 hover:border-yellow-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 shadow-lg shadow-yellow-500/50 group-hover:scale-110 transition-transform duration-300">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{products?.filter(p => p.stock <= (p.lowStockThreshold || 10)).length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - iOS 26 Glassy */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Categories</option>
                  {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="mt-4 flex items-center space-x-4 pt-4 border-t border-white/40">
            <button
              onClick={handleBulkActivate}
              className="px-6 py-3 font-semibold backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
            >
              ✅ Bulk Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="px-6 py-3 font-semibold backdrop-blur-2xl bg-gradient-to-br from-orange-500/90 to-orange-600/90 hover:from-orange-600/95 hover:to-orange-700/95 text-white rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
            >
              ⛔ Bulk Deactivate
            </button>
          </div>
        </div>

        {/* Products Table - iOS 26 Glassy */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/60 backdrop-blur-xl bg-gradient-to-r from-gray-50/80 to-white/60">
            <h3 className="text-xl font-bold text-gray-900">
              📦 Products ({filteredProducts.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <CubeIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-sm text-gray-500">
                          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || stockFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by creating a new product'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id || product._id || Math.random()} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images?.[0]?.url || '/placeholder-product.png'}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock === 0 ? 'bg-red-100 text-red-800' :
                            product.stock <= (product.lowStockThreshold || 10) ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {product.stock}
                          </span>
                          {product.stock <= (product.lowStockThreshold || 10) && product.stock > 0 && (
                            <ExclamationTriangleIcon className="ml-2 h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal('edit', product)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(product.id || product._id || '', product.isActive)}
                            className={`${
                              product.isActive ? 'text-blue-600 hover:text-orange-900 hover:bg-orange-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            } p-1 rounded`}
                            title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                          >
                            {product.isActive ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id || product._id || '')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Product"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-white/40/50 backdrop-blur-xl bg-gradient-to-r from-gray-50/80 to-white/60">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {modalType === 'add' ? '📦 Add New Product' : '✏️ Edit Product'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/60 transition-all duration-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5rem',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories && categories.length > 0 ? (
                      categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Lighting">Lighting</option>
                        <option value="Tools">Tools</option>
                        <option value="Electrical Panels">Electrical Panels</option>
                        <option value="Cables">Cables</option>
                        <option value="Switches">Switches</option>
                        <option value="Sensors">Sensors</option>
                        <option value="Automation">Automation</option>
                        <option value="Safety Equipment">Safety Equipment</option>
                        <option value="Test Equipment">Test Equipment</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="space-y-2">
                  {productForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateFormField('tags', index, e.target.value)}
                        className="flex-1 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFormField('tags', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFormField('tags')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Features</label>
                <div className="space-y-2">
                  {productForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFormField('features', index, e.target.value)}
                        className="flex-1 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFormField('features', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFormField('features')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Specifications</label>
                <div className="space-y-2">
                  {Object.entries(productForm.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Specification name"
                        value={key}
                        onChange={(e) => {
                          const newSpecs = { ...productForm.specifications };
                          delete newSpecs[key];
                          newSpecs[e.target.value] = value;
                          setProductForm(prev => ({ ...prev, specifications: newSpecs }));
                        }}
                        className="flex-1 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={value}
                        onChange={(e) => updateSpecification(key, e.target.value)}
                        className="flex-1 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Specification
                  </button>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warranty</label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm(prev => ({ ...prev, warranty: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.weight}
                    onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipping Class</label>
                  <select
                    value={productForm.shippingClass}
                    onChange={(e) => setProductForm(prev => ({ ...prev, shippingClass: e.target.value as any }))}
                    className="mt-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="standard">Standard</option>
                    <option value="heavy">Heavy</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.isInStock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, isInStock: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.isOnSale}
                    onChange={(e) => setProductForm(prev => ({ ...prev, isOnSale: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">On Sale</span>
                </label>
            </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {modalType === 'add' ? 'Add Product' : 'Update Product'}
                </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProductsPage;
