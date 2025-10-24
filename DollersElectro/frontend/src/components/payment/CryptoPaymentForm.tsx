import React, { useState } from 'react';
import { QrCodeIcon, ClipboardDocumentIcon, ClockIcon } from '@heroicons/react/24/outline';
import LiquidGlassButton from '../LiquidGlassButton';

interface CryptoPaymentFormProps {
  onSubmit: (cryptoData: CryptoData) => void;
  isLoading?: boolean;
  amount: number;
}

interface CryptoData {
  selectedCrypto: string;
  walletAddress: string;
  email: string;
}

const CryptoPaymentForm: React.FC<CryptoPaymentFormProps> = ({ onSubmit, isLoading = false, amount }) => {
  const [formData, setFormData] = useState<CryptoData>({
    selectedCrypto: 'bitcoin',
    walletAddress: '',
    email: ''
  });

  const [errors, setErrors] = useState<Partial<CryptoData>>({});

  const cryptoOptions = [
    { value: 'bitcoin', name: 'Bitcoin (BTC)', symbol: 'BTC', rate: 0.000024 },
    { value: 'ethereum', name: 'Ethereum (ETH)', symbol: 'ETH', rate: 0.00037 },
    { value: 'usdc', name: 'USDC', symbol: 'USDC', rate: 1 },
    { value: 'litecoin', name: 'Litecoin (LTC)', symbol: 'LTC', rate: 0.15 }
  ];

  const selectedCrypto = cryptoOptions.find(c => c.value === formData.selectedCrypto);
  const cryptoAmount = selectedCrypto ? amount / selectedCrypto.rate : 0;

  const validateForm = (): boolean => {
    const newErrors: Partial<CryptoData> = {};

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getWalletAddress = (crypto: string) => {
    switch (crypto) {
      case 'bitcoin':
        return 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      case 'ethereum':
        return '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      case 'usdc':
        return '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      case 'litecoin':
        return 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <QrCodeIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Cryptocurrency Payment</h3>
        <div className="w-16 h-8 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">
          CRYPTO
        </div>
      </div>

      {/* Crypto Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Cryptocurrency
        </label>
        <div className="grid grid-cols-2 gap-3">
          {cryptoOptions.map((crypto) => (
            <div
              key={crypto.value}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.selectedCrypto === crypto.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData({ ...formData, selectedCrypto: crypto.value })}
            >
              <div className="text-center">
                <div className="font-medium text-gray-900">{crypto.symbol}</div>
                <div className="text-xs text-gray-500">{crypto.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
        <h4 className="font-medium text-orange-900 mb-3">Payment Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-orange-700">Amount (LKR):</span>
            <span className="font-medium text-orange-900">LKR {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-700">Crypto Amount:</span>
            <span className="font-medium text-orange-900">
              {cryptoAmount.toFixed(6)} {selectedCrypto?.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-700">Network Fee:</span>
            <span className="font-medium text-orange-900">~LKR 500-1000</span>
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Send to Wallet Address
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={getWalletAddress(formData.selectedCrypto)}
            readOnly
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 font-mono text-sm text-gray-900 shadow-sm"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(getWalletAddress(formData.selectedCrypto))}
            className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            title="Copy to clipboard"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Send exactly {cryptoAmount.toFixed(6)} {selectedCrypto?.symbol} to this address
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Your Wallet Address */}
        <div>
          <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Your Wallet Address (for refunds)
          </label>
          <input
            type="text"
            id="walletAddress"
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            placeholder="Enter your wallet address"
            className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all ${
              errors.walletAddress ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          />
          {errors.walletAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.walletAddress}</p>
          )}
        </div>

        {/* Email for Receipt */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email for Receipt
          </label>
          <input
            type="email"
            id="email"
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

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-900 mb-2">Payment Instructions</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Copy the wallet address above</li>
            <li>Send exactly {cryptoAmount.toFixed(6)} {selectedCrypto?.symbol}</li>
            <li>Include your email in the transaction memo if possible</li>
            <li>Wait for blockchain confirmation (1-3 confirmations)</li>
            <li>You'll receive confirmation email once processed</li>
          </ol>
        </div>

        {/* Submit Button */}
        <LiquidGlassButton
          type="submit"
          disabled={isLoading}
          variant="primary"
          size="lg"
          fullWidth
          icon={<QrCodeIcon className="h-5 w-5" />}
          iconPosition="left"
        >
          {isLoading ? 'Processing...' : 'Confirm Crypto Payment'}
        </LiquidGlassButton>
      </form>

      {/* Important Notices */}
      <div className="mt-6 space-y-3">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start space-x-2">
            <ClockIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Processing Time:</p>
              <p>Cryptocurrency payments may take 10-30 minutes to confirm depending on network congestion.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800">
            <p className="font-medium">⚠️ Important:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Send the exact amount shown above</li>
              <li>Use the correct network (don't send BTC to ETH address)</li>
              <li>Keep your transaction hash for reference</li>
              <li>Refunds may take 24-48 hours to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentForm;
