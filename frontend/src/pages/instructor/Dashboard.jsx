import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import InstructorLayout from '../../components/instructor/InstructorLayout';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  BookOpenIcon,
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChartBarIcon,
  PencilIcon,
  EyeIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    draftCourses: 0,
    publishedCourses: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching instructor dashboard data...');
      
      // Fetch real dashboard stats from API
      const response = await fetch('http://localhost:5000/api/courses/instructor/dashboard/stats', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch dashboard data:', response.status);
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          window.location.href = '/login';
          return;
        }
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('📦 Dashboard data received:', data);
      
      if (data.success) {
        // Handle the new response structure
        const statsData = data.data.stats || {};
        const coursesData = data.data.recentCourses || [];
        
        setStats({
          totalCourses: statsData.totalCourses || 0,
          totalStudents: statsData.totalStudents || statsData.totalEnrollments || 0,
          totalRevenue: statsData.totalRevenue || 0,
          averageRating: statsData.averageRating || 0,
          draftCourses: statsData.draftCourses || 0,
          publishedCourses: statsData.publishedCourses || 0
        });
        
        setRecentCourses(coursesData);
        
        console.log('✅ Dashboard loaded:', {
          courses: statsData.totalCourses,
          published: statsData.publishedCourses,
          draft: statsData.draftCourses,
          recentCount: coursesData.length
        });
      } else {
        console.error('Dashboard API returned error:', data.message);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error);
      alert('Failed to load dashboard. Please check your connection.');
      setLoading(false);
    }
  };

  const progressItems = [
    {
      title: "Finish your course",
      description: "Complete your course to start earning",
      progress: 75,
      action: "Continue",
      link: "/instructor/courses/create"
    }
  ];

  const quickActions = [
    {
      title: "Create Course",
      description: "Start building your course",
      icon: PlusIcon,
      link: "/instructor/courses/create",
      color: "purple"
    },
    {
      title: "Edit Curriculum",
      description: "Update your course content",
      icon: PencilIcon,
      link: "/instructor/courses",
      color: "blue"
    },
    {
      title: "View Performance",
      description: "Check your course analytics",
      icon: ChartBarIcon,
      link: "/instructor/performance",
      color: "green"
    }
  ];

  const recommendations = [
    {
      title: "Create an Engaging Course",
      description: "Learn how to create courses that students love",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=60&fit=crop",
      link: "/instructor/resources"
    },
    {
      title: "Build Your Audience",
      description: "Tips to market and grow your student base",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=80&h=60&fit=crop",
      link: "/instructor/resources"
    },
    {
      title: "Get Started with Video",
      description: "Best practices for recording quality videos",
      image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=80&h=60&fit=crop",
      link: "/instructor/resources"
    }
  ];

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="p-6">
        {/* Header with Prominent CTA */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome back, {user?.name || 'Instructor'}!
            </h1>
            <p className={`mt-2 transition-colors ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Here's what's happening with your courses today
            </p>
          </div>
          
          {/* Prominent Create Course Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/instructor/courses/create')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
            }`}
          >
            <PlusIcon className="h-5 w-5" />
            Create New Course
          </motion.button>
        </div>

        {/* Empty State - Show when no courses */}
        {stats.totalCourses === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 rounded-2xl border-2 border-dashed p-12 text-center ${
              isDarkMode
                ? 'border-slate-700 bg-slate-800/30'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <AcademicCapIcon className={`mx-auto h-16 w-16 mb-4 ${
              isDarkMode ? 'text-slate-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Start Your Teaching Journey
            </h3>
            <p className={`mb-6 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Create your first course and share your knowledge with students worldwide
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/instructor/courses/create')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusIcon className="h-5 w-5" />
              Create Your First Course
            </motion.button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-300 hover:-translate-y-1 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${
                isDarkMode ? 'bg-purple-500/10' : 'bg-purple-100'
              }`}>
                <BookOpenIcon className={`h-6 w-6 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div className="ml-4 flex-1">
                <p className={`text-sm font-medium transition-colors ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Total Courses</p>
                <p className={`text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{stats.totalCourses}</p>
              </div>
            </div>
            {/* Draft/Published Breakdown */}
            <div className="mt-4 pt-4 border-t border-opacity-20 border-slate-500">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                    Published: {stats.publishedCourses}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DocumentTextIcon className={`h-4 w-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                    Draft: {stats.draftCourses}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-300 hover:-translate-y-1 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${
                isDarkMode ? 'bg-blue-500/10' : 'bg-blue-100'
              }`}>
                <UsersIcon className={`h-6 w-6 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Total Students</p>
                <p className={`text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-300 hover:-translate-y-1 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${
                isDarkMode ? 'bg-emerald-500/10' : 'bg-green-100'
              }`}>
                <CurrencyDollarIcon className={`h-6 w-6 ${
                  isDarkMode ? 'text-emerald-400' : 'text-green-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Total Revenue</p>
                <p className={`text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>${stats.totalRevenue}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-lg border p-6 transition-all duration-300 hover:-translate-y-1 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${
                isDarkMode ? 'bg-amber-500/10' : 'bg-yellow-100'
              }`}>
                <StarIcon className={`h-6 w-6 ${
                  isDarkMode ? 'text-amber-400' : 'text-yellow-500'
                }`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Average Rating</p>
                <p className={`text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{stats.averageRating}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Tracker */}
            <div className={`rounded-xl shadow-lg border p-6 transition-colors ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Your Progress</h2>
              {progressItems.map((item, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  isDarkMode 
                    ? 'border-slate-600/50 bg-slate-700/30' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-medium transition-colors ${
                      isDarkMode ? 'text-slate-200' : 'text-gray-900'
                    }`}>{item.title}</h3>
                    <Link
                      to={item.link}
                      className={`text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'text-purple-400 hover:text-purple-300' 
                          : 'text-purple-600 hover:text-purple-700'
                      }`}
                    >
                      {item.action}
                    </Link>
                  </div>
                  <p className={`text-sm mb-3 transition-colors ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>{item.description}</p>
                  <div className={`w-full rounded-full h-2 ${
                    isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-1 transition-colors ${
                    isDarkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>{item.progress}% complete</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className={`rounded-xl shadow-lg border p-6 transition-colors ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.link}
                      className={`
                        block p-4 border-2 border-dashed rounded-lg text-center hover:border-solid transition-all hover:-translate-y-0.5
                        ${isDarkMode 
                          ? action.color === 'purple' ? 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10' :
                            action.color === 'blue' ? 'border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10' :
                            'border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10'
                          : action.color === 'purple' ? 'border-purple-300 hover:border-purple-600 hover:bg-purple-50' :
                            action.color === 'blue' ? 'border-blue-300 hover:border-blue-600 hover:bg-blue-50' :
                            'border-green-300 hover:border-green-600 hover:bg-green-50'
                        }
                      `}
                    >
                      <Icon className={`
                        h-8 w-8 mx-auto mb-2 transition-colors
                        ${isDarkMode
                          ? action.color === 'purple' ? 'text-purple-400' :
                            action.color === 'blue' ? 'text-blue-400' :
                            'text-emerald-400'
                          : action.color === 'purple' ? 'text-purple-600' :
                            action.color === 'blue' ? 'text-blue-600' :
                            'text-green-600'
                        }
                      `} />
                      <h3 className={`font-medium transition-colors ${
                        isDarkMode ? 'text-slate-200' : 'text-gray-900'
                      }`}>{action.title}</h3>
                      <p className={`text-sm mt-1 transition-colors ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>{action.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Courses */}
            <div className={`rounded-xl shadow-lg border p-6 transition-colors ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Recent Courses</h2>
                <Link 
                  to="/instructor/courses"
                  className={`text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-purple-400 hover:text-purple-300' 
                      : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className={`flex items-center space-x-4 p-4 border rounded-lg transition-colors hover:-translate-y-0.5 ${
                    isDarkMode 
                      ? 'border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className={`w-16 h-12 object-cover rounded ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate transition-colors ${
                        isDarkMode ? 'text-slate-200' : 'text-gray-900'
                      }`}>{course.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors
                          ${course.status === 'Published' 
                            ? isDarkMode 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-green-100 text-green-800'
                            : isDarkMode
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-yellow-100 text-yellow-800'}
                        `}>
                          {course.status}
                        </span>
                        <span className={`text-sm transition-colors ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>{course.students} students</span>
                        {course.rating > 0 && (
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-amber-400" />
                            <span className={`text-sm ml-1 transition-colors ${
                              isDarkMode ? 'text-slate-400' : 'text-gray-500'
                            }`}>{course.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className={`p-2 transition-colors ${
                        isDarkMode 
                          ? 'text-slate-400 hover:text-purple-400' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}>
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className={`p-2 transition-colors ${
                        isDarkMode 
                          ? 'text-slate-400 hover:text-blue-400' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}>
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommendations */}
            <div className={`rounded-xl shadow-lg border p-6 transition-colors ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Recommended for you</h2>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Link
                    key={index}
                    to={rec.link}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-all hover:-translate-y-0.5 ${
                      isDarkMode 
                        ? 'hover:bg-slate-700/50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <img 
                      src={rec.image} 
                      alt={rec.title}
                      className={`w-12 h-9 object-cover rounded ${
                        isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium transition-colors ${
                        isDarkMode ? 'text-slate-200' : 'text-gray-900'
                      }`}>{rec.title}</h3>
                      <p className={`text-xs mt-1 transition-colors ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>{rec.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;