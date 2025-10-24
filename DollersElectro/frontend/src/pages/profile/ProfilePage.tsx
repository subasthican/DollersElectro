import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { toast } from 'react-hot-toast';
import { 
  UserIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  // Load phone number from user data when it changes
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  // Validate Sri Lankan phone number
  const validateSriLankanPhone = (phone: string): boolean => {
    // Remove spaces and special characters
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Sri Lankan formats:
    // 07XXXXXXXX (10 digits starting with 07)
    // 07X XXX XXXX (with spaces)
    // +947XXXXXXXX (with country code)
    // 0117XXXXXX or 0112XXXXXX (landline)
    
    const mobileRegex = /^(0)(7[0-9]{8})$/; // 07XXXXXXXX
    const mobileWithCodeRegex = /^\+94(7[0-9]{8})$/; // +947XXXXXXXX
    const landlineRegex = /^(0)(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)[0-9]{7}$/;
    
    return mobileRegex.test(cleaned) || mobileWithCodeRegex.test(cleaned) || landlineRegex.test(cleaned);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Only allow numbers, spaces, +, -, (, )
    value = value.replace(/[^\d\s\+\-\(\)]/g, '');
    
    // Limit to 15 characters (enough for +94 7X XXX XXXX)
    value = value.slice(0, 15);
    
    setPhoneNumber(value);
    
    // Validate if not empty
    if (value && !validateSriLankanPhone(value)) {
      setPhoneError('Invalid Sri Lankan phone number (e.g., 0771234567 or +94771234567)');
    } else {
      setPhoneError('');
    }
  };

  const handleSave = async () => {
    // Validate phone number if provided
    if (phoneNumber && !validateSriLankanPhone(phoneNumber)) {
      toast.error('Please enter a valid Sri Lankan phone number');
      return;
    }

    try {
      // Get the token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login again');
        return;
      }

      // Update user profile
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: phoneNumber
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update localStorage user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.phone = phoneNumber;
          localStorage.setItem('user', JSON.stringify(userObj));
          
          // Force page reload to reinitialize Redux state from localStorage
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }

        toast.success('Profile updated successfully! ✅', {
          style: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#111',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          },
        });
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordUpdate = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error('Password must contain uppercase, lowercase, and number');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      console.log('🔐 Updating password...');
      console.log('📧 User email:', user?.email);
      console.log('🔑 Has token:', !!token);
      
      const response = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          isFirstLogin: false
        })
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        toast.success('Password updated successfully! ✅', {
          style: {
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#fff',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
          },
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        console.error('❌ Password update failed:', data.message);
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('❌ Password update error:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section - iOS 26 Glassy */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-2xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative container-custom py-20 text-center text-white">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border-2 border-white/20 p-8 max-w-3xl mx-auto shadow-2xl">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              My <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="text-xl text-blue-50 drop-shadow">
              Manage your account settings and preferences ⚙️
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - iOS 26 Glassy */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden sticky top-8">
              <div className="p-6">
                {/* User Avatar Card */}
                <div className="mb-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/90 to-purple-600/90 flex items-center justify-center shadow-xl shadow-blue-500/50 border-4 border-white/30">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-gray-600 font-medium">{user?.email}</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6"></div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-left transition-all duration-300 transform ${
                          activeTab === tab.id
                            ? 'backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white shadow-xl shadow-blue-500/30 border-2 border-white/30 scale-105'
                            : 'backdrop-blur-xl bg-white/40 hover:bg-white/60 text-gray-700 hover:text-gray-900 border-2 border-white/40 hover:border-gray-200/60 shadow-sm hover:shadow-lg hover:scale-102'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                        <span className="font-semibold">{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content - iOS 26 Glassy */}
          <div className="lg:col-span-3">
            {/* Tab Content Card */}
            <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden">
              <div className="p-8">
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-xl shadow-blue-500/50">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Profile Information
                        </h2>
                        <p className="text-gray-600 font-medium">Update your personal details</p>
                      </div>
                    </div>
                    
                    {/* Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.firstName || ''}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                          placeholder="Enter first name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.lastName || ''}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                          placeholder="Enter last name"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email || ''}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-gray-100/60 border-2 border-gray-300/40 rounded-2xl text-gray-500 font-medium cursor-not-allowed shadow-sm"
                          disabled
                        />
                        <p className="mt-2 text-sm text-gray-600 font-medium flex items-center">
                          <span className="mr-2">🔒</span> Email cannot be changed
                        </p>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          maxLength={15}
                          className={`w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 ${
                            phoneError ? 'border-red-400' : 'border-white/40'
                          } rounded-2xl focus:outline-none focus:ring-2 ${
                            phoneError ? 'focus:ring-red-400/50 focus:border-red-300' : 'focus:ring-blue-400/50 focus:border-blue-300'
                          } focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium`}
                          placeholder="07XXXXXXXX or +947XXXXXXXX"
                        />
                        {phoneError && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <span>⚠️</span>
                            {phoneError}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-600">
                          Accepted formats: 0771234567, +94771234567, 0112345678 (landline)
                        </p>
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <button 
                        onClick={handleSave}
                        className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
                      >
                        💾 Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-xl shadow-green-500/50">
                        <ShieldCheckIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                          Security Settings
                        </h2>
                        <p className="text-gray-600 font-medium">Update your password securely</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showCurrentPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                            placeholder="Enter new password (min 8 chars, uppercase, lowercase, number)"
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
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                            placeholder="Re-enter new password"
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
                      </div>
                      
                      <button
                        onClick={handlePasswordUpdate}
                        disabled={isUpdatingPassword}
                        className="w-full backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:from-gray-400/90 disabled:to-gray-500/90 disabled:shadow-none disabled:cursor-not-allowed font-bold text-lg"
                      >
                        {isUpdatingPassword ? '⏳ Updating Password...' : '🔒 Update Password'}
                      </button>
                      
                      <p className="text-sm text-gray-600 text-center">
                        Password must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
