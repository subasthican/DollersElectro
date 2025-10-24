import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  HomeIcon, 
  ShoppingBagIcon, 
  EnvelopeIcon,
  DocumentArrowDownIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import LiquidGlassButton from '../components/LiquidGlassButton';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, method, transactionId, orderNumber, deliveryInfo, status, nextStep, orderId } = location.state || {};
  
  // Set default values if no data is provided - use useMemo to prevent recreation
  const defaultAmount = useMemo(() => amount || 299.99, [amount]);
  
  // Generate a stable transaction ID that won't change
  const defaultTransactionId = useMemo(() => {
    if (transactionId) return transactionId;
    
    // Generate a stable ID based on current timestamp and random component
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `TXN${timestamp}${random}`.toUpperCase();
  }, [transactionId]);

  // Generate order number if not provided
  const defaultOrderNumber = useMemo(() => {
    if (orderNumber) return orderNumber;
    return `ORD-${Date.now()}`;
  }, [orderNumber]);
  
  const defaultDeliveryInfo = useMemo(() => 
    deliveryInfo || {
      deliveryType: 'pickup',
      firstName: 'Customer',
      lastName: 'Name',
      email: 'customer@example.com',
      phone: '+1-555-0123',
      pickupLocation: 'main-store'
    }, 
    [deliveryInfo]
  );
  
  const [manualCode, setManualCode] = useState<string>('');
  const [billImage, setBillImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Generate stable codes that won't change on re-renders
  const stableManualCode = useMemo(() => {
    if (manualCode) return manualCode;
    
    // Generate a stable 4-digit code based on timestamp
    const timestamp = Date.now();
    const code = (timestamp % 9000) + 1000; // Ensures 4-digit number
    return code.toString();
  }, [manualCode]);

  // Generate 4-digit manual code only once on component mount
  useEffect(() => {
    // Set the manual code only once
    if (!manualCode) {
      const code = stableManualCode;
      setManualCode(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const getMethodDisplayName = (method: string) => {
    const methodNames: { [key: string]: string } = {
      'card': 'Credit/Debit Card',
      'paypal': 'PayPal',
      'bank': 'Bank Transfer',
      'crypto': 'Cryptocurrency'
    };
    return methodNames[method] || 'Payment Method';
  };

  const getPickupLocationName = (locationCode: string) => {
    const locations: { [key: string]: string } = {
      'jaffna-store': 'Jaffna Store - DollersElectro, Jaffna',
      'sandilipay-branch': 'Sandilipay Branch - DollersElectro, Sandilipay'
    };
    return locations[locationCode] || locationCode;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255);
    doc.text('DollersElectro', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 105, 35, { align: 'center' });
    
    // Transaction Details
    doc.setFontSize(12);
    doc.text('Transaction Details:', 20, 55);
    doc.setFontSize(10);
    doc.text(`Order Number: ${defaultOrderNumber}`, 20, 65);
    doc.text(`Transaction ID: ${defaultTransactionId}`, 20, 75);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 85);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 95);
    doc.text(`Payment Method: ${getMethodDisplayName(method)}`, 20, 105);
    
    // Customer Information
    if (defaultDeliveryInfo) {
      doc.setFontSize(12);
      doc.text('Customer Information:', 20, 125);
      doc.setFontSize(10);
      doc.text(`Name: ${defaultDeliveryInfo.firstName} ${defaultDeliveryInfo.lastName}`, 20, 135);
      doc.text(`Email: ${defaultDeliveryInfo.email}`, 20, 145);
      doc.text(`Phone: ${defaultDeliveryInfo.phone}`, 20, 155);
      
      if (defaultDeliveryInfo.deliveryType === 'pickup') {
        doc.text(`Pickup Location: ${getPickupLocationName(defaultDeliveryInfo.pickupLocation)}`, 20, 165);
        doc.text(`Pickup Code: ${manualCode}`, 20, 175);
      }
    }
    
    // Amount
    doc.setFontSize(14);
    doc.text('Amount Details:', 20, 195);
    doc.setFontSize(12);
    doc.text(`Subtotal: LKR ${defaultAmount.toFixed(2)}`, 20, 205);
    doc.text(`Tax (8%): LKR ${(defaultAmount * 0.08).toFixed(2)}`, 20, 215);
    doc.text(`Total: LKR ${(defaultAmount * 1.08).toFixed(2)}`, 20, 225);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your purchase!', 105, 260, { align: 'center' });
    doc.text('For support, contact: support@dollerselectro.com', 105, 265, { align: 'center' });
    
    // Save PDF
    doc.save(`DollersElectro_Receipt_${defaultOrderNumber}.pdf`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    alert('Copied to clipboard!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for preview and upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBillUpload = async () => {
    if (!billImage || !orderId) {
      alert('Please select an image first');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/orders/${orderId}/upload-payment-bill`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ billImage })
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadSuccess(true);
        alert('✅ Payment bill uploaded successfully! Admin will verify your payment within 24 hours.');
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      } else {
        alert('❌ Failed to upload bill: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload payment bill. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // If status is pending_payment and nextStep is upload_bill, show upload interface
  if (status === 'pending_payment' && nextStep === 'upload_bill') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Upload Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📤 Upload Payment Bill</h1>
            <p className="text-lg text-gray-600">
              Order created successfully! Please upload your bank transfer receipt.
            </p>
          </div>

          {/* Order Info Card */}
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Order Number:</span> <span className="font-bold text-blue-600 text-lg">{orderNumber}</span></p>
              <p><span className="text-gray-600">Total Amount:</span> <span className="font-bold text-lg">LKR {amount?.toFixed(2)}</span></p>
              <p><span className="text-gray-600">Status:</span> <span className="text-yellow-600 font-medium">⏳ Pending Payment Verification</span></p>
            </div>
          </div>

          {/* Upload Bill Card */}
          <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentArrowDownIcon className="h-6 w-6 mr-2 text-blue-600" />
              Upload Your Bank Receipt
            </h2>

            {!billImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                      <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Click to upload bill</p>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-green-300 rounded-xl p-4 bg-green-50">
                  <img 
                    src={billImage} 
                    alt="Payment Bill" 
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <LiquidGlassButton
                      type="button"
                      variant="secondary"
                      size="md"
                      fullWidth
                    >
                      Change Image
                    </LiquidGlassButton>
                  </label>
                  <LiquidGlassButton
                    onClick={handleBillUpload}
                    disabled={isUploading || uploadSuccess}
                    variant="success"
                    size="md"
                    fullWidth
                    icon={<CheckCircleIcon className="h-5 w-5" />}
                    iconPosition="left"
                  >
                    {isUploading ? 'Uploading...' : uploadSuccess ? 'Uploaded ✓' : '✅ Submit for Verification'}
                  </LiquidGlassButton>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="backdrop-blur-2xl bg-blue-50/80 border-2 border-blue-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-blue-900 mb-3 text-lg">📋 What happens next?</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Upload a clear photo/screenshot of your bank transfer receipt</li>
              <li>Admin will verify your payment within 2-24 hours</li>
              <li>You'll receive an email notification once verified</li>
              <li>Your <strong>pickup code will be generated</strong> after verification</li>
              <li>You can then pick up your order from the store</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <LiquidGlassButton
              onClick={() => navigate('/orders')}
              variant="secondary"
              size="md"
              fullWidth
              icon={<ShoppingBagIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              View My Orders
            </LiquidGlassButton>
            <LiquidGlassButton
              onClick={() => navigate('/')}
              variant="primary"
              size="md"
              fullWidth
              icon={<HomeIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              Back to Home
            </LiquidGlassButton>
          </div>
        </div>
      </div>
    );
  }

  // Regular success page (for future when other payment methods are available)
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Order Number:</span> <span className="font-semibold text-blue-600">{defaultOrderNumber}</span></p>
                <p><span className="text-gray-600">Transaction ID:</span> {defaultTransactionId}</p>
                <p><span className="text-gray-600">Payment Method:</span> {getMethodDisplayName(method)}</p>
                <p><span className="text-gray-600">Amount Paid:</span> LKR {defaultAmount?.toFixed(2)}</p>
                <p><span className="text-gray-600">Status:</span> <span className="text-green-600 font-medium">Completed</span></p>
              </div>
            </div>
            
            {defaultDeliveryInfo && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {defaultDeliveryInfo.deliveryType === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Name:</span> {defaultDeliveryInfo.firstName} {defaultDeliveryInfo.lastName}</p>
                  <p><span className="text-gray-600">Email:</span> {defaultDeliveryInfo.email}</p>
                  <p><span className="text-gray-600">Phone:</span> {defaultDeliveryInfo.phone}</p>
                  {defaultDeliveryInfo.deliveryType === 'delivery' ? (
                    <>
                      <p><span className="text-gray-600">Address:</span> {defaultDeliveryInfo.address}</p>
                      <p><span className="text-gray-600">City:</span> {defaultDeliveryInfo.city}, {defaultDeliveryInfo.state} {defaultDeliveryInfo.postalCode}</p>
                    </>
                  ) : (
                    <p><span className="text-gray-600">Pickup Location:</span> {getPickupLocationName(defaultDeliveryInfo.pickupLocation)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pickup Verification (if pickup) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Verification</h2>

          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              4-Digit Pickup Code
            </h3>
            <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300 inline-block">
              <span className="text-4xl font-bold text-gray-900 tracking-widest">
                {stableManualCode || '----'}
              </span>
            </div>
            <LiquidGlassButton
              onClick={() => copyToClipboard(stableManualCode)}
              disabled={!stableManualCode}
              variant="primary"
              size="md"
            >
              Copy Code
            </LiquidGlassButton>
            <p className="text-sm text-gray-600 mt-3">
              Provide this code to store staff for pickup verification
            </p>
          </div>
          
          {/* Pickup Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Pickup Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Bring this receipt to store staff</li>
              <li>• Provide the 4-digit pickup code: <strong>{stableManualCode || '----'}</strong></li>
              <li>• Show valid ID matching the order name</li>
              <li>• Pick up from: <strong>{defaultDeliveryInfo?.pickupLocation ? getPickupLocationName(defaultDeliveryInfo.pickupLocation) : 'Location to be determined'}</strong></li>
            </ul>
          </div>
        </div>

        {/* Download Receipt */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Receipt</h2>
          <div className="flex items-center space-x-4">
            <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <p className="text-gray-900">Download your payment receipt as a PDF</p>
              <p className="text-sm text-gray-600">Includes all transaction details and pickup information</p>
            </div>
            <LiquidGlassButton
              onClick={generatePDF}
              variant="primary"
              size="lg"
              icon={<DocumentArrowDownIcon className="h-5 w-5" />}
              iconPosition="left"
            >
              Download PDF
            </LiquidGlassButton>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <EnvelopeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Email Confirmation</h3>
              <p className="text-sm text-gray-600">
                Check your email for order confirmation and pickup details
              </p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <ShoppingBagIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Pickup Ready</h3>
              <p className="text-sm text-gray-600">
                Your order will be ready for pickup at the selected location
              </p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <KeyIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Easy Pickup</h3>
              <p className="text-sm text-gray-600">
                Use 4-digit code for quick verification
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <LiquidGlassButton
            onClick={() => navigate('/')}
            variant="primary"
            size="lg"
            icon={<HomeIcon className="h-5 w-5" />}
            iconPosition="left"
          >
            Back to Home
          </LiquidGlassButton>
          
          <LiquidGlassButton
            onClick={() => navigate('/products')}
            variant="secondary"
            size="lg"
            icon={<ShoppingBagIcon className="h-5 w-5" />}
            iconPosition="left"
          >
            Continue Shopping
          </LiquidGlassButton>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
