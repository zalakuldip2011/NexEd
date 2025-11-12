import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HeartIcon, ShoppingCartIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Wishlist = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors ${
        isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className={`text-3xl font-bold flex items-center gap-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <HeartIcon className="h-8 w-8 text-pink-500" />
            My Wishlist
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Save courses you're interested in and purchase them later
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Empty State */}
        <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-300'
        }`}>
          <div className="relative inline-block">
            <HeartIcon className={`h-20 w-20 mx-auto mb-6 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <SparklesIcon className="h-8 w-8 text-pink-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Your Wishlist is Empty
          </h2>
          <p className={`text-lg mb-8 max-w-md mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Explore our courses and save your favorites here. Click the heart icon on any course to add it to your wishlist!
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <HeartIcon className="h-6 w-6 mr-2" />
            Discover Courses
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className={`p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <HeartIcon className={`h-10 w-10 mx-auto mb-4 ${
              isDarkMode ? 'text-pink-400' : 'text-pink-600'
            }`} />
            <h3 className={`font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Save for Later
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Keep track of courses that interest you
            </p>
          </div>

          <div className={`p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <ShoppingCartIcon className={`h-10 w-10 mx-auto mb-4 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Easy Checkout
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add to cart and purchase when ready
            </p>
          </div>

          <div className={`p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <SparklesIcon className={`h-10 w-10 mx-auto mb-4 ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <h3 className={`font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Price Alerts
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Get notified when prices drop
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
