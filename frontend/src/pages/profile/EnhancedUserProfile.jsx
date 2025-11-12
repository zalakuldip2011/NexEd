import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  MoonIcon,
  SunIcon,
  CameraIcon,
  TrashIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EnhancedUserProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { success, error, warning, info } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || ''
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // Account deletion data
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: '',
    reason: '',
    confirmText: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Avatar upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'danger', name: 'Danger Zone', icon: ExclamationTriangleIcon }
  ];

  // Handle profile data change
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle password data change
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle delete account data change
  const handleDeleteDataChange = (field, value) => {
    setDeleteAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        error('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Upload avatar
  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🖼️  Uploading avatar...');
      console.log('   File:', selectedFile.name, selectedFile.size, 'bytes');
      console.log('   Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.post(`${API_URL}/auth/upload-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('   Response:', response.data);

      if (response.data.success) {
        success('Profile photo updated successfully!');
        // Update user context with new avatar
        const updatedUser = { 
          ...user, 
          profile: { 
            ...user.profile, 
            avatar: response.data.data.avatar 
          } 
        };
        updateUser(updatedUser);
        setSelectedFile(null);
        setPreviewUrl(null);
        console.log('   ✅ Avatar updated in state');
      } else {
        error(response.data.message || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('❌ Avatar upload error:', err);
      console.error('   Response:', err.response?.data);
      error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  // Update name
  const handleUpdateName = async () => {
    if (!profileData.firstName && !profileData.lastName) {
      error('Please provide at least first name or last name');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/update-name`,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        success('Name updated successfully!');
        updateUser(response.data.data.user);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/update-profile`,
        {
          'profile.bio': profileData.bio,
          'profile.phone': profileData.phone
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        success('Profile updated successfully!');
        updateUser(response.data.data.user);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Request password change OTP
  const handleRequestPasswordChange = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/request-password-change`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        success('Verification code sent to your email!');
        setOtpSent(true);
        setShowOTPInput(true);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Change password with OTP
  const handleChangePassword = async () => {
    if (!passwordData.otp) {
      error('Please enter the verification code');
      return;
    }
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      error('Please enter both password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/change-password-with-otp`,
        {
          otp: passwordData.otp,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        success('Password changed successfully!');
        setPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
        setShowOTPInput(false);
        setOtpSent(false);
        
        // Update token
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Request account deletion
  const handleRequestDeleteAccount = async () => {
    if (!deleteAccountData.password) {
      error('Please enter your password');
      return;
    }

    if (deleteAccountData.confirmText !== 'DELETE') {
      error('Please type DELETE to confirm');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/request-delete-account`,
        {
          password: deleteAccountData.password,
          reason: deleteAccountData.reason
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        success('Account deletion scheduled. Check your email for details.');
        setShowDeleteModal(false);
        setDeleteAccountData({ password: '', reason: '', confirmText: '' });
        
        // Logout after 3 seconds
        setTimeout(() => {
          logout();
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to schedule account deletion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className={`rounded-xl shadow-lg border transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50' 
            : 'bg-white border-gray-200'
        } p-8 mb-8`}>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                {previewUrl || user?.profile?.avatar ? (
                  <img
                    src={previewUrl || `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user?.profile?.avatar}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {user?.profile?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <label className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
                <CameraIcon className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h1 className={`text-3xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {user?.profile?.firstName && user?.profile?.lastName
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user?.username || 'User Profile'}
              </h1>
              <p className={`text-lg transition-colors ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                @{user?.username}
              </p>
              <p className={`transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                {user?.email}
              </p>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-300'
                }`}>
                  {user?.role === 'instructor' ? '👨‍🏫 Instructor' : '🎓 Student'}
                </span>
              </div>
            </div>
            
            {selectedFile && (
              <button
                onClick={handleAvatarUpload}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Uploading...' : 'Upload Photo'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 rounded-xl shadow-lg border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50' 
              : 'bg-white border-gray-200'
          } p-6 h-fit`}>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? isDarkMode
                          ? 'bg-purple-600/20 text-purple-300 border-l-4 border-purple-500'
                          : 'bg-purple-50 text-purple-700 border-l-4 border-purple-500'
                        : isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content - Will continue in next part */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className={`rounded-xl shadow-lg border transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } p-8`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Profile Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/50'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'
                      } focus:outline-none focus:ring-2`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/50'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'
                      } focus:outline-none focus:ring-2`}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleUpdateName}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Name'}
                  </button>
                </div>
                
                <div className={`border-t my-6 ${
                  isDarkMode ? 'border-slate-700' : 'border-gray-200'
                }`}></div>
                
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/50'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    rows={4}
                    maxLength={500}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/50'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Tell us about yourself..."
                  />
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {profileData.bio?.length || 0}/500 characters
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className={`rounded-xl shadow-lg border transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } p-8`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Settings
                </h2>
                
                {/* Dark Mode Toggle */}
                <div className={`p-6 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-slate-700/30 border-slate-600/50'
                    : 'bg-gray-50 border-gray-200'
                } mb-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'bg-slate-600' : 'bg-white'
                      }`}>
                        {isDarkMode ? (
                          <MoonIcon className="h-6 w-6 text-purple-500" />
                        ) : (
                          <SunIcon className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Dark Mode
                        </h3>
                        <p className={`text-sm transition-colors ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          Switch between light and dark themes
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        isDarkMode
                          ? 'bg-purple-600 focus:ring-offset-slate-800'
                          : 'bg-gray-200 focus:ring-offset-white'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {/* Account Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Account Information
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                            Username
                          </span>
                          <span className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            @{user?.username}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                            Email
                          </span>
                          <span className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user?.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                            Member Since
                          </span>
                          <span className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {new Date(user?.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={`rounded-xl shadow-lg border transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } p-8`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Security Settings
                </h2>
                
                {/* Password Change Section */}
                <div className={`p-6 rounded-lg border mb-6 ${
                  isDarkMode
                    ? 'bg-slate-700/30 border-slate-600/50'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-slate-600' : 'bg-white'
                    }`}>
                      <KeyIcon className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Change Password
                      </h3>
                      <p className={`text-sm mb-4 transition-colors ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Update your password to keep your account secure. We'll send a verification code to your email.
                      </p>
                      
                      {!showOTPInput ? (
                        <button
                          onClick={handleRequestPasswordChange}
                          disabled={loading}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Sending Code...' : 'Request Verification Code'}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {otpSent && (
                            <div className={`p-4 rounded-lg border-l-4 ${
                              isDarkMode
                                ? 'bg-green-900/20 border-green-500 text-green-300'
                                : 'bg-green-50 border-green-500 text-green-700'
                            }`}>
                              <p className="text-sm flex items-center">
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                Verification code sent to your email!
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              Verification Code
                            </label>
                            <input
                              type="text"
                              value={passwordData.otp}
                              onChange={(e) => handlePasswordChange('otp', e.target.value)}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                              placeholder="Enter new password"
                              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                              placeholder="Confirm new password"
                              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            />
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={handleChangePassword}
                              disabled={loading}
                              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Changing...' : 'Change Password'}
                            </button>
                            <button
                              onClick={() => {
                                setShowOTPInput(false);
                                setOtpSent(false);
                                setPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
                              }}
                              className={`px-6 py-3 rounded-lg border font-medium ${
                                isDarkMode
                                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className={`rounded-xl shadow-lg border transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } p-8`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <ExclamationTriangleIcon className="h-7 w-7 text-red-500 mr-2" />
                  Danger Zone
                </h2>
                
                {/* Warning Box */}
                <div className={`p-6 rounded-lg border-2 mb-6 ${
                  isDarkMode
                    ? 'bg-red-900/20 border-red-500/50'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 flex items-center ${
                    isDarkMode ? 'text-red-300' : 'text-red-700'
                  }`}>
                    <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                    Close Your Account
                  </h3>
                  
                  <div className={`space-y-3 text-sm ${
                    isDarkMode ? 'text-red-200' : 'text-red-600'
                  }`}>
                    <p className="font-semibold">
                      ⚠️ Warning: If you close your account, you will be unsubscribed from all your courses and will lose access to your account and data associated with your account forever, even if you choose to create a new account using the same email address in the future.
                    </p>
                    
                    <p>
                      Please note, if you want to reinstate your account after submitting a deletion request, you will have <strong>14 days</strong> after the initial submission date to reach out to <strong>privacy@edemy.com</strong> to cancel this request.
                    </p>
                  </div>
                  
                  {user?.role === 'instructor' && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                      isDarkMode
                        ? 'bg-orange-900/20 border-orange-500/50'
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <h4 className={`font-bold mb-2 flex items-center ${
                        isDarkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        👨‍🏫 Instructor Information
                      </h4>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-orange-200' : 'text-orange-600'
                      }`}>
                        <strong>Warning:</strong> You are an instructor with courses. Please note, any courses with enrollments cannot be deleted due to the lifetime guarantee provided by Edemy's Terms of Use. After account closure, courses with enrollments will be transferred to a generic Edemy instructor account so that no new enrollments can occur and enrolled learners can continue to access the course.
                      </p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium flex items-center"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Close Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          } p-8`}>
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className={`text-2xl font-bold ml-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Confirm Account Deletion
              </h3>
            </div>
            
            <div className={`space-y-4 mb-6 ${
              isDarkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              <p>
                This action will permanently delete your account after a 14-day grace period. All your data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All enrolled courses and progress</li>
                <li>Certificates and achievements</li>
                <li>Saved courses and wishlists</li>
                <li>Account settings and preferences</li>
                <li>Purchase history</li>
              </ul>
              <p className="font-semibold text-red-500">
                This action cannot be undone after the 14-day grace period!
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Password (Required)
                </label>
                <input
                  type="password"
                  value={deleteAccountData.password}
                  onChange={(e) => handleDeleteDataChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Reason for Leaving (Optional)
                </label>
                <textarea
                  value={deleteAccountData.reason}
                  onChange={(e) => handleDeleteDataChange('reason', e.target.value)}
                  rows={3}
                  placeholder="Help us improve by telling us why you're leaving..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteAccountData.confirmText}
                  onChange={(e) => handleDeleteDataChange('confirmText', e.target.value)}
                  placeholder="Type DELETE"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleRequestDeleteAccount}
                disabled={loading || deleteAccountData.confirmText !== 'DELETE'}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteAccountData({ password: '', reason: '', confirmText: '' });
                }}
                className={`flex-1 px-6 py-3 rounded-lg border font-medium ${
                  isDarkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default EnhancedUserProfile;
