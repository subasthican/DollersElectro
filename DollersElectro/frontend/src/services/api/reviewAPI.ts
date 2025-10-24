import api from './api';

export interface Review {
  id: string;
  product: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  helpfulVotes: number;
  helpfulUsers: string[];
  images: Array<{
    url: string;
    alt?: string;
  }>;
  isVerifiedPurchase: boolean;
  adminResponse?: {
    content: string;
    respondedBy: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  ageInDays: number;
  helpfulnessPercentage: number;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  rating?: number;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

export interface CreateReviewData {
  productId: string;
  title: string;
  content: string;
  rating: number;
  images?: Array<{
    url: string;
    alt?: string;
  }>;
}

export interface UpdateReviewData {
  title?: string;
  content?: string;
  rating?: number;
  images?: Array<{
    url: string;
    alt?: string;
  }>;
}

// Review API functions
export const reviewAPI = {
  // Get reviews for a product
  getProductReviews: async (productId: string, filters: ReviewFilters = {}): Promise<ProductReviewsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/reviews/product/${productId}?${params.toString()}`);
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData: CreateReviewData): Promise<{ success: boolean; message: string; data: { review: Review } }> => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId: string, reviewData: UpdateReviewData): Promise<{ success: boolean; message: string; data: { review: Review } }> => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  markAsHelpful: async (reviewId: string): Promise<{ success: boolean; message: string; data: { helpfulVotes: number } }> => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Report a review
  reportReview: async (reviewId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  },

  // Get all reviews for admin
  getAdminReviews: async (filters: ReviewFilters & { status?: string; productId?: string } = {}): Promise<{ success: boolean; data: { reviews: Review[]; pagination: any } }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/reviews/admin?${params.toString()}`);
    return response.data;
  },

  // Update review status (admin only)
  updateReviewStatus: async (reviewId: string, status: string, moderationNotes?: string): Promise<{ success: boolean; message: string; data: { review: Review } }> => {
    const response = await api.put(`/reviews/${reviewId}/status`, { status, moderationNotes });
    return response.data;
  }
};

export default reviewAPI;



