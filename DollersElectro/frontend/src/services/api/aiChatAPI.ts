import api from './api';

export interface AIChatSession {
  sessionId: string;
  conversation: Array<{
    role: 'user' | 'assistant';
    message: string;
    timestamp: string;
    suggestions?: Array<{
      text: string;
      action: string;
      data: any;
    }>;
  }>;
  recommendations?: Array<{
    category: string;
    packageName: string;
    totalPrice: number;
    savings: number;
    products: Array<{
      productId: string;
      reason: string;
      priority: string;
    }>;
  }>;
}

export interface AIRecommendation {
  category: string;
  packageName: string;
  totalPrice: number;
  savings: number;
  products: Array<{
    productId: string;
    reason: string;
    priority: string;
  }>;
}

export const aiChatAPI = {
  // Start new chat session
  startChat: async (): Promise<{ success: boolean; data?: AIChatSession; message?: string }> => {
    const response = await api.post('/ai-chat/start');
    return response.data;
  },

  // Send message and get AI response
  sendMessage: async (sessionId: string, message: string): Promise<{ success: boolean; data?: AIChatSession; message?: string }> => {
    const response = await api.post('/ai-chat/message', { sessionId, message });
    return response.data;
  },

  // Get chat session
  getSession: async (sessionId: string): Promise<{ success: boolean; data: AIChatSession }> => {
    const response = await api.get(`/ai-chat/session/${sessionId}`);
    return response.data;
  },

  // Get user's chat sessions
  getMySessions: async (): Promise<{ success: boolean; data: AIChatSession[] }> => {
    const response = await api.get('/ai-chat/my-sessions');
    return response.data;
  },

  // Delete chat session
  deleteSession: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/ai-chat/session/${sessionId}`);
    return response.data;
  },

  // Get chat analytics (admin only)
  getAnalytics: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/ai-chat/analytics');
    return response.data;
  }
};



