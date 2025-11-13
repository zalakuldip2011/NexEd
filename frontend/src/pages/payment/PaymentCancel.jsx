import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XCircleIcon,
  ArrowLeftIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircleIcon className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Cancelled
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your payment was cancelled. No charges were made to your account.
            You can continue shopping or try again when you're ready.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart')}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              Return to Cart
            </button>

            <button
              onClick={() => navigate('/courses')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Browse Courses
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <button
                onClick={() => navigate('/contact')}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
