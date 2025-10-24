import React, { useState } from 'react';
import { StarIcon, HandThumbUpIcon, FlagIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Review } from '../../services/api/reviewAPI';
import { reviewAPI } from '../../services/api/reviewAPI';
import { useAppSelector } from '../../store';
import toast from 'react-hot-toast';

interface ReviewCardProps {
  review: Review;
  onUpdate?: () => void;
  showActions?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onUpdate, showActions = true }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(
    user ? review.helpfulUsers.includes(user.id) : false
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index}>
        {index < rating ? (
          <StarIconSolid className="h-4 w-4 text-blue-600" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ));
  };

  const handleMarkHelpful = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }

    setIsMarkingHelpful(true);
    try {
      if (hasMarkedHelpful) {
        // Remove helpful vote (you might need to implement this endpoint)
        toast.success('Removed helpful vote');
        setHasMarkedHelpful(false);
      } else {
        await reviewAPI.markAsHelpful(review.id);
        toast.success('Marked as helpful');
        setHasMarkedHelpful(true);
        onUpdate?.();
      }
    } catch (error) {

      toast.error('Failed to mark as helpful');
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to report reviews');
      return;
    }

    setIsReporting(true);
    try {
      await reviewAPI.reportReview(review.id, 'Inappropriate content');
      toast.success('Review reported');
    } catch (error) {

      toast.error('Failed to report review');
    } finally {
      setIsReporting(false);
    }
  };

  const isOwnReview = user && review.user.id === user.id;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">{review.title}</h4>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified Purchase
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              {renderStars(review.rating)}
            </div>
            <span>by {review.user.firstName} {review.user.lastName}</span>
            <span>•</span>
            <span>{formatDate(review.createdAt)}</span>
            {review.ageInDays > 0 && (
              <>
                <span>•</span>
                <span>{review.ageInDays} days ago</span>
              </>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {!isOwnReview && (
              <>
                <button
                  onClick={handleMarkHelpful}
                  disabled={isMarkingHelpful}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    hasMarkedHelpful
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <HandThumbUpIcon className="h-4 w-4" />
                  <span>{review.helpfulVotes}</span>
                </button>
                
                <button
                  onClick={handleReport}
                  disabled={isReporting}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Report review"
                >
                  <FlagIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{review.content}</p>
      </div>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex space-x-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.alt || `Review image ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Admin Response */}
      {review.adminResponse && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex items-start space-x-2">
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 mb-1">Admin Response</h5>
              <p className="text-blue-800 text-sm">{review.adminResponse.content}</p>
              <p className="text-blue-600 text-xs mt-1">
                {formatDate(review.adminResponse.respondedAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Helpfulness Info */}
      {review.helpfulnessPercentage > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          <span>{review.helpfulnessPercentage}% of users found this helpful</span>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
