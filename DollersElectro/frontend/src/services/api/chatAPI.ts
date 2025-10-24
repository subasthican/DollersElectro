import api from './api';

// Interfaces for chat functionality
export interface TypingUser {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  };
  startedAt: string;
}

export interface ChatMessage {
  _id: string;
  subject: string;
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  status: string;
  priority: string;
  category: string;
  replies: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      username: string;
      role: string;
    };
    message: string;
    isInternal: boolean;
    createdAt: string;
  }>;
  internalNotes: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      username: string;
    };
    note: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  typingUsers: TypingUser[];
}

export interface Notification {
  _id: string;
  recipient: string;
  type: 'message_reply' | 'status_update' | 'assigned' | 'priority_change' | 'order' | 'payment';
  message?: {
    _id: string;
    subject: string;
    status: string;
    priority: string;
  };
  relatedOrder?: string;
  title: string;
  content: string;
  isRead: boolean;
  priority: string;
  actionData: {
    messageId?: string;
    action?: string;
  };
  createdAt: string;
  readAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export interface ChatMessageResponse {
  success: boolean;
  data: {
    message: ChatMessage;
    typingUsers: TypingUser[];
  };
}

// Chat API functions
export const chatAPI = {
  // Get real-time message updates with typing indicators
  getChatMessage: async (messageId: string): Promise<ChatMessageResponse> => {
    const response = await api.get(`/chat/messages/${messageId}`);
    return response.data;
  },

  // Update typing status
  updateTypingStatus: async (messageId: string, isTyping: boolean): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/chat/messages/${messageId}/typing`, { isTyping });
    return response.data;
  },

  // Get user's notifications
  getNotifications: async (page = 1, limit = 20, unreadOnly = false): Promise<NotificationsResponse> => {
    const response = await api.get(`/chat/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/chat/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/chat/notifications/read-all');
    return response.data;
  }
};

// Chat helpers
export const chatHelpers = {
  // Format typing indicator text
  formatTypingText: (typingUsers: TypingUser[]): string => {
    if (typingUsers.length === 0) return '';
    
    if (typingUsers.length === 1) {
      const user = typingUsers[0];
      return `${user.user.firstName} is typing...`;
    }
    
    if (typingUsers.length === 2) {
      const names = typingUsers.map(u => u.user.firstName);
      return `${names[0]} and ${names[1]} are typing...`;
    }
    
    return 'Several people are typing...';
  },

  // Check if user is typing
  isUserTyping: (typingUsers: TypingUser[], userId: string): boolean => {
    return typingUsers.some(t => t.user._id === userId);
  },

  // Get notification priority color
  getPriorityColor: (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  },

  // Format notification time
  formatNotificationTime: (createdAt: string): string => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
};



