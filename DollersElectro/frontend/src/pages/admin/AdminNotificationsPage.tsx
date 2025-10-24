import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { chatAPI, chatHelpers, Notification } from '../../services/api/chatAPI';
import { 
  BellIcon, 
  XMarkIcon, 
  ShoppingCartIcon,
  CheckIcon,
  ClockIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const AdminNotificationsPage: React.FC = () => {
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
      navigate('/admin/orders');
    } else if (notification.type === 'message_reply') {
      navigate('/admin/messages');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCartIcon className="w-6 h-6 text-blue-500" />;
      case 'payment':
        return <CreditCardIcon className="w-6 h-6 text-green-500" />;
      case 'message_reply':
        return <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'border-l-red-500 bg-red-50/50';
    }
    
    switch (type) {
      case 'order':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'payment':
        return 'border-l-green-500 bg-green-50/50';
      case 'message_reply':
        return 'border-l-purple-500 bg-purple-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center backdrop-blur-2xl bg-white/70 rounded-3xl shadow-2xl border-2 border-white/60 p-8">
          <BellIcon className="mx-auto h-16 w-16 text-gray-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view notifications</h2>
          <p className="text-gray-500 mb-8">
            Please sign in as admin to view admin notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin')}
        className="fixed top-24 left-6 z-50 backdrop-blur-2xl bg-white/70 hover:bg-white/90 text-gray-700 px-4 py-2 rounded-2xl shadow-xl shadow-gray-400/30 hover:shadow-gray-500/50 border-2 border-white/60 hover:border-white/80 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center space-x-2"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header Section */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 shadow-xl shadow-gray-400/30 border-b-2 border-white/60">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all system and order notifications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats and Actions */}
        <div className="backdrop-blur-2xl bg-white/70 rounded-3xl shadow-xl shadow-gray-400/30 border-2 border-white/60 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  {notifications.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {unreadCount}
                </div>
                <div className="text-sm text-gray-600 font-medium">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  {importantCount}
                </div>
                <div className="text-sm text-gray-600 font-medium">Important</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  fetchNotifications();
                  toast.success('Notifications refreshed!');
                }}
                className="px-4 py-2 backdrop-blur-2xl bg-white/70 hover:bg-white/90 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl border-2 border-white/60 hover:border-white/80 transition-all duration-300 font-semibold flex items-center space-x-2"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-white/60 hover:border-white/80 transition-all duration-300 font-semibold flex items-center space-x-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex space-x-2">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'important', label: 'Important', count: importantCount }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === filterOption.key
                    ? 'backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white shadow-lg'
                    : 'backdrop-blur-2xl bg-white/70 text-gray-600 hover:bg-white/90'
                }`}
              >
                {filterOption.label}
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-20 backdrop-blur-2xl bg-white/70 rounded-3xl shadow-xl border-2 border-white/60">
            <ArrowPathIcon className="mx-auto h-24 w-24 text-blue-500 mb-6 animate-spin" />
            <h2 className="text-2xl font-semibold text-gray-700">Loading notifications...</h2>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 backdrop-blur-2xl bg-white/70 rounded-3xl shadow-xl border-2 border-white/60">
            <BellIcon className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {filter === 'all' ? 'No notifications yet' : 
               filter === 'unread' ? 'No unread notifications' : 'No important notifications'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {filter === 'all' ? 'All caught up! New notifications will appear here.' :
               filter === 'unread' ? 'All notifications have been read.' : 'No important notifications at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`backdrop-blur-2xl bg-white/70 rounded-2xl shadow-lg border-l-4 ${getNotificationColor(notification.type, notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-blue-500/30 shadow-blue-500/20' : ''
                } cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 border-white/60 hover:border-white/80 overflow-hidden`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1 text-sm leading-relaxed">
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
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span className="font-medium">{chatHelpers.formatNotificationTime(notification.createdAt)}</span>
                          </div>
                          {notification.priority === 'high' && (
                            <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-xs font-bold rounded-full">
                              Important
                            </span>
                          )}
                          {!notification.isRead && (
                            <span className="flex items-center space-x-1 text-blue-600 font-semibold">
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                              <span>New</span>
                            </span>
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

export default AdminNotificationsPage;

