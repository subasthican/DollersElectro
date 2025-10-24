import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { createOrder } from '../store/slices/orderSlice';
import { useCart } from '../contexts/CartContext';
import { productHelpers } from '../services/api/productAPI';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CreditCardIcon, 
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import PaymentMethod from '../components/payment/PaymentMethod';
import CreditCardForm from '../components/payment/CreditCardForm';
import PayPalForm from '../components/payment/PayPalForm';
import BankTransferForm from '../components/payment/BankTransferForm';
import CryptoPaymentForm from '../components/payment/CryptoPaymentForm';
import LiquidGlassButton from '../components/LiquidGlassButton';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get amount, items, and delivery info from location state or default to 0
  const amount = location.state?.total || 299.99;
  const items = location.state?.items || [];
  const deliveryInfo = location.state?.deliveryInfo || null;

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setIsProcessing(true);
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('User not authenticated. Please login first.');
      }
      
      // Create order data for database using checkout endpoint
      const orderData = {
        cartItems: items.map((item: any) => ({
          product: item.product?._id || item.product?.id,
          quantity: item.quantity
        })),
        paymentMethod: 'bank_transfer' as 'bank_transfer' | 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery', // Only bank transfer available now
        deliveryMethod: 'store_pickup' as 'home_delivery' | 'store_pickup' | 'express_delivery' // Only pickup available
      };

      // Create order in database (will be pending_payment status)
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      // Clear cart after successful order creation
      clearCart();

      // Show success message and redirect to upload payment bill
      toast.success(`✅ Order #${result.orderNumber} created! Please upload your payment bill.`);
      navigate('/payment-success', { 
        state: { 
          amount, 
          method: 'bank_transfer',
          orderNumber: result.orderNumber,
          orderId: result._id,
          deliveryInfo: deliveryInfo,
          status: 'pending_payment',
          nextStep: 'upload_bill'
        } 
      });
      
    } catch (error: any) {
      let errorMessage = 'Order creation failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('User not authenticated')) {
          errorMessage = 'Please login first to create an order.';
        } else if (error.message.includes('Product') && error.message.includes('not found')) {
          errorMessage = 'One or more products are no longer available. Please refresh your cart.';
        } else if (error.message.includes('Cart items are required')) {
          errorMessage = 'Your cart is empty. Please add items before checkout.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <CreditCardForm 
            onSubmit={handlePaymentSubmit} 
            isLoading={isProcessing} 
          />
        );
      case 'paypal':
        return (
          <PayPalForm 
            onSubmit={handlePaymentSubmit} 
            isLoading={isProcessing} 
          />
        );
      case 'bank':
        return (
          <BankTransferForm 
            onSubmit={handlePaymentSubmit} 
            isLoading={isProcessing} 
            amount={amount}
          />
        );
      case 'crypto':
        return (
          <CryptoPaymentForm 
            onSubmit={handlePaymentSubmit} 
            isLoading={isProcessing} 
            amount={amount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Apple iOS 26 Glassy */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-700 hover:text-blue-600 backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl border border-white/50 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">💳 Payment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm backdrop-blur-xl bg-green-50/80 px-4 py-2 rounded-full border-2 border-green-200/60 shadow-lg">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-900">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Order Summary - iOS 26 Glassy */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Order Summary</h2>
            <div className="text-sm font-bold text-blue-700 backdrop-blur-xl bg-blue-50/80 px-4 py-2 rounded-full border-2 border-blue-200/60 shadow-lg">
              Guest Checkout Available
            </div>
          </div>
          
          {items.length > 0 ? (
            <div className="space-y-3 mb-4">
              {items.map((item: any) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={item.product?.image || '/placeholder-product.jpg'} 
                      alt={item.product?.name || 'Product'} 
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">
                    {productHelpers.formatPrice((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No items in cart</p>
              <p className="text-sm">Using default test amount</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">{productHelpers.formatPrice(amount)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              You can complete this purchase without creating an account
            </p>
          </div>
        </div>

        {/* Delivery Information - iOS 26 Glassy */}
        {deliveryInfo && (
          <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Contact Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Name:</span> {deliveryInfo.firstName} {deliveryInfo.lastName}</p>
                  <p><span className="text-gray-600">Email:</span> {deliveryInfo.email}</p>
                  <p><span className="text-gray-600">Phone:</span> {deliveryInfo.phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {deliveryInfo.deliveryType === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
                </h3>
                <div className="space-y-2 text-sm">
                  {deliveryInfo.deliveryType === 'delivery' ? (
                    <>
                      <p><span className="text-gray-600">Address:</span> {deliveryInfo.address}</p>
                      <p><span className="text-gray-600">City:</span> {deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.postalCode}</p>
                      <p><span className="text-gray-600">Country:</span> {deliveryInfo.country}</p>
                    </>
                  ) : (
                    <p><span className="text-gray-600">Location:</span> {deliveryInfo.pickupLocation}</p>
                  )}
                </div>
              </div>
            </div>
            
            {deliveryInfo.deliveryInstructions && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Delivery Instructions</h3>
                <p className="text-sm text-gray-600">{deliveryInfo.deliveryInstructions}</p>
              </div>
            )}
            
            {(deliveryInfo.preferredDeliveryDate || deliveryInfo.preferredDeliveryTime) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Preferred Time</h3>
                <div className="text-sm text-gray-600">
                  {deliveryInfo.preferredDeliveryDate && (
                    <p>Date: {new Date(deliveryInfo.preferredDeliveryDate).toLocaleDateString()}</p>
                  )}
                  {deliveryInfo.preferredDeliveryTime && (
                    <p>Time: {deliveryInfo.preferredDeliveryTime}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods Selection */}
        {!selectedMethod && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h2>
            
            {/* Available Method - Bank Transfer */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-green-700 mb-3">✅ Available Now</h3>
              <div className="grid grid-cols-1 gap-4">
                <PaymentMethod
                  method="bank"
                  selected={false}
                  onSelect={handleMethodSelect}
                />
              </div>
            </div>

            {/* Coming Soon Methods */}
            <div>
              <h3 className="text-sm font-medium text-yellow-700 mb-3">🔜 Coming Soon</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative opacity-50 cursor-not-allowed">
                  <PaymentMethod
                    method="card"
                    selected={false}
                    onSelect={() => {}}
                  />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Coming Soon 🚀
                    </span>
                  </div>
                </div>
                
                <div className="relative opacity-50 cursor-not-allowed">
                  <PaymentMethod
                    method="paypal"
                    selected={false}
                    onSelect={() => {}}
                  />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Coming Soon 🚀
                    </span>
                  </div>
                </div>
                
                <div className="relative opacity-50 cursor-not-allowed">
                  <PaymentMethod
                    method="crypto"
                    selected={false}
                    onSelect={() => {}}
                  />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Coming Soon 🚀
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {selectedMethod && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedMethod === 'card' && 'Credit/Debit Card Payment'}
                {selectedMethod === 'paypal' && 'PayPal Payment'}
                {selectedMethod === 'bank' && 'Bank Transfer Payment'}
                {selectedMethod === 'crypto' && 'Cryptocurrency Payment'}
              </h2>
              <LiquidGlassButton
                onClick={() => setSelectedMethod('')}
                variant="secondary"
                size="sm"
              >
                Change Method
              </LiquidGlassButton>
            </div>
            
            {renderPaymentForm()}
          </div>
        )}

        {/* Security Information */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Your Payment is Secure</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• All transactions are encrypted with SSL technology</p>
                <p>• We never store your full payment details</p>
                <p>• PCI DSS compliant payment processing</p>
                <p>• 256-bit encryption for data protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Icons */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="font-medium text-gray-900 mb-4 text-center">Accepted Payment Methods</h3>
          <div className="flex justify-center items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-600">Visa</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCardIcon className="h-8 w-8 text-red-600" />
              <span className="text-sm text-gray-600">Mastercard</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCardIcon className="h-8 w-8 text-green-600" />
              <span className="text-sm text-gray-600">American Express</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-600">Discover</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
