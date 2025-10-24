import React from 'react';
import {
  CreditCardIcon,
  BuildingLibraryIcon,
  QrCodeIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface PaymentMethodProps {
  method: 'card' | 'paypal' | 'bank' | 'crypto';
  selected: boolean;
  onSelect: (method: string) => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ method, selected, onSelect }) => {
  const getMethodDetails = () => {
    switch (method) {
      case 'card':
        return {
          name: 'Credit/Debit Card',
          description: 'Visa, Mastercard, American Express',
          icon: CreditCardIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'paypal':
        return {
          name: 'PayPal',
          description: 'Secure online payments',
          icon: BuildingLibraryIcon,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'bank':
        return {
          name: 'Bank Transfer',
          description: 'Direct bank transfer',
          icon: BanknotesIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'crypto':
        return {
          name: 'Cryptocurrency',
          description: 'Bitcoin, Ethereum, USDC',
          icon: QrCodeIcon,
          color: 'text-blue-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          name: 'Unknown',
          description: 'Payment method not specified',
          icon: CreditCardIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const details = getMethodDetails();
  const Icon = details.icon;

  return (
    <div
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
        selected
          ? `${details.borderColor} ${details.bgColor} ring-2 ring-offset-2 ring-blue-500`
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => onSelect(method)}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${details.bgColor}`}>
          <Icon className={`h-6 w-6 ${details.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{details.name}</h3>
          <p className="text-sm text-gray-500">{details.description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 ${
          selected 
            ? 'bg-blue-600 border-blue-600' 
            : 'border-gray-300'
        }`}>
          {selected && (
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
