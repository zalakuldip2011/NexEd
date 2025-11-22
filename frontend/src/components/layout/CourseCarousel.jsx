import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  PlayIcon
} from '@heroicons/react/24/solid';

const CourseCarousel = () => {
  const { isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  // Fetch featured courses from API with new intelligent algorithm
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses/featured?limit=12');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Handle nested response structure: data.data.courses or data.data
          if (Array.isArray(data.data.courses)) {
            setCourses(data.data.courses);
          } else if (Array.isArray(data.data)) {
            setCourses(data.data);
          } else {
            console.warn('Featured courses response has unexpected structure:', data);
            setCourses([]);
          }
        }
      } catch (error) {
        console.error('Error fetching featured courses:', error);
        // Fallback to popular courses if featured fails
        try {
          const fallbackResponse = await fetch('/api/courses/popular?limit=12');
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success && fallbackData.data) {
            if (Array.isArray(fallbackData.data.courses)) {
              setCourses(fallbackData.data.courses);
            } else if (Array.isArray(fallbackData.data)) {
              setCourses(fallbackData.data);
            } else {
              console.warn('Popular courses response has unexpected structure:', fallbackData);
              setCourses([]);
            }
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback courses:', fallbackError);
          setCourses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, courses.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-yellow-500';
      case 'Hot':
        return 'bg-red-500';
      case 'New':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0h';
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  };

  const getBadge = (course) => {
    if (course.enrollmentCount > 1000) return 'Bestseller';
    if (course.averageRating >= 4.5) return 'Hot';
    const courseAge = Date.now() - new Date(course.createdAt).getTime();
    if (courseAge < 30 * 24 * 60 * 60 * 1000) return 'New'; // Less than 30 days
    return null;
  };

  // Show loading skeleton
  if (loading) {
    return (
      <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className={`h-12 w-64 rounded-lg mb-4 animate-pulse ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`} />
              <div className={`h-6 w-48 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className={`h-48 animate-pulse ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
                <div className="p-5 space-y-3">
                  <div className={`h-4 w-3/4 rounded animate-pulse ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`} />
                  <div className={`h-6 w-full rounded animate-pulse ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`} />
                  <div className={`h-4 w-1/2 rounded animate-pulse ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Ensure courses is always an array and show nothing if no courses
  if (!Array.isArray(courses) || courses.length === 0) {
    return null;
  }

  return (
    <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Featured Courses
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-curated selection of the highest quality courses
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full transition-all duration-300 ${
                currentIndex === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-110'
              } ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <ChevronLeftIcon className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              className={`p-3 rounded-full transition-all duration-300 ${
                currentIndex === maxIndex
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-110'
              } ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <ChevronRightIcon className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {courses.map((course) => {
              const badge = getBadge(course);
              return (
                <div
                  key={course._id}
                  className="w-full md:w-1/3 flex-shrink-0 px-3"
                >
                  <Link to={`/courses/${course._id}`}>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className={`group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        isDarkMode
                          ? 'bg-gray-800 shadow-lg shadow-gray-900/50'
                          : 'bg-white shadow-lg hover:shadow-2xl'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative overflow-hidden">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">
                              {course.title?.charAt(0) || 'C'}
                            </span>
                          </div>
                        )}
                        {/* Badge */}
                        {badge && (
                          <div className={`absolute top-3 left-3 ${getBadgeColor(badge)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                            {badge}
                          </div>
                        )}
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <PlayIcon className="h-8 w-8 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Category */}
                        <div className={`text-xs font-semibold mb-2 ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          {course.category}
                        </div>

                        {/* Title */}
                        <h3 className={`text-lg font-bold mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {course.title}
                        </h3>

                        {/* Instructor */}
                        <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {course.instructor?.name || 'Unknown Instructor'}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          <span className="text-yellow-500 font-bold mr-1">
                            {course.averageRating?.toFixed(1) || '0.0'}
                          </span>
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(course.averageRating || 0)
                                    ? 'text-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({course.reviewCount || 0})
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className={`flex items-center space-x-4 text-xs mb-4 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDuration(course.totalDuration)}
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {course.enrollmentCount || 0}
                          </div>
                          <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                            {course.level}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <span className={`text-2xl font-bold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {course.price === 0 ? 'Free' : `₹${course.price}`}
                            </span>
                          </div>
                          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                            Enroll
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center mt-8 md:hidden space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-purple-600 w-8'
                  : isDarkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCarousel;
