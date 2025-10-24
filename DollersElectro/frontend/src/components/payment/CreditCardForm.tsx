import React, { useState } from 'react';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import LiquidGlassButton from '../LiquidGlassButton';

interface CreditCardFormProps {
  onSubmit: (cardData: CardData) => void;
  isLoading?: boolean;
}

interface CardData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<CardData>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [errors, setErrors] = useState<Partial<CardData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CardData> = {};

    // Card number validation (basic Luhn algorithm check)
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiryMonth = 'Expiry date is required';
    }

    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'generic';
  };

  const cardType = getCardType(formData.cardNumber);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCardIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Credit/Debit Card</h3>
        <div className="flex space-x-2">
          {cardType === 'visa' && (
            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              VISA
            </div>
          )}
          {cardType === 'mastercard' && (
            <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
              MC
            </div>
          )}
          {cardType === 'amex' && (
            <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
              AMEX
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            value={formData.cardNumber}
            onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all ${
              errors.cardNumber ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardholderName"
            value={formData.cardholderName}
            onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
            placeholder="JOHN DOE"
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all ${
              errors.cardholderName ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          />
          {errors.cardholderName && (
            <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
          )}
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <div className="flex space-x-2">
              <select
                id="expiryMonth"
                value={formData.expiryMonth}
                onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none ${
                  errors.expiryMonth ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                id="expiryYear"
                value={formData.expiryYear}
                onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none ${
                  errors.expiryMonth ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">YYYY</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            {errors.expiryMonth && (
              <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={formData.cvv}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
              placeholder="123"
              maxLength={4}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all ${
                errors.cvv ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
          <LockClosedIcon className="h-5 w-5 text-green-600" />
          <p className="text-sm text-gray-600">
            Your payment information is encrypted and secure. We never store your full card details.
          </p>
        </div>

        {/* Submit Button */}
        <LiquidGlassButton
          type="submit"
          disabled={isLoading}
          variant="primary"
          size="lg"
          fullWidth
          icon={<LockClosedIcon className="h-5 w-5" />}
          iconPosition="left"
        >
          {isLoading ? 'Processing...' : 'Pay Securely'}
        </LiquidGlassButton>
      </form>
    </div>
  );
};

export default CreditCardForm;
