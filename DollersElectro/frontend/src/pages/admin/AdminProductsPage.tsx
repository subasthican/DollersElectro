import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { addProduct, updateProduct, toggleProductStatus, clearError } from '../../store/slices/productSlice';
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
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, categories, loading, error } = useAppSelector((state) => state.products);
  // Removed unused isAuthenticated and user variables

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
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
    taxRate: '8', // Default 8% tax
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

  // Image upload states
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Fetch products when component mounts
  useEffect(() => {
    const fetchAdminProducts = async () => {
      try {
        const response = await productAPI.getAdminProducts();
        
        // Update the products in the store
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
      }
    };
    
    fetchAdminProducts();
    }, [dispatch, categories?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter products based on search and status
  useEffect(() => {
    
    let filtered = products;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.isActive : !product.isActive
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter]);

  // Auto-dismiss error messages after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Image upload functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setEditingItem(null);
    setProductForm({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
      lowStockThreshold: '',
      description: '',
      image: '',
      taxRate: '8',
      tags: [''],
      features: [''],
      specifications: {} as Record<string, string>,
      warranty: '',
      weight: '',
      shippingClass: 'standard',
      isActive: true,
      isInStock: true,
      isFeatured: false,
      isOnSale: false
    });
    // Reset image upload states
    setImageUploadMethod('url');
    setSelectedFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {

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
      taxRate: (product as any).taxRate ? (product as any).taxRate.toString() : '8', // Default 8% if not set
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
    setModalType('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    // Reset image upload states
    setImageUploadMethod('url');
    setSelectedFile(null);
    setImagePreview('');
    setProductForm({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
      lowStockThreshold: '',
      description: '',
      image: '',
      taxRate: '8',
      tags: [''],
      features: [''],
      specifications: {} as Record<string, string>,
      warranty: '',
      weight: '',
      shippingClass: 'standard',
      isActive: true,
      isInStock: true,
      isFeatured: false,
      isOnSale: false
    });
  };

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
    
    if (modalType === 'add') {
      const newProductData = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim().toUpperCase(),
        category: productForm.category.trim(),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        lowStockThreshold: productForm.lowStockThreshold ? parseInt(productForm.lowStockThreshold) : 10,
        images: productForm.image?.trim() ? [{ url: productForm.image.trim(), alt: productForm.name.trim(), isPrimary: true }] : [{ url: 'https://via.placeholder.com/300x300?text=No+Image', alt: productForm.name.trim(), isPrimary: true }],
        description: productForm.description.trim() || 'No description provided',
        tags: productForm.tags.filter(t => t.trim() !== ''),
        features: productForm.features.filter(f => f.trim() !== ''),
        specifications: productForm.specifications || {},
        warranty: productForm.warranty.trim() || '1 Year Limited',
        weight: productForm.weight ? parseFloat(productForm.weight) : 0,
        shippingClass: productForm.shippingClass as 'light' | 'standard' | 'heavy' | 'oversized',
        isActive: productForm.isActive,
        isInStock: productForm.isInStock,
        isFeatured: productForm.isFeatured,
        isOnSale: productForm.isOnSale
      };

      try {

        const response = await productAPI.createProduct(newProductData);

        if (response.success) {
          toast.success('Product added successfully!');
          dispatch(addProduct(response.data.product));
          closeModal();
          
          // Refresh the admin products list to show new product
          const refreshResponse = await productAPI.getAdminProducts();
          dispatch({ type: 'products/setProducts', payload: refreshResponse.data.products });
        } else {
          toast.error(response.message || 'Failed to add product');
        }
      } catch (error: any) {

        const errorMessage = error.message || error.response?.data?.message || 'Failed to add product';
        toast.error(`Add failed: ${errorMessage}`);
      }
    } else {
      // Create update data object with only the fields that should be updated
      const updateData = {
        name: productForm.name,
        sku: productForm.sku,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        lowStockThreshold: productForm.lowStockThreshold ? parseInt(productForm.lowStockThreshold) : editingItem!.lowStockThreshold || 10,
        images: productForm.image ? [{ url: productForm.image, alt: productForm.name, isPrimary: true }] : editingItem!.images,
        description: productForm.description,
        tags: productForm.tags.filter(t => t.trim() !== ''),
        features: productForm.features.filter(f => f.trim() !== ''),
        specifications: productForm.specifications,
        warranty: productForm.warranty,
        weight: productForm.weight ? parseFloat(productForm.weight) : editingItem!.weight || 0,
        shippingClass: productForm.shippingClass as 'light' | 'standard' | 'heavy' | 'oversized',
        isActive: productForm.isActive,
        isInStock: productForm.isInStock,
        isFeatured: productForm.isFeatured,
        isOnSale: productForm.isOnSale
      };
      
      try {

        const productId = editingItem!.id || editingItem!._id;

        const response = await productAPI.updateProduct({ 
          ...updateData, 
          id: productId, 
          _id: productId 
        });

        if (response.success) {
          toast.success('Product updated successfully!');
          dispatch(updateProduct(response.data.product));
          closeModal();
          
          // Refresh the admin products list to show updated product
          const refreshResponse = await productAPI.getAdminProducts();
          dispatch({ type: 'products/setProducts', payload: refreshResponse.data.products });
        } else {
          toast.error(response.message || 'Failed to update product');
        }
      } catch (error: any) {

        const errorMessage = error.message || error.response?.data?.message || 'Failed to update product';
        toast.error(`Update failed: ${errorMessage}`);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY DELETE this product? This action cannot be undone and will remove the product completely from the database.')) {
      try {
        // Call the hard delete endpoint
        const response = await fetch(`http://localhost:5001/api/products/${productId}?hard=true`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Remove product from local state completely
          const updatedProducts = products?.filter(p => p._id !== productId && p.id !== productId) || [];
          dispatch({ type: 'products/setProducts', payload: updatedProducts });
          toast.success('Product permanently deleted from database!');
        } else {
          toast.error(result.message || 'Failed to delete product');
        }
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const confirmMessage = currentStatus 
      ? 'Are you sure you want to deactivate this product? It will be hidden from customers but can be reactivated later.'
      : 'Are you sure you want to activate this product? It will be visible to customers.';
    
    if (window.confirm(confirmMessage)) {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Please login again to perform this action');
          return;
        }

        await dispatch(toggleProductStatus({ id: productId, isActive: !currentStatus })).unwrap();
        toast.success(`Product ${action}d successfully!`);
        
        // Refresh the admin products list to show updated status
        const response = await productAPI.getAdminProducts();
        dispatch({ type: 'products/setProducts', payload: response.data.products });
      } catch (error: any) {

        const errorMessage = error.message || error.response?.data?.message || `Failed to ${action} product`;
        toast.error(errorMessage);
      }
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleFilterByStatus = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
  };

  const handleBulkActivate = async () => {
    try {
      const inactiveProducts = products?.filter(p => !p.isActive) || [];
      for (const product of inactiveProducts) {
        const productId = product.id || product._id;
        if (productId) {
          await dispatch(toggleProductStatus({ id: productId, isActive: true })).unwrap();
        }
      }
      toast.success('All products activated successfully!');
    } catch (error) {
      toast.error('Failed to activate some products');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const activeProducts = products?.filter(p => p.isActive) || [];
      for (const product of activeProducts) {
        const productId = product.id || product._id;
        if (productId) {
          await dispatch(toggleProductStatus({ id: productId, isActive: false })).unwrap();
        }
      }
      toast.success('All products deactivated successfully!');
    } catch (error) {
      toast.error('Failed to deactivate some products');
    }
  };

  const addFeatureField = () => {
    setProductForm({
      ...productForm,
      features: [...productForm.features, '']
    });
  };

  const removeFeatureField = (index: number) => {
    setProductForm({
      ...productForm,
      features: productForm.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...productForm.features];
    newFeatures[index] = value;
    setProductForm({
      ...productForm,
      features: newFeatures
    });
  };

  const addTagField = () => {
    setProductForm({
      ...productForm,
      tags: [...productForm.tags, '']
    });
  };

  const removeTagField = (index: number) => {
    setProductForm({
      ...productForm,
      tags: productForm.tags.filter((_, i) => i !== index)
    });
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...productForm.tags];
    newTags[index] = value;
    setProductForm({
      ...productForm,
      tags: newTags
    });
  };

  const addSpecification = () => {
    setProductForm({
      ...productForm,
      specifications: { ...productForm.specifications, '': '' }
    });
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...productForm.specifications };
    delete newSpecs[key];
    setProductForm({
      ...productForm,
      specifications: newSpecs
    });
  };

  const updateSpecification = (oldKey: string, newKey: string, value: string) => {
    const newSpecs = { ...productForm.specifications };
    if (oldKey !== newKey) {
      delete newSpecs[oldKey];
    }
    newSpecs[newKey] = value;
    setProductForm({
      ...productForm,
      specifications: newSpecs
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-2xl bg-white/80 rounded-3xl p-12 shadow-2xl border-2 border-white/60">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading products...</p>
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
          <div className="py-4 border-b border-gray-200">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Admin Dashboard
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
                  onClick={openAddModal}
                  className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Mobile Action Buttons - iOS 26 Glassy */}
            <div className="flex space-x-3 md:hidden">
              <button
                onClick={openAddModal}
                className="flex-1 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-4 py-2.5 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center justify-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="backdrop-blur-2xl bg-white/70 rounded-2xl shadow-xl shadow-blue-500/10 p-4 sm:p-6 border-2 border-white/60 hover:border-blue-200/60 transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <CubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-2xl bg-white/70 rounded-2xl shadow-xl shadow-green-500/10 p-4 sm:p-6 border-2 border-white/60 hover:border-green-200/60 transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{products?.filter(p => p.isActive).length || 0}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-2xl bg-white/70 rounded-2xl shadow-xl shadow-red-500/10 p-4 sm:p-6 border-2 border-white/60 hover:border-red-200/60 transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Inactive Products</p>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">{products?.filter(p => !p.isActive).length || 0}</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-2xl bg-white/70 rounded-2xl shadow-xl shadow-yellow-500/10 p-4 sm:p-6 border-2 border-white/60 hover:border-yellow-200/60 transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">{products?.filter(p => p.stock <= (p.lowStockThreshold || 10)).length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - Mobile Responsive */}
        <div className="backdrop-blur-2xl bg-white/70 rounded-2xl shadow-xl shadow-gray-400/30 p-4 sm:p-6 mb-6 border-2 border-white/60">
          <div className="flex flex-col sm:flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-full lg:w-48">
              <select 
                className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 font-medium"
                value={statusFilter}
                onChange={(e) => handleFilterByStatus(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/40">
            <button
              onClick={handleBulkActivate}
              className="flex-1 sm:flex-initial backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold text-xs sm:text-sm"
            >
              ✅ Activate All Inactive
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="flex-1 sm:flex-initial backdrop-blur-2xl bg-gradient-to-br from-red-500/90 to-red-600/90 hover:from-red-600/95 hover:to-red-700/95 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold text-xs sm:text-sm"
            >
              ❌ Deactivate All Active
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Products ({filteredProducts.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <CubeIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-sm text-gray-500">
                          {searchTerm || statusFilter !== 'all' 
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
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LKR {product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(product.id || product._id || '', product.isActive)}
                            className={`${
                              product.isActive 
                                ? 'text-blue-600 hover:text-orange-900 hover:bg-orange-50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            } p-1 rounded`}
                            title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                          >
                            {product.isActive ? (
                              <XCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProduct(product.id || product._id || '')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Permanently Delete Product"
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

      {/* Add/Edit Product Modal - iOS 26 Glassy Style */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
          <div className="relative my-8 w-full max-w-3xl backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {modalType === 'add' ? '✨ Add New Product' : '✏️ Edit Product'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SKU *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="Enter product SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5rem 1.5rem',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select category</option>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 resize-none"
                  placeholder="Enter product description"
                />
              </div>

              {/* Image Upload Section - URL Only */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/60 to-purple-50/60 border-2 border-white/40 rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-bold text-gray-800 mb-3">📸 Product Image</label>
                
                {/* URL Input Only */}
                <div>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/70 border-2 border-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/90 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="https://example.com/image.jpg or http://localhost:5001/uploads/products/image.jpg"
                  />
                  {productForm.image && (
                    <div className="mt-3 p-2 bg-white/60 rounded-lg border border-white/40">
                      <img 
                        src={productForm.image} 
                        alt="Preview" 
                        className="w-full h-32 object-contain rounded"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+URL'; }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Paste image URL from your uploads folder or any external source
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Warranty</label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="e.g., 1 year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Class</label>
                  <select
                    value={productForm.shippingClass}
                    onChange={(e) => setProductForm({ ...productForm, shippingClass: e.target.value as 'light' | 'standard' | 'heavy' | 'oversized' })}
                    className="block w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5rem 1.5rem',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="standard">Standard</option>
                    <option value="light">Light</option>
                    <option value="heavy">Heavy</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>
              </div>

              {/* Tax Rate Field */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/60 to-emerald-50/60 border-2 border-white/40 rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  💰 Tax Rate (%)
                  <span className="text-xs font-normal text-gray-600 bg-white/60 px-2 py-1 rounded-lg">Optional - Default: 8%</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={productForm.taxRate}
                    onChange={(e) => setProductForm({ ...productForm, taxRate: e.target.value })}
                    className="flex-1 block w-full backdrop-blur-xl bg-white/70 border-2 border-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/90 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-semibold"
                    placeholder="8"
                  />
                  <div className="text-2xl font-bold text-green-600">%</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  📌 Tax will be calculated at checkout based on this rate. Leave empty to use default 8% tax rate.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                      className="rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 w-5 h-5 transition-all duration-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.isInStock}
                      onChange={(e) => setProductForm({ ...productForm, isInStock: e.target.checked })}
                      className="rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 w-5 h-5 transition-all duration-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 w-5 h-5 transition-all duration-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.isOnSale}
                      onChange={(e) => setProductForm({ ...productForm, isOnSale: e.target.checked })}
                      className="rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 w-5 h-5 transition-all duration-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
                <div className="space-y-2">
                  {(productForm.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                        placeholder="Enter feature"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureField(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-blue-50/50 transition-all duration-300"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                <div className="space-y-2">
                  {(productForm.tags || []).map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                        placeholder="Enter tag"
                      />
                      <button
                        type="button"
                        onClick={() => removeTagField(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTagField}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-blue-50/50 transition-all duration-300"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specifications</label>
                <div className="space-y-2">
                  {Object.entries(productForm.specifications || {}).map(([key, value], index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateSpecification(key, e.target.value, value)}
                        className="flex-1 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                        placeholder="Specification name"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateSpecification(key, key, e.target.value)}
                        className="flex-1 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                        placeholder="Specification value"
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
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-blue-50/50 transition-all duration-300"
                  >
                    + Add Specification
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="backdrop-blur-2xl bg-white/80 hover:bg-white/90 text-gray-700 px-6 py-3 rounded-2xl shadow-xl border-2 border-gray-200/60 hover:border-gray-300/60 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  {modalType === 'add' ? '✨ Add Product' : '💾 Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Toast - Auto dismiss after 2 seconds */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
