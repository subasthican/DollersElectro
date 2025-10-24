import React, { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { newsletterAPI } from '../../services/api/newsletterAPI';
import toast from 'react-hot-toast';

const NewsletterSubscription: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    productUpdates: true,
    promotions: true,
    news: true,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await newsletterAPI.subscribe(email, preferences);
      setIsSubscribed(true);
      setEmail('');
      toast.success('Successfully subscribed to newsletter!');
    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Failed to subscribe to newsletter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Thank You for Subscribing!
        </h3>
        <p className="text-green-700 mb-4">
          You've successfully subscribed to our newsletter. You'll receive updates about our latest products and offers.
        </p>
        <button
          onClick={() => setIsSubscribed(false)}
          className="text-sm text-green-600 hover:text-green-800 underline"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <EnvelopeIcon className="h-8 w-8 mr-2" />
          <h2 className="text-2xl font-bold">Stay Updated</h2>
        </div>
        
        <p className="text-blue-100 mb-6 text-lg">
          Subscribe to our newsletter and be the first to know about new products, 
          exclusive offers, and electrical industry insights.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-sm text-blue-100 hover:text-white underline"
            >
              {showPreferences ? 'Hide' : 'Show'} Preferences
            </button>
          </div>

          {showPreferences && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-left">
              <h4 className="font-semibold mb-3">Email Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.productUpdates}
                    onChange={(e) => handlePreferenceChange('productUpdates', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Product updates and new arrivals</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Promotions and special offers</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.news}
                    onChange={(e) => handlePreferenceChange('news', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Industry news and tips</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select
                    value={preferences.frequency}
                    onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-blue-200">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSubscription;
