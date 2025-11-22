import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
  AcademicCapIcon, 
  BookOpenIcon,
  FireIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const AuthenticatedHome = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Development', icon: '💻', color: 'blue', courses: 245 },
    { name: 'Business', icon: '💼', color: 'green', courses: 189 },
    { name: 'Finance & Accounting', icon: '📊', color: 'yellow', courses: 156 },
    { name: 'IT & Software', icon: '🖥️', color: 'purple', courses: 198 },
    { name: 'Office Productivity', icon: '📝', color: 'pink', courses: 134 },
    { name: 'Personal Development', icon: '🎯', color: 'indigo', courses: 167 },
    { name: 'Design', icon: '🎨', color: 'red', courses: 223 },
    { name: 'Marketing', icon: '📱', color: 'orange', courses: 178 },
    { name: 'Health & Fitness', icon: '💪', color: 'teal', courses: 145 },
    { name: 'Music', icon: '🎵', color: 'cyan', courses: 123 }
  ];

  // State for real feedback data
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [trendingCourses, setTrendingCourses] = useState([]);

  useEffect(() => {
    // Fetch different types of courses
    fetchAllCourseTypes();
  }, []);

  const fetchAllCourseTypes = async () => {
    try {
      setLoading(true);
      
      // Fetch featured, popular, and trending courses in parallel
      const [featuredRes, popularRes, trendingRes, feedbackRes] = await Promise.all([
        fetch('http://localhost:5000/api/courses/featured?limit=6'),
        fetch('http://localhost:5000/api/courses/popular?limit=6'),
        fetch('http://localhost:5000/api/courses/trending?limit=6'),
        fetch('http://localhost:5000/api/feedback/public?limit=4&type=website_experience')
      ]);

      const [featuredData, popularData, trendingData, feedbackData] = await Promise.all([
        featuredRes.json(),
        popularRes.json(),
        trendingRes.json(),
        feedbackRes.json()
      ]);

      if (featuredData.success) {
        // Handle nested response structure: data.data.courses or data.data
        if (Array.isArray(featuredData.data.courses)) {
          setFeaturedCourses(featuredData.data.courses);
        } else if (Array.isArray(featuredData.data)) {
          setFeaturedCourses(featuredData.data);
        } else {
          setFeaturedCourses([]);
        }
      }
      if (popularData.success) {
        if (Array.isArray(popularData.data.courses)) {
          setPopularCourses(popularData.data.courses);
        } else if (Array.isArray(popularData.data)) {
          setPopularCourses(popularData.data);
        } else {
          setPopularCourses([]);
        }
      }
      if (trendingData.success) {
        if (Array.isArray(trendingData.data.courses)) {
          setTrendingCourses(trendingData.data.courses);
        } else if (Array.isArray(trendingData.data)) {
          setTrendingCourses(trendingData.data);
        } else {
          setTrendingCourses([]);
        }
      }

      // Handle feedback data
      if (feedbackData.success && feedbackData.data.feedback) {
        // Transform API feedback format to match component expectations
        const transformedReviews = feedbackData.data.feedback.map(feedback => ({
          id: feedback._id,
          name: feedback.name,
          role: 'NexEd Student', // Default role since feedback doesn't have specific roles
          image: null,
          rating: feedback.rating,
          text: feedback.message,
          title: feedback.title,
          date: new Date(feedback.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }));
        setReviews(transformedReviews);
      } else {
        // Fallback to default message when no reviews are available
        setReviews([{
          id: 'default',
          name: 'NexEd Team',
          role: 'Platform Team',
          image: null,
          rating: 5,
          text: 'Be the first to share your experience! Click "Share Feedback" in the footer to leave a review.',
          title: 'Share Your Experience',
          date: 'Today'
        }]);
      }
      setReviewsLoading(false);

      // For backward compatibility, combine all courses
      const allCourses = [
        ...(featuredData.data || []),
        ...(popularData.data || []),
        ...(trendingData.data || [])
      ];
      setCourses(allCourses);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setFeaturedCourses([]);
      setPopularCourses([]);
      setTrendingCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
      cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
    };
    return colors[color] || colors.blue;
  };

  const CourseCard = ({ course, featured = false, popular = false, trending = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.thumbnail || 'https://via.placeholder.com/400x300'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {(featured || popular || trending) && (
          <div className={`absolute top-3 right-3 px-3 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1 ${
            featured 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
              : popular
              ? 'bg-gradient-to-r from-red-500 to-pink-500'
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}>
            {featured && (
              <>
                <StarIcon className="h-3 w-3" />
                Featured
              </>
            )}
            {popular && (
              <>
                <FireIcon className="h-3 w-3" />
                Popular
              </>
            )}
            {trending && (
              <>
                <ArrowRightIcon className="h-3 w-3" />
                Trending
              </>
            )}
          </div>
        )}
        <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
          {course.category}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {course.title}
        </h3>
        
        <p className={`text-sm mb-4 line-clamp-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {course.description}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {course.rating || 4.5}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <UsersIcon className="h-4 w-4" />
            {course.enrollmentCount || 0} students
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            {course.duration || '8h'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${course.price || 49.99}
            </span>
          </div>
          <Link
            to={`/courses/${course._id}`}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            View Course
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Header />

      {/* Welcome Banner */}
      <div className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {user?.fullName?.split(' ')[0] || user?.username}! 👋
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Ready to continue your learning journey?
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Browse by Category
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Explore courses in your favorite subjects
            </p>
          </div>
          <Link
            to="/courses"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            View All
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/courses?category=${encodeURIComponent(category.name)}`}
                className={`block p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 bg-gradient-to-br ${getColorClasses(category.color)} shadow-lg hover:shadow-xl`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-white font-bold text-sm mb-2">{category.name}</h3>
                <p className="text-white/80 text-xs">{category.courses} courses</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <StarIcon className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            <div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Featured Courses
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Intelligently curated by our AI system - top quality guaranteed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} featured={true} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Courses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <FireIcon className="h-8 w-8 text-red-500" />
          <div>
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Popular Courses
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Most loved by our students - powered by advanced popularity algorithms
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map((course) => (
              <CourseCard key={course._id} course={course} popular={true} />
            ))}
          </div>
        )}
      </div>

      {/* Trending Courses Section */}
      {trendingCourses.length > 0 && (
        <div className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <ArrowRightIcon className="h-8 w-8 text-green-500 transform rotate-45" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Trending Now
                </h2>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hot courses gaining momentum - discover what's new and exciting
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingCourses.map((course) => (
                  <CourseCard key={course._id} course={course} trending={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              What Our Students Say
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Join thousands of satisfied learners worldwide
            </p>
          </div>

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`p-6 rounded-2xl shadow-lg animate-pulse ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className={`h-4 rounded mb-3 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <div className={`h-16 rounded mb-3 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <div className={`h-4 rounded w-2/3 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl shadow-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white ${
                    index % 4 === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                    index % 4 === 1 ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                    index % 4 === 2 ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                    'bg-gradient-to-br from-pink-500 to-purple-600'
                  }`}>
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {review.name}
                    </h4>
                    <p className="text-sm text-gray-500">{review.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {review.title && (
                  <h4 className={`text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {review.title}
                  </h4>
                )}
                
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{review.text}"
                </p>

                <p className="text-xs text-gray-500">{review.date}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuthenticatedHome;
