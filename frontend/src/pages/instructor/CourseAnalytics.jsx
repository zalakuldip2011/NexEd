import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import InstructorLayout from '../../components/instructor/InstructorLayout';

const CourseAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/instructor/${id}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to load course analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend, color = 'purple' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl shadow-lg p-6 ${
        isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${
          color === 'purple' ? 'from-purple-500 to-pink-500' :
          color === 'blue' ? 'from-blue-500 to-cyan-500' :
          color === 'green' ? 'from-green-500 to-emerald-500' :
          'from-yellow-500 to-orange-500'
        }`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
        {label}
      </p>
      <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
    </motion.div>
  );

  const Chart = ({ data, type = 'line', label }) => {
    // ✅ SAFE: Validate data array before spreading
    const safeData = Array.isArray(data) ? data : [];
    const maxValue = Math.max(...safeData.map(d => d.value || d.enrollments || d.revenue), 1);
    
    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </h3>
        <div className="h-64 flex items-end gap-2">
          {data.map((item, index) => {
            const value = item.value || item.enrollments || item.revenue || 0;
            const height = (value / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg min-h-[4px] relative group"
                >
                  <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs whitespace-nowrap ${
                    isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-800 text-white'
                  }`}>
                    {value}
                  </div>
                </motion.div>
                {data.length <= 15 && (
                  <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                    {item.date?.split('-')[2] || item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              Loading analytics...
            </p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  if (!analytics) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              No analytics data available
            </p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/instructor/courses')}
            className={`flex items-center gap-2 mb-4 transition-colors ${
              isDarkMode 
                ? 'text-slate-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Courses
          </button>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Course Analytics
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Track your course performance and student engagement
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={UsersIcon}
            label="Total Enrollments"
            value={analytics.overview.totalEnrollments}
            color="blue"
          />
          <StatCard
            icon={BanknotesIcon}
            label="Total Revenue"
            value={`₹${analytics.overview.totalRevenue.toLocaleString('en-IN')}`}
            color="green"
          />
          <StatCard
            icon={StarIcon}
            label="Average Rating"
            value={analytics.overview.averageRating.toFixed(1)}
            color="yellow"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Completion Rate"
            value={`${analytics.overview.completionRate.toFixed(1)}%`}
            color="purple"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl shadow-lg p-6 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <AcademicCapIcon className="h-6 w-6 text-purple-500" />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Student Progress
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Active Students
                </span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.overview.activeStudents}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Completed
                </span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.overview.completedStudents}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Avg Progress
                </span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.overview.averageProgress}%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl shadow-lg p-6 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <StarIcon className="h-6 w-6 text-yellow-500" />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Rating Distribution
              </span>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {star}
                    </span>
                    <StarSolid className="h-3 w-3 text-yellow-500" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                      style={{
                        width: `${analytics.ratingDistribution[star] > 0
                          ? (analytics.ratingDistribution[star] / analytics.overview.totalReviews) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                  <span className={`text-sm w-8 text-right ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {analytics.ratingDistribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl shadow-lg p-6 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Top Lectures
              </span>
            </div>
            <div className="space-y-2">
              {analytics.topPerformingLectures.slice(0, 3).map((lecture, index) => (
                <div key={index} className="text-sm">
                  <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {lecture.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${lecture.completionRate}%` }}
                      />
                    </div>
                    <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                      {lecture.completionRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl shadow-lg p-6 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
          >
            <Chart
              data={analytics.enrollmentTrends}
              label="Enrollment Trends (Last 30 Days)"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl shadow-lg p-6 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
          >
            <Chart
              data={analytics.revenueTrends}
              label="Revenue Trends (Last 30 Days)"
            />
          </motion.div>
        </div>

        {/* Section Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl shadow-lg p-6 mb-8 ${
            isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Section Engagement
          </h3>
          <div className="space-y-4">
            {analytics.sectionEngagement.map((section, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {section.sectionTitle}
                  </span>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                    {section.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${section.completionRate}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Reviews */}
        {analytics.recentReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl shadow-lg p-6 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {analytics.recentReviews.map((review) => (
                <div key={review.id} className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {review.userName}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {review.comment}
                  </p>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default CourseAnalytics;
