import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import enrollmentService from '../services/enrollmentService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import {
  AcademicCapIcon,
  ClockIcon,
  PlayCircleIcon,
  ChartBarIcon,
  BookOpenIcon,
  TrophyIcon,
  FireIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  PlayCircleIcon as PlayCircleSolid,
  CheckCircleIcon as CheckCircleSolid
} from '@heroicons/react/24/solid';

const MyLearning = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // State
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, in-progress, completed
  const [sortBy, setSortBy] = useState('recent'); // recent, progress, alphabetical
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0,
    currentStreak: 0,
    certificates: 0
  });

  // Load enrollments on component mount
  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  // Fetch user enrollments
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getEnrollments({
        sortBy: 'enrolledAt',
        order: 'desc'
      });

      if (response.success) {
        const enrollmentData = response.data.enrollments || [];
        setEnrollments(enrollmentData);
        calculateStats(enrollmentData);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  // Calculate learning statistics
  const calculateStats = (enrollmentData) => {
    const totalCourses = enrollmentData.length;
    const completedCourses = enrollmentData.filter(e => e.status === 'completed').length;
    const totalProgress = enrollmentData.reduce((sum, e) => sum + (e.progress || 0), 0);
    const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
    
    // Calculate total learning hours (estimate based on course durations)
    const totalHours = enrollmentData.reduce((sum, e) => {
      const courseDuration = e.course?.duration || 0; // in minutes
      const progress = e.progress || 0;
      return sum + ((courseDuration * progress) / 100 / 60); // convert to hours
    }, 0);

    setStats({
      totalCourses,
      completedCourses,
      totalHours: Math.round(totalHours * 10) / 10, // round to 1 decimal
      averageProgress,
      currentStreak: 0, // TODO: Calculate based on daily activity
      certificates: completedCourses // For now, certificates = completed courses
    });
  };

  // Filter and sort enrollments
  const getFilteredEnrollments = () => {
    let filtered = [...enrollments];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(enrollment =>
        enrollment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.course?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.instructor?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'in-progress') {
        filtered = filtered.filter(e => e.status === 'active' && (e.progress || 0) < 100);
      } else if (filterStatus === 'completed') {
        filtered = filtered.filter(e => e.status === 'completed' || (e.progress || 0) >= 100);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'alphabetical':
          return (a.course?.title || '').localeCompare(b.course?.title || '');
        case 'recent':
        default:
          return new Date(b.lastAccessedAt || b.enrolledAt) - new Date(a.lastAccessedAt || a.enrolledAt);
      }
    });

    return filtered;
  };

  // Continue learning (navigate to course player)
  const continueLearning = (enrollment) => {
    navigate(`/learn/${enrollment.course._id}`);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'text-green-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-blue-500';
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
              Loading your courses...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredEnrollments = getFilteredEnrollments();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <Header />
      
      {/* Header Section */}
      <div className={`border-b transition-colors ${
        isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold flex items-center gap-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <AcademicCapIcon className="h-8 w-8 text-purple-500" />
                My Learning
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Track your progress and continue your learning journey
              </p>
            </div>
            {enrollments.length > 0 && (
              <Link
                to="/courses"
                className="btn-primary flex items-center gap-2"
              >
                <PlayCircleIcon className="h-5 w-5" />
                Browse More Courses
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {enrollments.length === 0 ? (
          /* Empty State */
          <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white border-gray-300'
          }`}>
            <BookOpenIcon className={`h-20 w-20 mx-auto mb-6 ${
              isDarkMode ? 'text-slate-600' : 'text-gray-400'
            }`} />
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Start Your Learning Journey
            </h2>
            <p className={`text-lg mb-8 max-w-md mx-auto ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              You haven't enrolled in any courses yet. Explore our catalog and find the perfect course for you!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlayCircleIcon className="h-6 w-6 mr-2" />
              Browse Courses
            </Link>
          </div>
        ) : (
          <>
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Enrolled Courses
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stats.totalCourses}
                    </p>
                  </div>
                  <BookOpenIcon className="h-12 w-12 text-blue-500" />
                </div>
              </div>

              <div className={`p-6 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Completed
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stats.completedCourses}
                    </p>
                  </div>
                  <TrophyIcon className="h-12 w-12 text-green-500" />
                </div>
              </div>

              <div className={`p-6 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Learning Hours
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stats.totalHours}h
                    </p>
                  </div>
                  <ClockIcon className="h-12 w-12 text-purple-500" />
                </div>
              </div>

              <div className={`p-6 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700/50' 
                  : 'bg-white border-gray-200'
              } shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Avg Progress
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stats.averageProgress}%
                    </p>
                  </div>
                  <ChartBarIcon className="h-12 w-12 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className={`rounded-xl border p-6 mb-8 transition-colors ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  />
                </div>

                {/* Filter by Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-3 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                >
                  <option value="all">All Courses</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Sort by */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-3 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                >
                  <option value="recent">Recently Accessed</option>
                  <option value="progress">Progress</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Course Grid */}
            {filteredEnrollments.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-white'
              }`}>
                <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  No courses match your current filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.map((enrollment) => {
                  const course = enrollment.course;
                  const progress = enrollment.progress || 0;
                  const isCompleted = progress >= 100 || enrollment.status === 'completed';
                  
                  return (
                    <div
                      key={enrollment._id}
                      className={`rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' 
                          : 'bg-white border-gray-200 hover:shadow-xl'
                      }`}
                      onClick={() => continueLearning(enrollment)}
                    >
                      {/* Course Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-purple-600 to-pink-600">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpenIcon className="h-16 w-16 text-white/70" />
                          </div>
                        )}
                        
                        {/* Progress Badge */}
                        <div className="absolute top-3 right-3">
                          {isCompleted ? (
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <CheckCircleSolid className="h-4 w-4" />
                              Completed
                            </div>
                          ) : (
                            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {Math.round(progress)}%
                            </div>
                          )}
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                          <PlayCircleSolid className="h-16 w-16 text-white" />
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="p-6">
                        <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {course.title}
                        </h3>
                        
                        <p className={`text-sm mb-4 line-clamp-2 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          {course.description}
                        </p>

                        {/* Course Meta */}
                        <div className="flex items-center justify-between text-xs mb-4">
                          <div className={`flex items-center gap-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            <ClockIcon className="h-4 w-4" />
                            {formatDuration(course.duration)}
                          </div>
                          <div className={`flex items-center gap-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            <StarIcon className="h-4 w-4" />
                            {course.averageRating || 'No ratings'}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                              Progress
                            </span>
                            <span className={`font-semibold ${getProgressColor(progress)}`}>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${
                            isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                          }`}>
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Continue Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            continueLearning(enrollment);
                          }}
                          className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                          <PlayCircleIcon className="h-5 w-5" />
                          {isCompleted ? 'Review Course' : 'Continue Learning'}
                        </button>

                        {/* Last Accessed */}
                        <p className={`text-xs mt-3 text-center ${
                          isDarkMode ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          Last accessed: {new Date(enrollment.lastAccessedAt || enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MyLearning;
