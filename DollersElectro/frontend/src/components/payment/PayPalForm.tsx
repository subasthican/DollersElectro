import React, { useState } from 'react';
import { BuildingLibraryIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import LiquidGlassButton from '../LiquidGlassButton';

interface PayPalFormProps {
  onSubmit: (paypalData: PayPalData) => void;
  isLoading?: boolean;
}

interface PayPalData {
  email: string;
  password: string;
}

const PayPalForm: React.FC<PayPalFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<PayPalData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<PayPalData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PayPalData> = {};

    if (!formData.email) {
      newErrors.email = 'PayPal email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'PayPal password is required';
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BuildingLibraryIcon className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">PayPal</h3>
        <div className="w-16 h-8 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
          PayPal
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PayPal Email */}
        <div>
          <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700 mb-2">
            PayPal Email
          </label>
          <input
            type="email"
            id="paypalEmail"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your-email@example.com"
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all ${
              errors.email ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* PayPal Password */}
        <div>
          <label htmlFor="paypalPassword" className="block text-sm font-medium text-gray-700 mb-2">
            PayPal Password
          </label>
          <input
            type="password"
            id="paypalPassword"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your PayPal password"
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all ${
              errors.password ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* PayPal Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-900 mb-2">Why use PayPal?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Secure and trusted payment method</li>
            <li>• No need to enter card details</li>
            <li>• Buyer protection included</li>
            <li>• Fast checkout process</li>
          </ul>
        </div>

        {/* Security Notice */}
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
          <LockClosedIcon className="h-5 w-5 text-green-600" />
          <p className="text-sm text-gray-600">
            Your PayPal credentials are secure and encrypted. We never store your password.
          </p>
        </div>

        {/* Submit Button */}
        <LiquidGlassButton
          type="submit"
          disabled={isLoading}
          variant="primary"
          size="lg"
          fullWidth
          icon={<BuildingLibraryIcon className="h-5 w-5" />}
          iconPosition="left"
        >
          {isLoading ? 'Processing...' : 'Pay with PayPal'}
        </LiquidGlassButton>
      </form>

      {/* Alternative PayPal Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">Don't have a PayPal account?</p>
        <div className="space-y-2">
          <LiquidGlassButton
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
          >
            Create PayPal Account
          </LiquidGlassButton>
          <LiquidGlassButton
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
          >
            Continue as Guest
          </LiquidGlassButton>
        </div>
      </div>
    </div>
  );
};

export default PayPalForm;
