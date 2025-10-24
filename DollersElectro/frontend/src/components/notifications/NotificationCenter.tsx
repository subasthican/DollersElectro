import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { chatAPI, chatHelpers, Notification } from '../../services/api/chatAPI';
import { toast } from 'react-hot-toast';
import {
  BellIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      console.log('👤 No user logged in, skipping notification fetch');
      return;
    }
    
    console.log('📬 Fetching notifications for user:', user.id, user.email);
    
    try {
      setIsLoading(true);
      const response = await chatAPI.getNotifications(1, 5, false); // Only fetch 5 latest notifications
      console.log('📬 Notification API response:', response);
      
      if (response.success) {
        console.log(`✅ Got ${response.data.notifications.length} notifications`);
        console.log(`   Unread count: ${response.data.unreadCount}`);
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      } else {
        console.warn('⚠️  Notification fetch returned success: false');
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await chatAPI.markNotificationRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {

      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await chatAPI.markAllNotificationsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {

      toast.error('Failed to mark all notifications as read');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Close notification panel
    setIsOpen(false);

    // Navigate based on notification type and user role
    const isAdmin = user?.role === 'admin';
    const isEmployee = user?.role === 'employee';
    const dashboardPrefix = isAdmin ? '/admin' : isEmployee ? '/employee' : '';
    
    // Get notification type as string for flexible comparison
    const notifType = notification.type as string;

    // Check notification title and content for keywords if type doesn't match exactly
    const titleLower = notification.title?.toLowerCase() || '';
    const contentLower = notification.content?.toLowerCase() || '';

    // Navigate based on notification type and content
    if (notifType === 'message_reply' || titleLower.includes('message')) {
      // For customers, go to "My Messages", for admin/employee go to messages management
      if (isAdmin || isEmployee) {
        navigate(`${dashboardPrefix}/messages`);
        toast.success('Opening messages...');
      } else {
        navigate('/my-messages');
        toast.success('Opening your messages...');
      }
    } else if (notifType === 'order' || titleLower.includes('order')) {
      // For customers, go to order history, for admin/employee go to orders management
      if (isAdmin || isEmployee) {
        navigate(`${dashboardPrefix}/orders`);
        toast.success('Opening orders...');
      } else {
        navigate('/orders');
        toast.success('Opening your orders...');
      }
    } else if (notifType === 'payment' || titleLower.includes('payment') || titleLower.includes('bill')) {
      // For customers, go to order history, for admin/employee go to orders management
      if (isAdmin || isEmployee) {
        navigate(`${dashboardPrefix}/orders`);
        toast.success('Opening payment verification...');
      } else {
        navigate('/orders');
        toast.success('Opening your orders...');
      }
    } else if (titleLower.includes('stock') || titleLower.includes('inventory')) {
      if (isAdmin) {
        navigate('/admin/low-stock-alerts');
      } else if (isEmployee) {
        navigate('/employee/products');
      }
      toast.success('Opening inventory...');
    } else if (titleLower.includes('customer')) {
      if (isAdmin) {
        navigate('/admin/customers');
        toast.success('Opening customers...');
      }
    } else if (titleLower.includes('employee')) {
      if (isAdmin) {
        navigate('/admin/employees');
        toast.success('Opening employees...');
      }
    } else if (titleLower.includes('delivery') || titleLower.includes('shipping')) {
      navigate(`${dashboardPrefix}/delivery`);
      toast.success('Opening delivery...');
    } else if (titleLower.includes('promo') || titleLower.includes('discount') || titleLower.includes('code')) {
      navigate(`${dashboardPrefix}/promo-codes`);
      toast.success('Opening promo codes...');
    } else {
      // Default: go to notifications page
      navigate(`${dashboardPrefix}/notifications`);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message_reply':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />;
      case 'status_update':
        return <InformationCircleIcon className="w-5 h-5 text-green-600" />;
      case 'priority_change':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />;
      case 'order':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'payment':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // Set up real-time updates
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Refresh notifications every 10 seconds (faster updates)
      const interval = setInterval(fetchNotifications, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Always render the bell icon for admin/employee dashboards
  return (
    <div className="relative">
      {/* Notification Bell - iOS Glassy Style */}
      <button
        onClick={() => {
          console.log('🔔 Notification bell clicked');
          console.log('   User:', user);
          console.log('   Is open:', isOpen);
          
          if (!user) {
            console.warn('⚠️  No user logged in');
            toast.error('Please log in to view notifications');
            return;
          }
          
          console.log('✅ Opening notification panel');
          // Refresh notifications when bell is clicked
          if (!isOpen) {
            fetchNotifications();
          }
          setIsOpen(!isOpen);
        }}
        className="relative p-3 text-gray-700 hover:text-gray-900 rounded-xl backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 group"
      >
        <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] shadow-lg shadow-blue-500/50 ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {/* Refresh Button */}
              <button
                onClick={() => {
                  fetchNotifications();
                  toast.success('Notifications refreshed!');
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-blue-50"
                title="Refresh notifications"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              chatHelpers.getPriorityColor(notification.priority)
                            }`}>
                              {notification.priority}
                            </span>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {chatHelpers.formatNotificationTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - View All Notifications */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false); // Close the dropdown
                  // Navigate based on user role
                  if (user?.role === 'admin') {
                    navigate('/admin/notifications');
                  } else if (user?.role === 'employee') {
                    navigate('/employee/notifications'); // Employee notifications page
                  } else {
                    navigate('/notifications'); // Customer notifications page
                  }
                }}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>View all notifications</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
