import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  AcademicCapIcon,
  KeyIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const adminSections = [
    {
      id: 'products',
      title: 'Products Management',
      description: 'Add, edit, delete, and manage product inventory',
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      route: '/admin/products'
    },
    {
      id: 'customers',
      title: 'Customers Management',
      description: 'Manage customer accounts, status, and information',
      icon: UsersIcon,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      route: '/admin/customers'
    },
    {
      id: 'employees',
      title: 'Employees Management',
      description: 'Manage employee accounts, roles, and permissions',
      icon: UsersIcon,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      route: '/admin/employees'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'View business metrics, reports, and insights',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      route: '/admin/analytics'
    },
    {
      id: 'orders',
      title: 'Order Management',
      description: 'View and manage customer orders',
      icon: ClipboardDocumentListIcon,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      route: '/admin/orders'
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
      id: 'quiz-management',
      title: 'Quiz Management',
      description: 'Create and manage electrical knowledge quizzes and questions',
      icon: AcademicCapIcon,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      route: '/admin/quiz-management'
    },
    {
      id: 'pickup-verification',
      title: 'Pickup Verification',
      description: 'Verify and complete customer order pickups using 4-digit codes',
      icon: KeyIcon,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      route: '/admin/pickup-verification'
    }
  ];

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
                onClick={() => navigate('/admin/settings')}
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
            Welcome to Admin Dashboard
          </h2>
          <p className="text-lg text-gray-600">
            Manage your DollersElectro business operations from one central location.
          </p>
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
              'bg-red-500': { gradient: 'from-red-500/90 to-red-600/90', shadow: 'shadow-red-500/20 hover:shadow-red-500/40', border: 'hover:border-red-200/60' },
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

export default AdminPage;

