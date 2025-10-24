import React from 'react';
import { Link } from 'react-router-dom';
import { BoltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-2xl shadow-xl shadow-blue-500/50 flex items-center justify-center border-2 border-white/30">
            <BoltIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold text-gray-900">
          📧 Check your email
        </h2>
        <p className="mt-3 text-center text-lg font-medium text-gray-700">
          We've sent you a verification link to your email address.
        </p>
      </div>

      <div className="mt-8 mx-auto w-full max-w-md">
        <div className="backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/50">
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ✨ Verification email sent!
            </h3>
            
            <p className="text-gray-700 mb-8 font-medium">
              Please check your email and click the verification link to activate your account.
            </p>

            <div className="space-y-4">
              <Link to="/login" className="w-full backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg text-center block">
                🔐 Continue to login
              </Link>
              
              <button className="w-full backdrop-blur-2xl bg-gradient-to-br from-gray-500/90 to-gray-600/90 hover:from-gray-600/95 hover:to-gray-700/95 disabled:from-gray-400/90 disabled:to-gray-500/90 text-white px-8 py-4 rounded-2xl shadow-xl shadow-gray-500/30 hover:shadow-gray-500/50 disabled:shadow-none border-2 border-white/30 hover:border-white/50 disabled:border-white/20 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed font-bold text-lg">
                🔄 Resend verification email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

