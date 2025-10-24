import React from 'react';
import { ScaleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useProductComparison } from '../../contexts/ProductComparisonContext';
import { Product } from '../../services/api/productAPI';
import toast from 'react-hot-toast';

interface ComparisonButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const ComparisonButton: React.FC<ComparisonButtonProps> = ({ 
  product, 
  size = 'md', 
  showText = true 
}) => {
  const { addToComparison, removeFromComparison, isInComparison, canAddToComparison } = useProductComparison();

  const isInComparisonList = isInComparison(product._id || '');
  const canAdd = canAddToComparison(product);

  const handleClick = () => {
    if (isInComparisonList) {
      removeFromComparison(product._id || '');
      toast.success('Removed from comparison');
    } else if (canAdd) {
      addToComparison(product);
      toast.success('Added to comparison');
    } else {
      toast.error('Maximum 4 products can be compared at once');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canAdd && !isInComparisonList}
      className={`
        ${getSizeClasses()}
        ${isInComparisonList 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : canAdd 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }
        rounded-lg transition-colors flex items-center space-x-1
      `}
    >
      {isInComparisonList ? (
        <CheckIcon className={getIconSize()} />
      ) : (
        <ScaleIcon className={getIconSize()} />
      )}
      {showText && (
        <span>
          {isInComparisonList ? 'In Comparison' : 'Compare'}
        </span>
      )}
    </button>
  );
};

export default ComparisonButton;
