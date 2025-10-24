import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  EyeIcon, 
  TagIcon,
  ArrowLeftIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FireIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { promoCodeAPI, PromoCode, CreatePromoCodeData, UpdatePromoCodeData } from '../../services/api/promoCodeAPI';
import toast from 'react-hot-toast';

const PromoCodeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState<CreatePromoCodeData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    minimumOrderAmount: 0,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await promoCodeAPI.getPromoCodes();
      setPromoCodes(response.data.promoCodes);
    } catch (error) {

      toast.error('Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async () => {
    try {
      await promoCodeAPI.createPromoCode(formData);
      toast.success('Promo code created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create promo code');
    }
  };

  const handleEditPromoCode = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      name: promoCode.name,
      description: promoCode.description || '',
      type: promoCode.type,
      value: promoCode.value,
      minimumOrderAmount: promoCode.minimumOrderAmount,
      validUntil: promoCode.validUntil.split('T')[0]
    });
    // Edit mode is handled by modalType state
    setShowEditModal(true);
  };

  const handleViewPromoCode = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setShowViewModal(true);
  };

  const handleUpdatePromoCode = async () => {
    if (!selectedPromoCode) return;
    
    try {
      const updateData: UpdatePromoCodeData = { ...formData };
      await promoCodeAPI.updatePromoCode(selectedPromoCode._id, updateData);
      toast.success('Promo code updated successfully');
      setShowEditModal(false);
      setSelectedPromoCode(null);
      resetForm();
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update promo code');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await promoCodeAPI.togglePromoCode(id);
      toast.success(`Promo code ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchPromoCodes();
    } catch (error: any) {
      toast.error('Failed to toggle promo code status');
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code? This action cannot be undone.')) return;
    
    try {
      await promoCodeAPI.deletePromoCode(id);
      toast.success('Promo code deleted successfully');
      fetchPromoCodes();
    } catch (error: any) {

      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete promo code';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimumOrderAmount: 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return '📊';
      case 'fixed': return '💰';
      case 'free_shipping': return '🚚';
      default: return '🏷️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fixed': return 'bg-green-100 text-green-800 border-green-200';
      case 'free_shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPromoCodes = promoCodes.filter(promoCode => {
    const matchesSearch = promoCode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promoCode.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || promoCode.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && promoCode.isActive) ||
                         (filterStatus === 'inactive' && !promoCode.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading promo codes...</p>
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
              <span className="text-gray-900 font-medium">Promo Code Management</span>
            </nav>
          </div>
          
          <div className="py-6">
            {/* Mobile Navigation */}
            <div className="mb-4 md:hidden">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Promo Code Management</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
              </div>
              {/* Mobile Create Button - iOS 26 Glassy */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full relative backdrop-blur-2xl bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-2xl border-2 border-white/40 hover:border-white/60 shadow-[0_8px_32px_0_rgba(59,130,246,0.37)] hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.5)] transition-all duration-300 transform hover:scale-105 font-semibold flex items-center justify-center overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <PlusIcon className="w-5 h-5 mr-2 relative z-10 text-white" />
                <span className="relative z-10 text-white">Create Promo Code</span>
              </button>
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
                    <TagIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Promo Code Management
                  </h1>
                  <p className="text-gray-600 mt-1">Create and manage promotional codes and discounts</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Promo Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards - iOS 26 Glassy Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 border-2 border-white/60 hover:border-blue-200/60 p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Promo Codes</p>
                <p className="text-2xl font-bold text-gray-900">{promoCodes.length}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 border-2 border-white/60 hover:border-green-200/60 p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-gray-900">{promoCodes.filter(p => p.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/20 border-2 border-white/60 hover:border-yellow-200/60 p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 shadow-lg shadow-yellow-500/50 group-hover:scale-110 transition-transform duration-300">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">{promoCodes.reduce((sum, p) => sum + p.usedCount, 0)}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 border-2 border-white/60 hover:border-purple-200/60 p-6 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Codes</p>
                <p className="text-2xl font-bold text-gray-900">{promoCodes.filter(p => new Date(p.validUntil) < new Date()).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search promo codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="code">Code</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Promo Codes Grid */}
        <div className="space-y-6">
          {filteredPromoCodes.length === 0 ? (
            <div className="text-center py-12 backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60">
              <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Promo Codes Found</h3>
              <p className="text-gray-600">Use the "Create Promo Code" button above to add promo codes.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPromoCodes.map((promoCode) => (
                <div key={promoCode._id} className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getTypeIcon(promoCode.type)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{promoCode.name}</h3>
                          <p className="text-sm text-gray-600 font-mono">{promoCode.code}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border-2 shadow-sm ${getTypeColor(promoCode.type)}`}>
                          {promoCode.type.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl shadow-sm ${
                          promoCode.isActive 
                            ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-2 border-green-300' 
                            : 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-300'
                        }`}>
                          {promoCode.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promoCode.description || 'No description'}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-white/60 rounded-xl border border-blue-100/50 shadow-sm">
                        <div className="text-xl font-bold text-blue-600">
                          {promoCode.type === 'percentage' ? `${promoCode.value}%` : 
                           promoCode.type === 'fixed' ? `$${promoCode.value}` : 
                           'Free'}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Discount</div>
                      </div>
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-white/60 rounded-xl border border-green-100/50 shadow-sm">
                        <div className="text-xl font-bold text-green-600">{promoCode.usedCount}</div>
                        <div className="text-xs text-gray-600 font-medium">Times Used</div>
                      </div>
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-white/60 rounded-xl border border-purple-100/50 shadow-sm">
                        <div className="text-xl font-bold text-purple-600">${promoCode.minimumOrderAmount}</div>
                        <div className="text-xs text-gray-600 font-medium">Min Order</div>
                      </div>
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-white/60 rounded-xl border border-blue-100/50 shadow-sm">
                        <div className="text-xl font-bold text-blue-600">
                          {new Date(promoCode.validUntil).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Valid Until</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(promoCode._id, promoCode.isActive)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110 ${
                            promoCode.isActive 
                              ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 hover:from-orange-200 hover:to-orange-300' 
                              : 'bg-gradient-to-br from-green-100 to-green-200 text-green-600 hover:from-green-200 hover:to-green-300'
                          }`}
                          title={promoCode.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {promoCode.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </button>
                    <button
                      onClick={() => handleViewPromoCode(promoCode)}
                          className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 hover:from-blue-200 hover:to-blue-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                      title="View Details"
                    >
                          <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditPromoCode(promoCode)}
                          className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                      title="Edit"
                    >
                          <PencilIcon className="h-4 w-4" />
                    </button>
                      </div>
                    <button 
                      onClick={() => handleDeletePromoCode(promoCode._id)}
                        className="p-2.5 bg-gradient-to-br from-red-100 to-red-200 text-red-600 hover:from-red-200 hover:to-red-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                      title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Back Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Go Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Create Modal - iOS 26 Glassy Style */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500/90 to-purple-600/90 shadow-lg shadow-blue-500/50 mr-3">
                  <TagIcon className="w-6 h-6 text-white" />
                </div>
                Create New Promo Code
              </h3>
              <p className="text-gray-600 mt-2 ml-14">Create a new promotional code for your customers</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/30">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder="SAVE20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder="20% Off Sale"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    rows={3}
                    placeholder="Get 20% off your entire order"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5rem',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Value</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Minimum Order</label>
                    <input
                      type="number"
                      value={formData.minimumOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200/50 bg-gradient-to-br from-white/30 to-gray-50/50 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                className="px-6 py-3 text-gray-700 backdrop-blur-xl bg-gray-100/80 rounded-2xl hover:bg-gray-200/80 transition-all shadow-sm hover:shadow-md font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePromoCode}
                className="px-6 py-3 backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                  >
                Create Promo Code
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - iOS 26 Glassy Style */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="p-2 rounded-2xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 shadow-lg shadow-green-500/50 mr-3">
                  <PencilIcon className="w-6 h-6 text-white" />
                </div>
                Edit Promo Code
              </h3>
              <p className="text-gray-600 mt-2 ml-14">Update the promotional code details</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/30">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder="SAVE20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder="20% Off Sale"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    rows={3}
                    placeholder="Get 20% off your entire order"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order</label>
                    <input
                      type="number"
                      value={formData.minimumOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200/50 bg-gradient-to-br from-white/30 to-gray-50/50 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPromoCode(null);
                      resetForm();
                    }}
                className="px-6 py-3 text-gray-700 backdrop-blur-xl bg-gray-100/80 rounded-2xl hover:bg-gray-200/80 transition-all shadow-sm hover:shadow-md font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePromoCode}
                className="px-6 py-3 backdrop-blur-xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                  >
                Update Promo Code
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPromoCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <EyeIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Promo Code Details
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPromoCode(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">View detailed information about this promotional code</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-100 p-3 rounded-lg">
                      {selectedPromoCode.code}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedPromoCode.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPromoCode.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPromoCode.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPromoCode.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(selectedPromoCode.type)}`}>
                      {selectedPromoCode.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedPromoCode.type === 'percentage' ? `${selectedPromoCode.value}%` : 
                       selectedPromoCode.type === 'fixed' ? `$${selectedPromoCode.value}` : 
                       'Free Shipping'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      ${selectedPromoCode.minimumOrderAmount.toFixed(2)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedPromoCode.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Count</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedPromoCode.usedCount} / {selectedPromoCode.usageLimit === -1 ? '∞' : selectedPromoCode.usageLimit}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedPromoCode.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement;
