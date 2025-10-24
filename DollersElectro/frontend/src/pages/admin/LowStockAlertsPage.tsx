import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import LowStockAlertsDashboard from '../../components/admin/LowStockAlertsDashboard';

const LowStockAlertsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <span className="text-gray-900 font-medium">Low Stock Alerts</span>
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
              <h1 className="text-xl font-bold text-gray-900">Low Stock Alerts</h1>
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
                    <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-yellow-600" />
                    Low Stock Alerts
                  </h1>
                  <p className="text-gray-600 mt-1">Monitor and manage inventory alerts for low stock items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LowStockAlertsDashboard />
      </div>
    </div>
  );
};

export default LowStockAlertsPage;

