import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { updateUserPassword, logout } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import LiquidGlassButton from '../components/LiquidGlassButton';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [changePasswordToken, setChangePasswordToken] = useState<string | null>(null);
  const [tempUserEmail, setTempUserEmail] = useState<string>('');
  const [tempUserRole, setTempUserRole] = useState<string>('customer');

  useEffect(() => {
    // Check if coming from login with temporary password (has token in state)
    if (location.state?.changePasswordToken) {
      console.log('✅ Temporary password change flow (from login)');
      setChangePasswordToken(location.state.changePasswordToken);
      setTempUserEmail(location.state.email || '');
      setTempUserRole(location.state.role || 'customer');
      setIsFirstLogin(true);
      return;
    }

    // Otherwise, check if authenticated (existing flow)
    if (!isAuthenticated) {
      console.log('🔴 Not authenticated and no token, redirecting to login');
      navigate('/login');
      return;
    }

    // Check if this is a first login (temporary password)
    if (location.state?.isFirstLogin || user?.isTemporaryPassword) {
      console.log('✅ First login detected, user has temporary password');
      setIsFirstLogin(true);
    } else {
      console.log('ℹ️ Regular password change (not first login)');
      setIsFirstLogin(false);
    }
  }, [isAuthenticated, navigate, location.state, user]);

  // Prevent back button navigation if user has temporary password (unless they explicitly chose to log out)
  useEffect(() => {
    if (isAuthenticated && user?.isTemporaryPassword && !allowNavigation) {
      // Block back button
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        console.log('🔴 Back button blocked - you must change your password first');
        toast.error('You must change your password before continuing. Click "Back to Login" if you want to log out.');
        navigate('/change-password', { replace: true });
      };

      window.addEventListener('popstate', handlePopState);
      
      // Push a dummy state to prevent immediate back
      window.history.pushState(null, '', window.location.pathname);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isAuthenticated, user?.isTemporaryPassword, allowNavigation, navigate]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!isFirstLogin && !formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // If we have a changePasswordToken (from login with temp password), use that flow
      if (changePasswordToken) {
        console.log('🔵 Using token-based password change');
        
        const response = await fetch('/api/auth/force-change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${changePasswordToken}`
          },
          body: JSON.stringify({ newPassword: formData.newPassword })
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Password changed successfully! Please login with your new password.');
          // Navigate back to login page
          navigate('/login', { replace: true });
        } else {
          toast.error(result.message || 'Failed to change password');
        }
        return;
      }

      // Otherwise, use the authenticated flow (existing behavior)
      console.log('🔵 Submitting password update:', {
        isFirstLogin,
        hasCurrentPassword: !!formData.currentPassword,
        hasNewPassword: !!formData.newPassword,
        userId: user?._id
      });

      const result = await dispatch(updateUserPassword({
        currentPassword: isFirstLogin ? '' : formData.currentPassword,
        newPassword: formData.newPassword,
        isFirstLogin
      })).unwrap();

      console.log('✅ Password update result:', result);

      if (result.success) {
        // Clear temporary password from admin's localStorage if user changed their password
        if (isFirstLogin && user?._id) {
          // Clear customer temporary password
          const storedCustomer = localStorage.getItem('adminTemporaryPasswords');
          if (storedCustomer) {
            const passwords = JSON.parse(storedCustomer);
            delete passwords[user._id];
            localStorage.setItem('adminTemporaryPasswords', JSON.stringify(passwords));
          }
          
          // Clear employee temporary password
          const storedEmployee = localStorage.getItem('adminEmployeeTemporaryPasswords');
          if (storedEmployee) {
            const empPasswords = JSON.parse(storedEmployee);
            delete empPasswords[user._id];
            localStorage.setItem('adminEmployeeTemporaryPasswords', JSON.stringify(empPasswords));
          }
        }
        
        toast.success(isFirstLogin ? 'Password set successfully! Welcome!' : 'Password updated successfully!');
        navigate('/');
      } else {
        console.error('❌ Password update failed:', result.message);
        toast.error(result.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('❌ Password update error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      toast.error(error.message || error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleBackToLogin = () => {
    console.log('🔵 User chose to log out and return to login page');
    setAllowNavigation(true); // Allow navigation away from this page
    dispatch(logout());
    toast.success('Logged out successfully. You can log in again when ready to change your password.');
    setTimeout(() => {
      navigate('/login');
    }, 100);
  };

  // Allow rendering if we have a changePasswordToken (temporary password flow)
  if (!isAuthenticated && !changePasswordToken) {
    return null;
  }

  const displayEmail = tempUserEmail || user?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {isFirstLogin ? (
              <CheckCircleIcon className="w-8 h-8 text-white" />
            ) : (
              <XCircleIcon className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isFirstLogin ? 'Set Your Password' : 'Change Password'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isFirstLogin 
              ? 'Please set a secure password for your account'
              : 'Update your account password'
            }
          </p>
          {displayEmail && (
            <p className="text-sm text-blue-600 font-medium mt-2">
              {displayEmail}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isFirstLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    errors.currentPassword 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-gray-200 bg-white/50 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstLogin ? 'New Password' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.newPassword 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-white/50 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.confirmPassword 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-white/50 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-3">
            <LiquidGlassButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              fullWidth
            >
              {loading ? 'Updating...' : (isFirstLogin ? 'Set Password' : 'Update Password')}
            </LiquidGlassButton>

            {isFirstLogin && (
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 bg-white/50 hover:bg-white/80 text-gray-700 hover:text-gray-900 font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Login
              </button>
            )}

            {!isFirstLogin && (
              <LiquidGlassButton
                type="button"
                onClick={() => navigate(-1)}
                variant="secondary"
                size="lg"
                fullWidth
              >
                Cancel
              </LiquidGlassButton>
            )}
          </div>
        </form>

        {isFirstLogin && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is your first login. Please set a secure password to continue using your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
