import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { reviewAPI, CreateReviewData } from '../../services/api/reviewAPI';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, productName, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 0,
    images: [] as Array<{ url: string; alt?: string }>
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a review title');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter your review');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewData = {
        productId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        rating: formData.rating,
        images: formData.images
      };

      await reviewAPI.createReview(reviewData);
      toast.success('Review submitted successfully! It will be published after moderation.');
      onSubmit();
    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starRating = index + 1;
      const isFilled = starRating <= (hoveredRating || formData.rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleRatingClick(starRating)}
          onMouseEnter={() => handleRatingHover(starRating)}
          onMouseLeave={handleRatingLeave}
          className="focus:outline-none transition-transform duration-200 transform hover:scale-125"
        >
          {isFilled ? (
            <StarIconSolid className="h-10 w-10 text-yellow-500 drop-shadow-lg" />
          ) : (
            <StarIcon className="h-10 w-10 text-gray-300 hover:text-gray-400" />
          )}
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || '';
  };

  return (
    <div className="backdrop-blur-2xl bg-white/90 border-2 border-white/60 rounded-3xl p-8 shadow-2xl">
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Write a Review for {productName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rating - iOS 26 Glassy */}
        <div>
          <label className="block text-lg font-bold text-gray-900 mb-4">
            Rating *
          </label>
          <div className="flex items-center space-x-2">
            {renderStars()}
            {formData.rating > 0 && (
              <span className="ml-4 px-4 py-2 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 text-blue-900 text-base font-bold rounded-full border-2 border-blue-200/60 shadow-lg">
                {getRatingText(formData.rating)}
              </span>
            )}
          </div>
        </div>

        {/* Title - iOS 26 Glassy */}
        <div>
          <label htmlFor="title" className="block text-lg font-bold text-gray-900 mb-3">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Summarize your review in a few words"
            className="w-full px-4 py-4 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-semibold shadow-sm transition-all placeholder-gray-500"
            maxLength={100}
            required
          />
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Content - iOS 26 Glassy */}
        <div>
          <label htmlFor="content" className="block text-lg font-bold text-gray-900 mb-3">
            Your Review *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Tell others about your experience with this product"
            rows={6}
            className="w-full px-4 py-4 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-semibold shadow-sm transition-all placeholder-gray-500 resize-none"
            maxLength={1000}
            required
          />
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {formData.content.length}/1000 characters
          </p>
        </div>

        {/* Image Upload Placeholder - iOS 26 Glassy */}
        <div>
          <label className="block text-lg font-bold text-gray-900 mb-3">
            Photos (Optional)
          </label>
          <div className="border-2 border-dashed backdrop-blur-xl bg-gray-50/60 border-gray-300/60 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-gray-600 text-base font-medium">
              Image upload feature coming soon
            </p>
          </div>
        </div>

        {/* Submit Buttons - iOS 26 Glassy */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 backdrop-blur-xl bg-white/60 hover:bg-white/80 text-gray-700 hover:text-gray-900 rounded-2xl border-2 border-white/60 hover:border-gray-300 transition-all duration-300 font-bold shadow-sm hover:shadow-md transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="px-8 py-3 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold"
          >
            {isSubmitting ? '⏳ Submitting...' : '✅ Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;



