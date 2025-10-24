import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../../store';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import { 
  ArrowRightIcon,
  ClipboardDocumentListIcon, 
  KeyIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Authentication and role check
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'employee' && user?.role !== 'admin') {
      toast.error('Access denied. Employee or Admin privileges required.');
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const employeeSections = [
    {
      id: 'orders',
      title: 'Order Management',
      description: 'View and manage customer orders',
      icon: ClipboardDocumentListIcon,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      route: '/employee/orders'
    },
    {
      id: 'pickup-verification',
      title: 'Pickup Verification',
      description: 'Verify and complete customer order pickups using 4-digit codes',
      icon: KeyIcon,
      color: 'bg-violet-500',
      hoverColor: 'hover:bg-violet-600',
      route: '/employee/pickup-verification'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Employee Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, Employee</span>
              <NotificationCenter />
              <button 
                onClick={() => navigate('/employee/settings')}
                className="p-2.5 backdrop-blur-2xl bg-gradient-to-br from-gray-100/80 to-gray-200/80 hover:from-gray-200/90 hover:to-gray-300/90 text-gray-700 rounded-2xl shadow-md hover:shadow-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
                title="Account Settings"
              >
                <Cog8ToothIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Employee Dashboard
          </h2>
          <p className="text-lg text-gray-600">
            Manage your daily tasks, customer interactions, and business operations efficiently.
          </p>
        </div>

        {/* Employee Sections Grid - iOS 26 Glassy Style (Matching Admin Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeeSections.map((section) => {
            const Icon = section.icon;
            const colorMap: { [key: string]: { gradient: string; shadow: string; border: string } } = {
              'bg-cyan-500': { gradient: 'from-cyan-500/90 to-cyan-600/90', shadow: 'shadow-cyan-500/20 hover:shadow-cyan-500/40', border: 'hover:border-cyan-200/60' },
              'bg-violet-500': { gradient: 'from-violet-500/90 to-violet-600/90', shadow: 'shadow-violet-500/20 hover:shadow-violet-500/40', border: 'hover:border-violet-200/60' }
            };
            const colors = colorMap[section.color];
            
            return (
              <div
                key={section.id}
                className={`group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl ${colors.shadow} border-2 border-white/60 ${colors.border} transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden relative`}
                onClick={() => navigate(section.route)}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="p-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DollersElectro</h3>
              <p className="text-gray-600 mb-4">
                Leading the electrical industry with innovative solutions, exceptional quality, 
                and unwavering commitment to customer satisfaction since 2008.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-600 hover:text-gray-900">Home</a></li>
                <li><a href="/products" className="text-gray-600 hover:text-gray-900">Products</a></li>
                <li><a href="/about" className="text-gray-600 hover:text-gray-900">About</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/contact" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-gray-900">Contact Support</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-gray-900">Returns</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-gray-900">Warranty</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">
                © 2024 DollersElectro. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</a>
                <a href="/help" className="text-gray-600 hover:text-gray-900 text-sm">Terms of Service</a>
                <a href="/help" className="text-gray-600 hover:text-gray-900 text-sm">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmployeeDashboard;