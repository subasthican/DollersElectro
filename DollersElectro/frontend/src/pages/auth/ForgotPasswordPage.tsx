import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification code sent to your email!');
        navigate('/verify-otp', {
          state: {
            email,
            type: 'reset',
            devOTP: data.data?.devOTP // For development/simulated mode
          }
        });
      } else {
        toast.error(data.message || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-2xl shadow-xl shadow-blue-500/50 flex items-center justify-center border-2 border-white/30">
              <BoltIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Forgot your password?</h1>
          <p className="text-gray-700 font-medium">Enter your email address and we'll send you a verification code to reset your password.</p>
        </div>

        {/* Reset Form - iOS 26 Glassy */}
        <div className="backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-3">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:from-gray-400/90 disabled:to-gray-500/90 disabled:shadow-none disabled:cursor-not-allowed font-bold text-lg"
                >
                  {isLoading ? '📧 Sending...' : '📧 Send verification code'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-bold text-lg">
                ⬅️ Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

