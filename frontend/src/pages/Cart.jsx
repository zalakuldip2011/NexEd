import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingCartIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  TagIcon 
} from '@heroicons/react/24/outline';

const Cart = () => {
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
            <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
            Shopping Cart
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            0 courses in cart
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
          <ShoppingCartIcon className={`h-20 w-20 mx-auto mb-6 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h2 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Your Cart is Empty
          </h2>
          <p className={`text-lg mb-8 max-w-md mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Looks like you haven't added any courses to your cart yet. Browse our courses and start learning today!
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ShoppingCartIcon className="h-6 w-6 mr-2" />
            Browse Courses
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className={`p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <ShieldCheckIcon className={`h-10 w-10 mx-auto mb-4 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
            <h3 className={`font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Secure Checkout
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your payment information is safe and encrypted
            </p>
          </div>

          <div className={`p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <CreditCardIcon className={`h-10 w-10 mx-auto mb-4 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Multiple Payment Options
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Pay with credit card, PayPal, or other methods
            </p>
          </div>

          <div className={`p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <TagIcon className={`h-10 w-10 mx-auto mb-4 ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <h3 className={`font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              30-Day Money Back
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Not satisfied? Get a full refund within 30 days
            </p>
          </div>
        </div>

        {/* Promo Banner */}
        <div className={`mt-12 p-8 rounded-xl bg-gradient-to-r ${
          isDarkMode 
            ? 'from-blue-900/50 to-purple-900/50' 
            : 'from-blue-50 to-purple-50'
        } border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
          <div className="text-center">
            <h3 className={`text-2xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              🎉 Special Offer!
            </h3>
            <p className={`text-lg mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Get 20% off on your first course purchase
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Use code: <span className="font-mono font-bold text-blue-500">WELCOME20</span> at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
