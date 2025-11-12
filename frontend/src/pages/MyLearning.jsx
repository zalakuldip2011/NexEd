import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  PlayCircleIcon,
  ChartBarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const MyLearning = () => {
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
            <AcademicCapIcon className="h-8 w-8 text-blue-500" />
            My Learning
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your progress and continue your learning journey
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
          <BookOpenIcon className={`h-20 w-20 mx-auto mb-6 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h2 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Start Your Learning Journey
          </h2>
          <p className={`text-lg mb-8 max-w-md mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            You haven't enrolled in any courses yet. Explore our catalog and find the perfect course for you!
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlayCircleIcon className="h-6 w-6 mr-2" />
            Browse Courses
          </Link>
        </div>

        {/* Stats Section - Will show when user has courses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Courses
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  0
                </p>
              </div>
              <BookOpenIcon className={`h-12 w-12 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>

          <div className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Learning Hours
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  0h
                </p>
              </div>
              <ClockIcon className={`h-12 w-12 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
          </div>

          <div className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg. Progress
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  0%
                </p>
              </div>
              <ChartBarIcon className={`h-12 w-12 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
