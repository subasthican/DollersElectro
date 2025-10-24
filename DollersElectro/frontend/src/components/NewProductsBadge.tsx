import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NewProductsBadgeProps {
  onClick?: () => void;
  className?: string;
  variant?: 'hero' | 'compact';
}

const NewProductsBadge: React.FC<NewProductsBadgeProps> = ({ 
  onClick, 
  className = '',
  variant = 'hero'
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to products page
      navigate('/products');
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
      >
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl rounded-full"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200/10 via-gray-300/10 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Animated Border */}
        <div className="absolute inset-0 rounded-full border border-white/30 group-hover:border-white/60 transition-all duration-300"></div>
        
        {/* Shimmer Effect - Silver */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
        
        {/* Content */}
        <span className="relative w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
        <span className="relative text-xs font-medium text-white/90 group-hover:text-white transition-colors duration-300">New Products</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
    >
      {/* Liquid Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl rounded-full"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200/10 via-gray-300/10 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-full border border-white/30 group-hover:border-white/60 transition-all duration-300"></div>
      
      {/* Shimmer Effect - Silver */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      </div>
      
      {/* Content */}
      <span className="relative w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
      <span className="relative text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-300">New Products Available</span>
    </button>
  );
};

export default NewProductsBadge;

