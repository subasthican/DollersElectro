import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  KeyIcon, 
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface LocationState {
  resetToken: string;
  email: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Redirect if no reset token
  useEffect(() => {
    if (!state?.resetToken) {
      toast.error('Invalid reset session. Please try again.');
      navigate('/login');
    }
  }, [state, navigate]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const isPasswordValid = newPassword && passwordErrors.length === 0;
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Check if passwords are empty
    if (!newPassword || !confirmPassword) {
      toast.error('❌ Please fill in both password fields');
      return;
    }

    // Validation: Check if passwords meet requirements
    if (passwordErrors.length > 0) {
      const missingRequirements = passwordErrors.join(', ');
      toast.error(`❌ Password must include: ${missingRequirements}`);
      return;
    }

    // Validation: Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error('❌ Passwords do not match! Please re-enter.');
      return;
    }

    setIsResetting(true);
    console.log('🔄 Starting password reset...');
    console.log('📧 Email:', state.email);
    console.log('🔑 Reset Token:', state.resetToken ? 'Present' : 'Missing');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: state.resetToken,
          newPassword
        })
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        toast.success('✅ Password reset successfully! Redirecting to login...', {
          duration: 4000,
          icon: '🎉'
        });
        console.log('✅ Password reset successful, redirecting...');
        
        // Clear form
        setNewPassword('');
        setConfirmPassword('');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2500);
      } else {
        console.error('❌ Password reset failed:', data.message);
        toast.error(`❌ ${data.message || 'Failed to reset password'}`);
        setIsResetting(false);
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      toast.error('❌ Failed to reset password. Please try again.');
      setIsResetting(false);
    }
  };

  if (!state?.resetToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <KeyIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="mt-3 text-gray-600">
              Create a new strong password for
            </p>
            <p className="mt-1 text-blue-600 font-medium">{state.email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                {[
                  { text: 'At least 8 characters', valid: newPassword && newPassword.length >= 8 },
                  { text: 'One uppercase letter', valid: newPassword && /[A-Z]/.test(newPassword) },
                  { text: 'One lowercase letter', valid: newPassword && /[a-z]/.test(newPassword) },
                  { text: 'One number', valid: newPassword && /[0-9]/.test(newPassword) }
                ].map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {req.valid ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-red-300" />
                    )}
                    <span className={req.valid ? 'text-green-600 font-medium' : 'text-red-600'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              <div className="mt-3">
                {confirmPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    {passwordsMatch ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-semibold">✓ Passwords match!</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center">
                          <span className="text-red-500 text-xs font-bold">✕</span>
                        </div>
                        <span className="text-red-600 font-semibold">✗ Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
                {!confirmPassword && newPassword && (
                  <div className="text-sm text-gray-500 italic">
                    Please confirm your password
                  </div>
                )}
              </div>
            </div>

            {/* Validation Summary */}
            {(newPassword || confirmPassword) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                <ul className="text-xs text-blue-700 space-y-0.5">
                  <li className={newPassword.length >= 8 ? 'line-through text-green-600' : ''}>
                    • Minimum 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'line-through text-green-600' : ''}>
                    • At least one uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'line-through text-green-600' : ''}>
                    • At least one lowercase letter (a-z)
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? 'line-through text-green-600' : ''}>
                    • At least one number (0-9)
                  </li>
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={(e) => {
                // Show error message when button is clicked but disabled
                if (!newPassword || !confirmPassword) {
                  e.preventDefault();
                  toast.error('❌ Please enter both passwords');
                  return;
                }
                if (!isPasswordValid) {
                  e.preventDefault();
                  toast.error('❌ Password does not meet requirements');
                  return;
                }
                if (!passwordsMatch) {
                  e.preventDefault();
                  toast.error('❌ Passwords do not match');
                  return;
                }
              }}
              disabled={isResetting || !isPasswordValid || !passwordsMatch}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-full font-semibold text-lg
                       hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl
                       disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
            >
              {isResetting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting Password...
                </span>
              ) : !newPassword || !confirmPassword ? (
                '⚠️ Please Enter Passwords'
              ) : !isPasswordValid || !passwordsMatch ? (
                '🔒 Complete Requirements to Continue'
              ) : (
                '🔐 Reset Password'
              )}
            </button>

            {/* Button Help Text */}
            {!newPassword && !confirmPassword && (
              <p className="text-xs text-red-600 text-center -mt-2 font-semibold animate-pulse">
                ⚠️ Both password fields are required
              </p>
            )}
            {newPassword && !isPasswordValid && (
              <p className="text-xs text-red-600 text-center -mt-2 font-semibold">
                ⚠️ Password does not meet all requirements above
              </p>
            )}
            {isPasswordValid && confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-600 text-center -mt-2 font-semibold animate-pulse">
                ⚠️ Passwords must match exactly
              </p>
            )}
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Choose a strong, unique password you haven't used before
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
