import React, { useState } from 'react';
import { TagIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { promoCodeAPI, PromoCodeValidationRequest } from '../../services/api/promoCodeAPI';
import toast from 'react-hot-toast';

interface PromoCodeInputProps {
  subtotal: number;
  onPromoCodeApplied: (promoData: any) => void;
  onPromoCodeRemoved: () => void;
  currentPromoCode?: any;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  subtotal,
  onPromoCodeApplied,
  onPromoCodeRemoved,
  currentPromoCode
}) => {
  const [promoCode, setPromoCode] = useState('');
  // Removed unused isLoading state
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    try {
      const requestData: PromoCodeValidationRequest = {
        code: promoCode.trim(),
        orderData: {
          subtotal: subtotal,
          userType: 'existing' // You can make this dynamic based on user registration date
        }
      };

      const response = await promoCodeAPI.validatePromoCode(requestData);
      
      if (response.success) {
        onPromoCodeApplied(response.data?.promoCode);
        setPromoCode('');
        toast.success('Promo code applied successfully!');
      } else {
        toast.error(response.message || 'Invalid promo code');
      }
    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Failed to apply promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromoCode = () => {
    onPromoCodeRemoved();
    toast.success('Promo code removed');
  };

  const formatDiscountValue = (type: string, value: number): string => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed':
        return `LKR ${value.toFixed(0)}`;
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return value.toString();
    }
  };

  const formatDiscountAmount = (type: string, value: number, subtotal: number): string => {
    switch (type) {
      case 'percentage':
        const percentageAmount = (subtotal * value) / 100;
        return `-LKR ${percentageAmount.toFixed(0)}`;
      case 'fixed':
        return `-LKR ${value.toFixed(0)}`;
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return `-LKR ${value.toFixed(0)}`;
    }
  };

  if (currentPromoCode) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-2 border-green-300/60 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-green-500/90 to-green-600/90 p-3 rounded-2xl shadow-lg shadow-green-500/50">
              <CheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-green-900 text-lg">
                  {currentPromoCode.code}
                </span>
                <span className="text-sm font-semibold text-green-700 backdrop-blur-xl bg-white/60 px-3 py-1 rounded-full">
                  {formatDiscountValue(currentPromoCode.type, currentPromoCode.value)}
                </span>
              </div>
              <div className="text-sm font-bold text-green-600">
                Discount: {formatDiscountAmount(currentPromoCode.type, currentPromoCode.value, subtotal)}
              </div>
            </div>
          </div>
          <button
            onClick={handleRemovePromoCode}
            className="p-2 text-green-600 hover:text-white backdrop-blur-xl bg-white/60 hover:bg-red-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
            title="Remove promo code"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-2xl p-5 w-full max-w-full overflow-hidden shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 shadow-lg shadow-purple-500/50">
          <TagIcon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Have a Promo Code?</h3>
      </div>
      
      <div className="flex space-x-3 items-center w-full max-w-full">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="flex-1 backdrop-blur-xl bg-white/80 border-2 border-white/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 min-w-0 text-gray-900 font-semibold placeholder-gray-500 shadow-sm transition-all"
          onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
        />
        <button
          onClick={handleApplyPromoCode}
          disabled={isValidating || !promoCode.trim()}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 min-w-[100px] text-center shadow-lg ${
            isValidating || !promoCode.trim()
              ? 'backdrop-blur-xl bg-gray-200/60 text-gray-500 cursor-not-allowed border-2 border-gray-300/60'
              : 'backdrop-blur-2xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 hover:from-purple-600/95 hover:to-purple-700/95 text-white border-2 border-white/30 hover:border-white/50 shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105'
          }`}
        >
          {isValidating ? '⏳ ...' : '✨ Apply'}
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mt-3 font-medium">
        Enter your promo code above and click apply to see your discount
      </p>
    </div>
  );
};

export default PromoCodeInput;

