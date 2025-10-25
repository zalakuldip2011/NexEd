import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">📚 Edemy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🎉 Welcome to Edemy, {user.username}!
            </h2>
            <p className="text-gray-300 text-lg">
              Your email has been verified and your account is ready to use.
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-700/50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Username</label>
                <p className="text-white font-semibold">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <p className="text-white font-semibold">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Role</label>
                <p className="text-white font-semibold capitalize">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email Status</label>
                <div className="flex items-center">
                  <span className="text-green-400 font-semibold">✓ Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Browse Courses</h4>
              <p className="text-gray-400 text-sm mb-4">Explore thousands of courses</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300">
                View Courses
              </button>
            </div>

            <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Update Profile</h4>
              <p className="text-gray-400 text-sm mb-4">Complete your profile information</p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-300">
                Edit Profile
              </button>
            </div>

            <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Join Community</h4>
              <p className="text-gray-400 text-sm mb-4">Connect with other learners</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-300">
                Explore Community
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">🚀 What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <span className="text-blue-400 mr-3">1.</span>
                <span>Complete your profile to get personalized course recommendations</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-blue-400 mr-3">2.</span>
                <span>Browse our course catalog and enroll in your first course</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-blue-400 mr-3">3.</span>
                <span>Join study groups and connect with instructors</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-blue-400 mr-3">4.</span>
                <span>Track your progress and earn certificates</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;