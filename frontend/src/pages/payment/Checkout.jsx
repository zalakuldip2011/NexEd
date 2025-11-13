import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  CreditCardIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1f2937',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af'
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  },
  hidePostalCode: false
};

const CheckoutForm = ({ courses, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Calculate total
  const totalAmount = courses.reduce((sum, course) => {
    const price = course.price || 0;
    const discount = course.discount || 0;
    return sum + (price * (1 - discount / 100));
  }, 0);

  const totalOriginalPrice = courses.reduce((sum, course) => sum + (course.price || 0), 0);
  const totalSavings = totalOriginalPrice - totalAmount;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card information');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create checkout session
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/checkout`,
        {
          courseIds: courses.map(c => c._id),
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          metadata: {
            device: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        // Redirect to Stripe Checkout
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId
        });

        if (stripeError) {
          setError(stripeError.message);
          showToast(stripeError.message, 'error');
        }
      } else {
        setError(response.data.message || 'Failed to create checkout session');
        showToast(response.data.message || 'Failed to create checkout session', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCardIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Information
          </h3>
        </div>

        <div className="space-y-4">
          {/* Stripe Card Element */}
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={(e) => {
                setCardComplete(e.complete);
                setError(e.error ? e.error.message : null);
              }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Secure Payment</p>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Summary
        </h3>

        <div className="space-y-3">
          {courses.map((course) => {
            const originalPrice = course.price || 0;
            const discount = course.discount || 0;
            const finalPrice = originalPrice * (1 - discount / 100);

            return (
              <div key={course._id} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.title}
                  </p>
                  {discount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {discount}% off
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {discount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
                      ${originalPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${finalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            {totalSavings > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Savings</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  -${totalSavings.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-primary-600 dark:text-primary-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <ArrowLeftIcon className="w-5 h-5" />
            Cancel
          </span>
        </button>

        <button
          type="submit"
          disabled={processing || !stripe || !cardComplete}
          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LockClosedIcon className="w-5 h-5" />
              Pay ${totalAmount.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {/* Payment Provider Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Powered by Stripe • Secure payment processing
        </p>
      </div>
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Get course IDs from location state or query params
        const courseIds = location.state?.courseIds || searchParams.get('courses')?.split(',');

        if (!courseIds || courseIds.length === 0) {
          showToast('No courses selected for checkout', 'error');
          navigate('/courses');
          return;
        }

        // Fetch course details
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/courses/batch`,
          { courseIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setCourses(response.data.courses);
        } else {
          throw new Error('Failed to fetch course details');
        }
      } catch (error) {
        console.error('Fetch courses error:', error);
        showToast('Failed to load course details', 'error');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [location.state, searchParams, navigate, showToast]);

  const handleSuccess = () => {
    navigate('/payment/success');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <ShoppingCartIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} in your order
          </p>
        </div>

        {/* Checkout Form */}
        <Elements stripe={stripePromise}>
          <CheckoutForm
            courses={courses}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Elements>

        {/* Trust Signals */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <LockClosedIcon className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-900 dark:text-white">Secure Payment</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">256-bit SSL encryption</p>
          </div>
          <div className="p-4">
            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-900 dark:text-white">30-Day Guarantee</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full refund available</p>
          </div>
          <div className="p-4">
            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-900 dark:text-white">Instant Access</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Start learning immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
