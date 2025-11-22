import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  SparklesIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  HeartIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../common/LoadingSpinner';

import api from '../../services/api';

const PersonalizedCoursesSection = () => {
  const { isDarkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInterests, setHasInterests] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});

  const [recommendationBreakdown, setRecommendationBreakdown] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSmartRecommendations();
      fetchWishlist();
    }
  }, [isAuthenticated, user]);

  const fetchSmartRecommendations = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/courses/smart-recommendations', {
        params: {
          limit: 12
        }
      });

      if (response.data.success) {
        setCourses(response.data.data.courses);
        setHasInterests(response.data.data.hasInterests);
        setRecommendationBreakdown(response.data.data.breakdown);
      }
    } catch (error) {
      console.error('Error fetching smart recommendations:', error);
      // Fallback to personalized courses
      fetchPersonalizedCourses();
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedCourses = async () => {
    try {
      const response = await api.get('/courses/personalized', {
        params: {
          limit: 8
        }
      });

      if (response.data.success) {
        setCourses(response.data.data.courses);
        setHasInterests(response.data.data.hasInterests);
      }
    } catch (error) {
      console.error('Error fetching personalized courses:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      
      if (response.data.success) {
        const courseIds = new Set(response.data.data.wishlist.items.map(item => item.course._id || item.course));
        setWishlistItems(courseIds);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActionLoading(prev => ({ ...prev, [`wishlist-${courseId}`]: true }));
    
    try {
      const isInWishlist = wishlistItems.has(courseId);
      
      if (isInWishlist) {
        await api.delete(`/wishlist/${courseId}`);
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
      } else {
        await api.post(`/wishlist/${courseId}`, {});
        setWishlistItems(prev => new Set([...prev, courseId]));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setActionLoading(prev => ({ ...prev, [`wishlist-${courseId}`]: false }));
    }
  };

  const addToCart = async (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActionLoading(prev => ({ ...prev, [`cart-${courseId}`]: true }));
    
    try {
      const response = await api.post(`/cart/${courseId}`, {});
      
      if (response.data.success) {
        alert('Course added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setActionLoading(prev => ({ ...prev, [`cart-${courseId}`]: false }));
    }
  };

  const enrollNow = (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to enrollment
    window.location.href = `/enroll/${courseId}`;
  };

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-16 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <SparklesIcon className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <h2 className={`text-3xl md:text-4xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {hasInterests ? 'Smart Recommendations' : 'Curated For You'}
              </h2>
            </div>
            <div className="space-y-2">
              <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {hasInterests 
                  ? 'AI-powered course selection based on your profile and learning patterns'
                  : 'Intelligently curated courses using advanced popularity algorithms'
                }
              </p>
              {recommendationBreakdown && (
                <div className={`flex flex-wrap gap-2 text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                  {recommendationBreakdown.personalized > 0 && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                      {recommendationBreakdown.personalized} personalized
                    </span>
                  )}
                  {recommendationBreakdown.featured > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                      {recommendationBreakdown.featured} featured
                    </span>
                  )}
                  {recommendationBreakdown.popular > 0 && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                      {recommendationBreakdown.popular} popular
                    </span>
                  )}
                  {recommendationBreakdown.trending > 0 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      {recommendationBreakdown.trending} trending
                    </span>
                  )}
                  {recommendationBreakdown.nextCourses > 0 && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      {recommendationBreakdown.nextCourses} learning path
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <Link
            to="/courses"
            className={`hidden md:flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
              isDarkMode
                ? 'text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20'
                : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <span>View All</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => {
            const isInWishlist = wishlistItems.has(course._id);
            const isFree = course.price === 0;
            
            return (
              <div
                key={course._id}
                className={`group rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  isDarkMode
                    ? 'bg-slate-800 border border-slate-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {/* Course Image */}
                <Link to={`/courses/${course._id}`} className="relative block h-48 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-slate-700 to-slate-600'
                        : 'bg-gradient-to-br from-gray-200 to-gray-300'
                    }`}>
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                  
                  {/* Wishlist Button - Top Left */}
                  <button
                    onClick={(e) => toggleWishlist(course._id, e)}
                    disabled={actionLoading[`wishlist-${course._id}`]}
                    className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                      isInWishlist
                        ? 'bg-red-500 text-white'
                        : isDarkMode
                        ? 'bg-slate-900/70 text-white hover:bg-red-500'
                        : 'bg-white/70 text-gray-700 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    {isInWishlist ? (
                      <HeartSolidIcon className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>

                  {/* Level Badge - Top Right */}
                  {course.level && (
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      isDarkMode
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {course.level}
                    </span>
                  )}

                  {/* FREE Tag - Bottom Right */}
                  {isFree && (
                    <span className="absolute bottom-3 right-3 px-4 py-2 rounded-lg text-sm font-bold bg-green-500 text-white backdrop-blur-sm">
                      FREE
                    </span>
                  )}
                </Link>

                {/* Course Content */}
                <div className="p-5">
                  <Link to={`/courses/${course._id}`}>
                    {/* Category */}
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {course.category}
                    </p>

                    {/* Title */}
                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      by {course.instructor?.username || 'Unknown Instructor'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      {/* Rating */}
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {course.rating ? course.rating.toFixed(1) : 'New'}
                        </span>
                        {course.reviewCount > 0 && (
                          <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                            ({course.reviewCount})
                          </span>
                        )}
                      </div>

                      {/* Price for paid courses */}
                      {!isFree && (
                        <span className={`text-lg font-bold ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          ₹{course.price}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-slate-700">
                    {isFree ? (
                      // Free Course - Enroll Now Button
                      <button
                        onClick={(e) => enrollNow(course._id, e)}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
                      >
                        Enroll Now - FREE
                      </button>
                    ) : (
                      // Paid Course - Add to Cart & Buy Now
                      <>
                        <button
                          onClick={(e) => addToCart(course._id, e)}
                          disabled={actionLoading[`cart-${course._id}`]}
                          className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                            isDarkMode
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {actionLoading[`cart-${course._id}`] ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCartIcon className="h-5 w-5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                        <Link
                          to={`/checkout/${course._id}`}
                          className={`block w-full px-4 py-2.5 text-center rounded-lg font-semibold transition-all ${
                            isDarkMode
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
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

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/courses"
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              isDarkMode
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-white bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>View All Courses</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PersonalizedCoursesSection;
