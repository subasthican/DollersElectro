import api from './api';

export interface NewsletterPreferences {
  productUpdates: boolean;
  promotions: boolean;
  news: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  preferences: NewsletterPreferences;
  source: string;
  user?: string;
  createdAt: string;
  updatedAt: string;
  subscriptionAge: number;
  status: string;
}

export interface NewsletterStats {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
  bounced: number;
}

// Newsletter API functions
export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: async (email: string, preferences: NewsletterPreferences = {
    productUpdates: true,
    promotions: true,
    news: true,
    frequency: 'weekly'
  }): Promise<{ success: boolean; message: string; data: { subscription: NewsletterSubscription } }> => {
    const response = await api.post('/newsletter/subscribe', {
      email,
      preferences
    });
    return response.data;
  },

  // Verify subscription
  verify: async (token: string): Promise<{ success: boolean; message: string; data: { subscription: NewsletterSubscription } }> => {
    const response = await api.get(`/newsletter/verify/${token}`);
    return response.data;
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email?: string, token?: string): Promise<{ success: boolean; message: string; data: { subscription: NewsletterSubscription } }> => {
    const response = await api.post('/newsletter/unsubscribe', {
      email,
      token
    });
    return response.data;
  },

  // Update subscription preferences
  updatePreferences: async (preferences: Partial<NewsletterPreferences>): Promise<{ success: boolean; message: string; data: { subscription: NewsletterSubscription } }> => {
    const response = await api.put('/newsletter/preferences', { preferences });
    return response.data;
  },

  // Get all subscribers (admin only)
  getSubscribers: async (filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ success: boolean; data: { subscribers: NewsletterSubscription[]; pagination: any } }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/newsletter/subscribers?${params.toString()}`);
    return response.data;
  },

  // Get newsletter statistics (admin only)
  getStats: async (): Promise<{ success: boolean; data: { stats: NewsletterStats; activeSubscribers: NewsletterSubscription[] } }> => {
    const response = await api.get('/newsletter/stats');
    return response.data;
  },

  // Send newsletter (admin only)
  sendNewsletter: async (data: {
    subject: string;
    content: string;
    type?: string;
    targetAudience?: string;
  }): Promise<{ success: boolean; message: string; data: { recipients: number; subject: string; type: string; targetAudience: string } }> => {
    const response = await api.post('/newsletter/send', data);
    return response.data;
  },

  // Delete subscriber (admin only)
  deleteSubscriber: async (subscriberId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/newsletter/subscribers/${subscriberId}`);
    return response.data;
  }
};

export default newsletterAPI;



