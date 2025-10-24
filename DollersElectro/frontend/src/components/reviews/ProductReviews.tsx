import React, { useState, useEffect, useCallback } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAppSelector } from '../../store';
import { reviewAPI, Review, ProductReviewsResponse } from '../../services/api/reviewAPI';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    rating: undefined as number | undefined
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNext: false,
    hasPrev: false
  });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response: ProductReviewsResponse = await reviewAPI.getProductReviews(productId, filters);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setRatingDistribution(response.data.ratingDistribution);
    } catch (error) {

      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, filters]);

  useEffect(() => {
    fetchReviews();
  }, [productId, filters, fetchReviews]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    fetchReviews();
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return Array.from({ length: 5 }, (_, index) => (
      <span key={index}>
        {index < Math.floor(rating) ? (
          <StarIconSolid className={`${sizeClasses[size]} text-blue-600`} />
        ) : (
          <StarIcon className={`${sizeClasses[size]} text-gray-300`} />
        )}
      </span>
    ));
  };

  const renderRatingDistribution = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const rating = 5 - index;
      const count = ratingDistribution[rating] || 0;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

      return (
        <div key={rating} className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 w-2">{rating}</span>
          <StarIconSolid className="h-4 w-4 text-blue-600" />
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 w-8">{count}</span>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Customer Reviews
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              {renderStars(averageRating, 'md')}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} out of 5
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-6 py-3 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold"
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              productId={productId}
              productName={productName}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Rating Distribution */}
        <div className="lg:col-span-1">
          <h4 className="font-medium text-gray-900 mb-4">Rating Distribution</h4>
          <div className="space-y-2">
            {renderRatingDistribution()}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3">
          {/* Filters - iOS 26 Glassy */}
          <div className="flex items-center space-x-4 mb-6">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-semibold shadow-sm transition-all cursor-pointer appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
            >
              <option value="createdAt">Most Recent</option>
              <option value="rating">Highest Rating</option>
              <option value="helpfulVotes">Most Helpful</option>
            </select>

            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange({ 
                rating: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-semibold shadow-sm transition-all cursor-pointer appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
            >
              <option value="">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>
          </div>

          {/* Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onUpdate={fetchReviews}
                />
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-lg ${
                          page === pagination.currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No reviews yet</p>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold"
                >
                  ✍️ Be the first to review
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
