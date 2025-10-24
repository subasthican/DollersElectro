import React from 'react';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  showIndicator?: boolean;
  indicatorColor?: string;
  type?: 'button' | 'submit' | 'reset';
}

const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  showIndicator = false,
  indicatorColor = 'bg-green-400',
  type = 'button',
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  // Variant configurations
  const variantClasses = {
    primary: {
      glass: 'from-blue-500/30 via-blue-400/20 to-blue-300/10',
      glassHover: 'from-blue-500/40 via-blue-400/30 to-blue-300/20',
      border: 'border-blue-500/40 group-hover:border-blue-500/70',
      text: 'text-blue-700 group-hover:text-blue-900',
      shimmer: 'via-blue-300/50',
    },
    secondary: {
      glass: 'from-purple-500/30 via-purple-400/20 to-purple-300/10',
      glassHover: 'from-purple-500/40 via-purple-400/30 to-purple-300/20',
      border: 'border-purple-500/40 group-hover:border-purple-500/70',
      text: 'text-purple-700 group-hover:text-purple-900',
      shimmer: 'via-purple-300/50',
    },
    success: {
      glass: 'from-green-500/30 via-green-400/20 to-green-300/10',
      glassHover: 'from-green-500/40 via-green-400/30 to-green-300/20',
      border: 'border-green-500/40 group-hover:border-green-500/70',
      text: 'text-green-700 group-hover:text-green-900',
      shimmer: 'via-green-300/50',
    },
    danger: {
      glass: 'from-red-500/30 via-red-400/20 to-red-300/10',
      glassHover: 'from-red-500/40 via-red-400/30 to-red-300/20',
      border: 'border-red-500/40 group-hover:border-red-500/70',
      text: 'text-red-700 group-hover:text-red-900',
      shimmer: 'via-red-300/50',
    },
    dark: {
      glass: 'from-gray-800/30 via-gray-700/20 to-gray-600/10',
      glassHover: 'from-gray-800/40 via-gray-700/30 to-gray-600/20',
      border: 'border-gray-700/40 group-hover:border-gray-700/70',
      text: 'text-gray-900 group-hover:text-black',
      shimmer: 'via-gray-400/50',
    },
    light: {
      glass: 'from-white/20 via-white/10 to-white/5',
      glassHover: 'from-gray-200/30 via-gray-300/20 to-white/10',
      border: 'border-white/30 group-hover:border-white/60',
      text: 'text-white/90 group-hover:text-white',
      shimmer: 'via-white/40',
    },
  };

  const selectedVariant = variantClasses[variant];
  const selectedSize = sizeClasses[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group inline-flex items-center justify-center gap-2 
        ${selectedSize}
        ${fullWidth ? 'w-full' : ''}
        rounded-full relative overflow-hidden cursor-pointer 
        transition-all duration-300 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        font-medium
        ${className}
      `}
    >
      {/* Liquid Glass Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${selectedVariant.glass} backdrop-blur-xl rounded-full`}></div>
      <div className={`absolute inset-0 bg-gradient-to-br ${selectedVariant.glassHover} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

      {/* Animated Border */}
      <div className={`absolute inset-0 rounded-full border ${selectedVariant.border} transition-all duration-300`}></div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${selectedVariant.shimmer} to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000`}></div>
      </div>

      {/* Content */}
      <div className="relative flex items-center gap-2">
        {showIndicator && (
          <span className={`w-2 h-2 ${indicatorColor} rounded-full animate-pulse shadow-lg shadow-green-400/50`}></span>
        )}
        
        {icon && iconPosition === 'left' && (
          <span className="group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        )}
        
        <span className={`${selectedVariant.text} transition-colors duration-300 whitespace-nowrap`}>
          {children}
        </span>
        
        {icon && iconPosition === 'right' && (
          <span className="group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        )}
      </div>
    </button>
  );
};

export default LiquidGlassButton;

