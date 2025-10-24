import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { lowStockAlertsAPI } from '../../services/api/lowStockAlertsAPI';
import toast from 'react-hot-toast';

interface LowStockAlert {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
  };
  currentStock: number;
  threshold: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  alertType: 'low_stock' | 'out_of_stock' | 'reorder_point';
  createdAt: string;
  urgencyScore: number;
  ageInDays: number;
}

interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const LowStockAlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<LowStockAlert | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await lowStockAlertsAPI.getDashboard();
      setAlerts(response.data.activeAlerts);
      setStats(response.data.stats);
    } catch (error) {

      toast.error('Failed to load low stock alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve' | 'dismiss', notes?: string) => {
    setActionLoading(alertId);
    try {
      let response;
      switch (action) {
        case 'acknowledge':
          response = await lowStockAlertsAPI.acknowledgeAlert(alertId, notes);
          break;
        case 'resolve':
          response = await lowStockAlertsAPI.resolveAlert(alertId, notes);
          break;
        case 'dismiss':
          response = await lowStockAlertsAPI.dismissAlert(alertId, notes);
          break;
      }
      
      toast.success(response.message);
      fetchDashboardData();
      setSelectedAlert(null);
    } catch (error: any) {

      toast.error(error.response?.data?.message || `Failed to ${action} alert`);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'high': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'medium': return <ClockIcon className="h-4 w-4" />;
      case 'low': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
          <p className="text-gray-600">Monitor and manage inventory alerts</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards - iOS 26 Glassy Style */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-red-500/10 hover:shadow-red-500/20 border-2 border-white/60 hover:border-red-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/90 to-red-600/90 shadow-lg shadow-red-500/50 group-hover:scale-110 transition-transform duration-300">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 border-2 border-white/60 hover:border-orange-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/90 to-orange-600/90 shadow-lg shadow-orange-500/50 group-hover:scale-110 transition-transform duration-300">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/20 border-2 border-white/60 hover:border-yellow-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 shadow-lg shadow-yellow-500/50 group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.high}</p>
              </div>
            </div>
          </div>

          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 border-2 border-white/60 hover:border-green-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List - iOS 26 Glassy Style */}
      <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-white/30">
          <h3 className="text-lg font-bold text-gray-900">Active Alerts</h3>
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No active low stock alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                        {getPriorityIcon(alert.priority)}
                        <span className="ml-1">{alert.priority.toUpperCase()}</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {alert.ageInDays} day{alert.ageInDays !== 1 ? 's' : ''} ago
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      {alert.product.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      SKU: {alert.product.sku} • Category: {alert.product.category}
                    </p>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Current Stock: <span className="font-medium text-gray-900">{alert.currentStock}</span></span>
                      <span>Threshold: <span className="font-medium text-gray-900">{alert.threshold}</span></span>
                      <span>Urgency: <span className="font-medium text-gray-900">{alert.urgencyScore}/100</span></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Details
                    </button>
                    
                    <button
                      onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                      disabled={actionLoading === alert.id}
                      className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === alert.id ? 'Processing...' : 'Acknowledge'}
                    </button>
                    
                    <button
                      onClick={() => handleAlertAction(alert.id, 'resolve')}
                      disabled={actionLoading === alert.id}
                      className="px-3 py-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === alert.id ? 'Processing...' : 'Resolve'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Product Information</h4>
                  <p className="text-sm text-gray-600">{selectedAlert.product.name}</p>
                  <p className="text-sm text-gray-600">SKU: {selectedAlert.product.sku}</p>
                  <p className="text-sm text-gray-600">Category: {selectedAlert.product.category}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Stock Information</h4>
                  <p className="text-sm text-gray-600">Current Stock: {selectedAlert.currentStock}</p>
                  <p className="text-sm text-gray-600">Low Stock Threshold: {selectedAlert.threshold}</p>
                  <p className="text-sm text-gray-600">Alert Type: {selectedAlert.alertType}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Alert Details</h4>
                  <p className="text-sm text-gray-600">Priority: {selectedAlert.priority}</p>
                  <p className="text-sm text-gray-600">Urgency Score: {selectedAlert.urgencyScore}/100</p>
                  <p className="text-sm text-gray-600">Age: {selectedAlert.ageInDays} days</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Message</h4>
                  <p className="text-sm text-gray-600">{selectedAlert.message}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleAlertAction(selectedAlert.id, 'acknowledge')}
                  disabled={actionLoading === selectedAlert.id}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => handleAlertAction(selectedAlert.id, 'resolve')}
                  disabled={actionLoading === selectedAlert.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlertsDashboard;

