import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store';
import { useNavigate } from 'react-router-dom';
import { chatAPI, chatHelpers, Notification } from '../services/api/chatAPI';
import { 
  BellIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingCartIcon,
  CheckIcon,
  ClockIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await chatAPI.getNotifications(1, 50, false);
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch on mount and set up auto-refresh
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Refresh notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await chatAPI.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await chatAPI.markAllNotificationsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.type === 'order' || notification.type === 'payment') {
      navigate('/orders');
    } else if (notification.type === 'message_reply') {
      navigate('/contact');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCartIcon className="w-6 h-6 text-blue-500" />;
      case 'payment':
        return <ExclamationTriangleIcon className="w-6 h-6 text-green-500" />;
      case 'message_reply':
        return <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'border-l-red-500 bg-red-50';
    }
    
    switch (type) {
      case 'order':
        return 'border-l-blue-500 bg-blue-50';
      case 'payment':
        return 'border-l-green-500 bg-green-50';
      case 'message_reply':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'important') return notification.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.priority === 'high').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <BellIcon className="mx-auto h-16 w-16 text-gray-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view notifications</h2>
          <p className="text-gray-500 mb-8">
            Create an account or sign in to receive and manage your notifications.
          </p>
          <div className="space-y-4">
            <a href="/login" className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-center block">
              Sign In
            </a>
            <a href="/register" className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-center block">
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Your <span className="text-blue-400">Notifications</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Stay updated with your orders, promotions, and account activity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-20">
        {/* Header with Stats and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              <div className="text-sm text-gray-500">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{importantCount}</div>
              <div className="text-sm text-gray-500">Important</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchNotifications();
                toast.success('Notifications refreshed!');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'important', label: 'Important', count: importantCount }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-100/80'
                }`}
              >
                {filterOption.label}
                <span className="ml-2 px-2 py-1 bg-gray-50/20 rounded-full text-xs">
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-20">
            <ArrowPathIcon className="mx-auto h-24 w-24 text-gray-400 mb-6 animate-spin" />
            <h2 className="text-2xl font-semibold text-gray-700">Loading notifications...</h2>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <BellIcon className="mx-auto h-24 w-24 text-gray-500 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {filter === 'all' ? 'No notifications yet' : 
               filter === 'unread' ? 'No unread notifications' : 'No important notifications'}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === 'all' ? 'You\'re all caught up! Check back later for updates.' :
               filter === 'unread' ? 'All notifications have been read.' : 'No important notifications at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`card border-l-4 ${getNotificationColor(notification.type, notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-blue-500/20' : ''
                } cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="card-content">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-500 mt-1 mb-3">
                            {notification.content}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{chatHelpers.formatNotificationTime(notification.createdAt)}</span>
                          </div>
                          {notification.priority === 'high' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                              Important
                            </span>
                          )}
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
