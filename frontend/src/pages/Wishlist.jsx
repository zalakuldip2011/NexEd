import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  SparklesIcon,
  TrashIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Header from '../components/layout/Header';

const Wishlist = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const [removing, setRemoving] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      setRemoving(prev => ({ ...prev, [courseId]: true }));
      await removeFromWishlist(courseId);
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      toast.error('Failed to remove course from wishlist');
    } finally {
      setRemoving(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleAddToCart = async (courseId) => {
    try {
      setAddingToCart(prev => ({ ...prev, [courseId]: true }));
      await addToCart(courseId);
      toast.success('Course added to cart!');
      // Optionally remove from wishlist after adding to cart
      // await handleRemoveFromWishlist(courseId);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const enrollNow = (courseId) => {
    navigate(`/courses/${courseId}/enroll`);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <LoadingSpinner />
      </>
    );
  }

  const hasItems = wishlistItems.length > 0;

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
            <HeartIconSolid className="h-8 w-8 text-pink-500" />
            My Wishlist
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'course' : 'courses'} in your wishlist
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {hasItems ? (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const course = item.course;
              const isFree = course?.price === 0;

              return (
                <div
                  key={item._id}
                  className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  {/* Thumbnail with Remove Button */}
                  <div className="relative">
                    <Link to={`/courses/${course?._id}`}>
                      <img
                        src={course?.thumbnail || '/api/placeholder/400/200'}
                        alt={course?.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(course?._id)}
                      disabled={removing[course?._id]}
                      className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-all group"
                      title="Remove from wishlist"
                    >
                      {removing[course?._id] ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
                      ) : (
                        <HeartIconSolid className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                      )}
                    </button>

                    {/* Level Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      {course?.level}
                    </div>

                    {/* FREE Badge */}
                    {isFree && (
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                        FREE
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-5">
                    <p className="text-sm text-purple-500 font-semibold mb-2">
                      {course?.category}
                    </p>
                    
                    <Link 
                      to={`/courses/${course?._id}`}
                      className={`font-bold text-lg mb-2 line-clamp-2 hover:text-blue-500 transition-colors block ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {course?.title}
                    </Link>

                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      by {course?.instructor?.profile?.firstName} {course?.instructor?.profile?.lastName}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⭐</span>
                        <span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {course?.rating || 'N/A'}
                        </span>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          ({course?.studentsCount || 0})
                        </span>
                      </div>
                      
                      {!isFree && (
                        <span className="text-xl font-bold text-blue-500">
                          ₹{course?.price}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {isFree ? (
                        <button
                          onClick={() => enrollNow(course?._id)}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <BookOpenIcon className="h-5 w-5" />
                          Enroll Now - FREE
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => addToCart(course?._id)}
                            disabled={addingToCart[course?._id]}
                            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addingToCart[course?._id] ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCartIcon className="h-5 w-5" />
                                Add to Cart
                              </>
                            )}
                          </button>
                          <Link
                            to={`/courses/${course?._id}/enroll`}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            Buy Now
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <>
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
          </>
        )}

        {/* Info Cards - Only show when wishlist is empty */}
        {!hasItems && (
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
        )}
      </div>
    </div>
  );
};

export default Wishlist;
