import React, { useState } from 'react';
import { BanknotesIcon, DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import LiquidGlassButton from '../LiquidGlassButton';

interface BankTransferFormProps {
  onSubmit: (bankData: BankData) => void;
  isLoading?: boolean;
  amount: number;
}

interface BankData {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  reference: string;
}

const BankTransferForm: React.FC<BankTransferFormProps> = ({ onSubmit, isLoading = false, amount }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No validation needed - just confirm order creation
    onSubmit({
      accountHolderName: 'Bank Transfer',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      reference: `ORDER-${Date.now()}`
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BanknotesIcon className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Bank Transfer</h3>
        <div className="w-16 h-8 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
          BANK
        </div>
      </div>

      {/* Bank Account Information */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
        <h4 className="font-bold text-green-900 mb-4 text-lg">📋 Our Bank Account Details</h4>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3">
            <span className="text-sm text-gray-600 block mb-1">Bank Name:</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-lg">People's Bank</span>
              <button
                type="button"
                onClick={() => copyToClipboard('People\'s Bank', 'Bank Name')}
                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <span className="text-sm text-gray-600 block mb-1">Account Name:</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-lg">DollersElectro (Pvt) Ltd</span>
              <button
                type="button"
                onClick={() => copyToClipboard('DollersElectro (Pvt) Ltd', 'Account Name')}
                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <span className="text-sm text-gray-600 block mb-1">Account Number:</span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-gray-900 text-xl">123-456-789-01</span>
              <button
                type="button"
                onClick={() => copyToClipboard('123-456-789-01', 'Account Number')}
                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <span className="text-sm text-gray-600 block mb-1">Branch:</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-lg">Jaffna</span>
              <button
                type="button"
                onClick={() => copyToClipboard('Jaffna', 'Branch')}
                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white">
            <span className="text-sm opacity-90 block mb-1">Amount to Transfer:</span>
            <span className="font-bold text-2xl">LKR {amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <h4 className="font-bold text-blue-900 mb-3 text-lg flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2" />
            How to Complete Payment
          </h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li><span className="font-semibold">Transfer the amount</span> to our bank account using the details above</li>
            <li><span className="font-semibold">Keep your bank receipt/bill</span> (screenshot or photo)</li>
            <li><span className="font-semibold">Click "Create Order"</span> button below</li>
            <li><span className="font-semibold">Upload your payment bill</span> on the next page</li>
            <li><span className="font-semibold">Admin will verify</span> your payment within 24 hours</li>
            <li><span className="font-semibold">Get your pickup code</span> after verification</li>
          </ol>
        </div>

        {/* Submit Button */}
        <LiquidGlassButton
          type="submit"
          disabled={isLoading}
          variant="success"
          size="lg"
          fullWidth
          icon={<BanknotesIcon className="h-5 w-5" />}
          iconPosition="left"
        >
          {isLoading ? 'Creating Order...' : '✅ Create Order & Upload Bill'}
        </LiquidGlassButton>
      </form>

      {/* Important Notice */}
      <div className="mt-6 p-5 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <DocumentTextIcon className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-900">
            <p className="font-bold mb-2">⚠️ Important Notice:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Transfer the exact amount shown above</li>
              <li>Take a clear photo/screenshot of your bank receipt</li>
              <li>You'll need to upload the receipt on the next page</li>
              <li>Your pickup code will be sent after admin verifies payment</li>
              <li>Verification usually takes 2-24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankTransferForm;
