import React, { useState } from 'react';
import { useAppSelector } from '../store';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'preferences' | 'notifications'>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    language: 'en',
    currency: 'LKR',
    timezone: 'UTC',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section - iOS 26 Glassy */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="container-custom py-12">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ⚙️ Account Settings
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Manage your account preferences, security settings, and privacy options
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          {/* Settings Navigation - iOS 26 Glassy */}
          <div className="mb-8">
            <nav className="flex space-x-2 backdrop-blur-2xl bg-white/60 p-2 rounded-2xl shadow-xl border-2 border-white/60">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                    activeTab === tab.id
                      ? 'backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white shadow-xl shadow-blue-500/30 border-2 border-white/30 scale-105'
                      : 'backdrop-blur-xl bg-white/40 hover:bg-white/60 text-gray-700 hover:text-gray-900 border-2 border-white/40 hover:border-gray-200/60 shadow-sm hover:shadow-md hover:scale-102'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content - iOS 26 Glassy */}
          <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden">
            <div className="p-10">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6">Change Password</h3>
                    <div className="space-y-6 max-w-xl">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={securityData.currentPassword}
                            onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-4 py-3 pr-12 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Settings */}
              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Language & Region</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Language
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Currency
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                        >
                          <option value="LKR">LKR (Rs.)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD (C$)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Timezone
                        </label>
                        <select
                          value={formData.timezone}
                          onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 shadow-sm transition-all cursor-pointer appearance-none"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="CST">Central Time</option>
                          <option value="MST">Mountain Time</option>
                          <option value="PST">Pacific Time</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">Notification Preferences</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between backdrop-blur-xl bg-white/40 rounded-2xl p-6 border-2 border-white/60 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50">
                            <EnvelopeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">Email Notifications</p>
                            <p className="text-sm text-gray-600 font-medium">Receive notifications via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-200/60 backdrop-blur-xl peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-400/30 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-lg peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 shadow-inner"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between backdrop-blur-xl bg-white/40 rounded-2xl p-6 border-2 border-white/60 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50">
                            <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">SMS Notifications</p>
                            <p className="text-sm text-gray-600 font-medium">Receive notifications via SMS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-200/60 backdrop-blur-xl peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-400/30 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-lg peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 shadow-inner"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t-2 border-gradient-to-r from-transparent via-gray-200 to-transparent pt-8 mt-10">
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold text-lg"
                  >
                    {isLoading ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
