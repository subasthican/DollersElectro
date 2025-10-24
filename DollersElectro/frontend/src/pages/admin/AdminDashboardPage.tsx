import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../../store';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import { 
  ChartBarIcon, 
  CubeIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  AcademicCapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  // Session management
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Authentication and role check
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Session management
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const startSessionTimeout = () => {
      timeoutId = setTimeout(() => {
        setShowSessionWarning(true);
        setSessionTimeout(60); // 60 second countdown
      }, 1740000); // 29 minutes
    };

    // Start initial timeout
    startSessionTimeout();

    // Reset session on user activity
    const resetSession = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      startSessionTimeout();
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetSession);
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetSession);
      });
    };
  }, []);

  // Session countdown
  useEffect(() => {
    if (sessionTimeout !== null && sessionTimeout > 0) {
      const countdown = setInterval(() => {
        setSessionTimeout(prev => {
          if (prev && prev <= 1) {
            // Session expired, logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            toast.error('Session expired. Please login again.');
            navigate('/login');
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [sessionTimeout, navigate]);

  // Extend session
  const extendSession = () => {
    setShowSessionWarning(false);
    setSessionTimeout(null);
    toast.success('Session extended successfully!');
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const adminSections = [
    {
      id: 'products',
      title: 'Product Management',
      description: 'Add, edit, and manage products in your catalog',
      icon: CubeIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      route: '/admin/products'
    },
    {
      id: 'orders',
      title: 'Order Management',
      description: 'View and manage customer orders',
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      route: '/admin/orders'
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'Manage customer accounts and information',
      icon: UsersIcon,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      route: '/admin/customers'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'View sales reports and business insights',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      route: '/admin/analytics'
    },
    {
      id: 'messages',
      title: 'Contact Messages',
      description: 'Manage customer inquiries and support requests',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      route: '/admin/messages'
    },
    {
      id: 'delivery',
      title: 'Delivery Management',
      description: 'Track and manage order deliveries',
      icon: TruckIcon,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      route: '/admin/delivery'
    },
    {
      id: 'promo-codes',
      title: 'Promo Code Management',
      description: 'Create and manage promotional codes and discounts',
      icon: TagIcon,
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      route: '/admin/promo-codes'
    },
    {
      id: 'quiz',
      title: 'Quiz Management',
      description: 'Create and manage quizzes for electrical knowledge',
      icon: AcademicCapIcon,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      route: '/admin/quiz-management'
    },
    {
      id: 'employees',
      title: 'Employee Management',
      description: 'Manage employee accounts and permissions',
      icon: UserGroupIcon,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      route: '/admin/employees'
    }
  ];

  const handleSectionClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, Admin</span>
              <NotificationCenter />
              <button 
                onClick={handleLogout}
                className="px-5 py-2.5 backdrop-blur-2xl bg-gradient-to-br from-red-500/90 to-red-600/90 hover:from-red-600/95 hover:to-red-700/95 text-white rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-red-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Admin Dashboard
              </h2>
              <p className="text-lg text-gray-600">
                Manage your DollersElectro business operations from one central location.
              </p>
            </div>
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
              v3.0 - Updated
            </div>
          </div>
        </div>

        {/* Admin Sections Grid - iOS 26 Glassy Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            const colorMap: { [key: string]: { gradient: string; shadow: string; border: string } } = {
              'bg-blue-500': { gradient: 'from-blue-500/90 to-blue-600/90', shadow: 'shadow-blue-500/20 hover:shadow-blue-500/40', border: 'hover:border-blue-200/60' },
              'bg-green-500': { gradient: 'from-green-500/90 to-green-600/90', shadow: 'shadow-green-500/20 hover:shadow-green-500/40', border: 'hover:border-green-200/60' },
              'bg-purple-500': { gradient: 'from-purple-500/90 to-purple-600/90', shadow: 'shadow-purple-500/20 hover:shadow-purple-500/40', border: 'hover:border-purple-200/60' },
              'bg-orange-500': { gradient: 'from-orange-500/90 to-orange-600/90', shadow: 'shadow-orange-500/20 hover:shadow-orange-500/40', border: 'hover:border-orange-200/60' },
              'bg-pink-500': { gradient: 'from-pink-500/90 to-pink-600/90', shadow: 'shadow-pink-500/20 hover:shadow-pink-500/40', border: 'hover:border-pink-200/60' },
              'bg-indigo-500': { gradient: 'from-indigo-500/90 to-indigo-600/90', shadow: 'shadow-indigo-500/20 hover:shadow-indigo-500/40', border: 'hover:border-indigo-200/60' },
              'bg-teal-500': { gradient: 'from-teal-500/90 to-teal-600/90', shadow: 'shadow-teal-500/20 hover:shadow-teal-500/40', border: 'hover:border-teal-200/60' },
              'bg-yellow-500': { gradient: 'from-yellow-500/90 to-yellow-600/90', shadow: 'shadow-yellow-500/20 hover:shadow-yellow-500/40', border: 'hover:border-yellow-200/60' },
              'bg-cyan-500': { gradient: 'from-cyan-500/90 to-cyan-600/90', shadow: 'shadow-cyan-500/20 hover:shadow-cyan-500/40', border: 'hover:border-cyan-200/60' },
              'bg-gray-500': { gradient: 'from-gray-500/90 to-gray-600/90', shadow: 'shadow-gray-500/20 hover:shadow-gray-500/40', border: 'hover:border-gray-200/60' }
            };
            const colors = colorMap[section.color];
            
            return (
              <div
                key={section.id}
                className={`group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl ${colors.shadow} border-2 border-white/60 ${colors.border} transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden relative`}
                onClick={() => handleSectionClick(section.route)}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="p-6 relative z-10">
                  <div className="flex items-start space-x-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity - iOS 26 Glassy Style */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors">
                  <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700 flex-1">New order #ORD-001 received</span>
                  <span className="text-xs text-gray-500 font-medium">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                  <span className="text-sm font-medium text-gray-700 flex-1">Product "Smart LED Bulb" stock updated</span>
                  <span className="text-xs text-gray-500 font-medium">15 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors">
                  <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
                  <span className="text-sm font-medium text-gray-700 flex-1">New customer registration</span>
                  <span className="text-xs text-gray-500 font-medium">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Session Warning Modal - iOS 26 Glassy Style */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 p-8 max-w-md w-full mx-4 transform scale-100 animate-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400/90 to-yellow-500/90 shadow-xl shadow-yellow-500/50 mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Session Expiring Soon</h3>
              <p className="text-sm font-medium text-gray-700 mb-6">
                Your session will expire in <span className="font-bold text-red-600 text-lg">{sessionTimeout}</span> seconds. Would you like to extend your session?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={extendSession}
                  className="flex-1 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Extend Session
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 backdrop-blur-2xl bg-white/80 hover:bg-white/90 text-gray-700 px-6 py-3 rounded-2xl shadow-xl border-2 border-gray-200/60 hover:border-gray-300/60 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Logout Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
