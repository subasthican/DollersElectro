import api from './api';

// Types
export interface Message {
  _id: string;
  subject: string;
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
  };
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'sales' | 'support' | 'complaint' | 'feedback';
  replies: Reply[];
  internalNotes: InternalNote[];
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  firstResponseTime?: string;
  tags: string[];
  editHistory?: Array<{
    editedAt: string;
    previousSubject: string;
    previousMessage: string;
    previousCategory?: string;
    previousPriority?: string;
  }>;
}

export interface Reply {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
  };
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface InternalNote {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
  };
  note: string;
  createdAt: string;
}

export interface CreateMessageData {
  subject: string;
  message: string;
  category?: string;
  priority?: string;
}

export interface ReplyData {
  message: string;
  isInternal?: boolean;
}

export interface InternalNoteData {
  note: string;
}

export interface MessageStats {
  overview: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    urgent: number;
    high: number;
  };
  categories: Array<{
    _id: string;
    count: number;
  }>;
}

// API functions
export const messagesAPI = {
  // Send contact message
  sendContactMessage: async (data: CreateMessageData) => {
    const response = await api.post('/messages/contact', data);
    return response.data;
  },

  // Get user's own messages
  getMyMessages: async () => {
    const response = await api.get('/messages/my-messages');
    return response.data;
  },

  // Get specific message
  getMessage: async (messageId: string) => {
    const response = await api.get(`/messages/${messageId}`);
    return response.data;
  },

  // Reply to message
  replyToMessage: async (messageId: string, data: ReplyData) => {
    const response = await api.post(`/messages/${messageId}/reply`, data);
    return response.data;
  },

  // Add internal note (admin/employee only)
  addInternalNote: async (messageId: string, data: InternalNoteData) => {
    const response = await api.post(`/messages/${messageId}/internal-note`, data);
    return response.data;
  },

  // Admin/Employee: Get all messages
  getAllMessages: async (params?: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/admin/messages', { params });
    return response.data;
  },

  // Admin/Employee: Get message statistics
  getMessageStats: async () => {
    const response = await api.get('/admin/messages/stats');
    return response.data;
  },

  // Admin: Assign message
  assignMessage: async (messageId: string, assignedTo: string) => {
    const response = await api.put(`/messages/${messageId}/assign`, { assignedTo });
    return response.data;
  },

  // Admin/Employee: Update message status
  updateMessageStatus: async (messageId: string, status: string) => {
    const response = await api.put(`/messages/${messageId}/status`, { status });
    return response.data;
  },

  // Customer: Update own message
  updateMessage: async (messageId: string, data: CreateMessageData) => {
    const response = await api.put(`/messages/${messageId}`, data);
    return response.data;
  },

  // Customer: Delete own message
  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }
};

// Helper functions
export const messageHelpers = {
  // Format message status for display
  formatStatus: (status: string) => {
    const statusMap = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  },

  // Format priority for display
  formatPriority: (priority: string) => {
    const priorityMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  },

  // Get status color
  getStatusColor: (status: string) => {
    const colorMap = {
      open: 'text-blue-600 bg-blue-100',
      in_progress: 'text-yellow-600 bg-yellow-100',
      resolved: 'text-green-600 bg-green-100',
      closed: 'text-gray-600 bg-gray-100'
    };
    return colorMap[status as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
  },

  // Get priority color
  getPriorityColor: (priority: string) => {
    const colorMap = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-blue-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colorMap[priority as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
  },

  // Format date
  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};



