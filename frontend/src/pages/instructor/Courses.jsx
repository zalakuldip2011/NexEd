import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import InstructorLayout from '../../components/instructor/InstructorLayout';
import PublishToggle from '../../components/instructor/PublishToggle';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const Courses = () => {
  const { isDarkMode } = useTheme();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, course: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching instructor courses...');
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await fetch('http://localhost:5000/api/courses/instructor', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('📦 Instructor courses response:', data);
      
      if (!response.ok) {
        console.error('❌ API Error:', data.message);
        
        // Show helpful error messages
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          // Redirect to login
          window.location.href = '/login';
          return;
        } else if (response.status === 403) {
          alert('You need instructor permissions to view this page. Please contact support.');
          return;
        } else {
          alert(`Error loading courses: ${data.message || 'Unknown error'}`);
        }
        
        setCourses([]);
        return;
      }
      
      if (data.success && Array.isArray(data.data)) {
        console.log(`✅ Loaded ${data.data.length} courses`);
        
        // Ensure each course has proper fields
        const processedCourses = data.data.map(course => ({
          ...course,
          status: course.status || (course.isPublished ? 'published' : 'draft'),
          totalEnrollments: course.totalEnrollments || course.enrolledCount || 0,
          lastUpdated: course.updatedAt || course.createdAt,
        }));
        
        setCourses(processedCourses);
        
        // Log summary
        const published = processedCourses.filter(c => c.status === 'published').length;
        const draft = processedCourses.filter(c => c.status === 'draft').length;
        console.log(`   📊 Published: ${published}, Draft: ${draft}`);
      } else {
        console.error('❌ Invalid response format:', data);
        setCourses([]);
      }
    } catch (error) {
      console.error('💥 Error fetching courses:', error);
      alert('Network error: Could not connect to server. Please check your connection.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate course completion percentage
  const calculateCompletion = (course) => {
    let score = 0;
    const checks = [
      { condition: course.title, weight: 15 },
      { condition: course.description, weight: 15 },
      { condition: course.thumbnail, weight: 10 },
      { condition: course.category, weight: 10 },
      { condition: course.price >= 0, weight: 10 },
      { condition: course.sections && course.sections.length > 0, weight: 20 },
      { condition: course.sections && course.sections.some(s => s.lectures && s.lectures.length > 0), weight: 20 }
    ];
    
    checks.forEach(check => {
      if (check.condition) score += check.weight;
    });
    
    return Math.round(score);
  };

  // Handle publish toggle
  const handlePublishToggle = (courseId, newStatus) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course._id === courseId
          ? { ...course, status: newStatus, isPublished: newStatus === 'published' }
          : course
      )
    );
  };

  // Handle validation error from publish toggle
  const handleValidationError = (courseId, errors) => {
    console.log('Course validation failed:', courseId, errors);
    // Could show a toast notification here
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (course) => {
    setDeleteDialog({ isOpen: true, course });
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, course: null });
  };

  // Handle course deletion
  const handleDeleteCourse = async () => {
    if (!deleteDialog.course) return;

    setDeleting(true);
    try {
      console.log('🗑️ Deleting course:', deleteDialog.course._id);
      
      const response = await fetch(`http://localhost:5000/api/courses/instructor/${deleteDialog.course._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete course');
      }

      // Show success toast
      success('Course deleted successfully!');

      // Remove course from state
      setCourses(prevCourses => prevCourses.filter(c => c._id !== deleteDialog.course._id));

      // Close dialog
      closeDeleteDialog();
    } catch (err) {
      console.error('❌ Error deleting course:', err);
      showError(err.message || 'Failed to delete course. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (course.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // ✅ SAFE: Validate array before spreading for sort
  const safeFiltered = Array.isArray(filteredCourses) ? filteredCourses : [];
  const sortedCourses = [...safeFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case 'oldest':
        return new Date(a.lastUpdated) - new Date(b.lastUpdated);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'enrollments':
        return b.enrollments - a.enrollments;
      default:
        return 0;
    }
  });

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const statusLower = status?.toLowerCase() || 'draft';
    
    if (statusLower === 'published') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (statusLower === 'draft') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    } else if (statusLower === 'archived') {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </InstructorLayout>
    );
  }

  // Count courses by status
  const allCount = courses.length;
  const publishedCount = courses.filter(c => c.status === 'published').length;
  const draftCount = courses.filter(c => c.status === 'draft' || !c.status).length;

  return (
    <InstructorLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Courses</h1>
            <p className={`mt-1 transition-colors ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>Manage your course content and settings</p>
          </div>
          <Link
            to="/instructor/courses/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Course
          </Link>
        </div>

        {/* Tab Filters */}
        <div className={`mb-6 border-b transition-colors ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                statusFilter === 'all'
                  ? 'border-purple-500 text-purple-600'
                  : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Courses
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                statusFilter === 'all'
                  ? 'bg-purple-100 text-purple-600'
                  : isDarkMode
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {allCount}
              </span>
            </button>
            
            <button
              onClick={() => setStatusFilter('published')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                statusFilter === 'published'
                  ? 'border-green-500 text-green-600'
                  : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Published
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                statusFilter === 'published'
                  ? 'bg-green-100 text-green-600'
                  : isDarkMode
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {publishedCount}
              </span>
            </button>
            
            <button
              onClick={() => setStatusFilter('draft')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                statusFilter === 'draft'
                  ? 'border-yellow-500 text-yellow-600'
                  : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              Draft
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                statusFilter === 'draft'
                  ? 'bg-yellow-100 text-yellow-600'
                  : isDarkMode
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {draftCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Filters and Search */}
        <div className={`rounded-lg shadow-sm border p-4 mb-6 transition-colors ${
          isDarkMode
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Filters and View Toggle */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="enrollments">Most Popular</option>
              </select>

              {/* View Mode Toggle */}
              <div className={`flex items-center rounded-lg border ${
                isDarkMode ? 'border-slate-600' : 'border-gray-300'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid or Table */}
        {sortedCourses.length === 0 ? (
          <div className={`rounded-lg shadow-sm border text-center py-12 ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className={`mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>
              <BookOpenIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>No courses found</h3>
            <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first course'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                to="/instructor/courses/create"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create your first course
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View with Completion Indicators */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course) => {
              const completion = calculateCompletion(course);
              const isDraft = !course.status || course.status === 'draft';
              
              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    isDarkMode
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-purple-500 to-indigo-600 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpenIcon className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status === 'published' ? (
                          <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {course.title || 'Untitled Course'}
                    </h3>
                    
                    <p className={`text-sm mb-4 line-clamp-2 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      {course.subtitle || 'No description'}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className={`flex items-center ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>{course.totalEnrollments || 0} students</span>
                      </div>
                      <div className={`flex items-center ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        <span>{course.totalLectures || 0} lectures</span>
                      </div>
                    </div>

                    {/* Completion Progress for Drafts */}
                    {isDraft && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                            Completion
                          </span>
                          <span className={`font-semibold ${
                            completion === 100
                              ? 'text-green-600'
                              : completion >= 70
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            {completion}%
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${
                          isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                        }`}>
                          <div
                            className={`h-full transition-all duration-500 ${
                              completion === 100
                                ? 'bg-green-500'
                                : completion >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Publish Toggle */}
                    <div className={`mb-4 pb-4 border-b ${
                      isDarkMode ? 'border-slate-700' : 'border-gray-200'
                    }`}>
                      <PublishToggle 
                        course={course}
                        onToggle={handlePublishToggle}
                        onValidationError={handleValidationError}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/instructor/courses/edit/${course._id}`)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-slate-700 text-white hover:bg-slate-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                        {isDraft ? 'Continue Editing' : 'Edit'}
                      </button>
                      
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="p-2 rounded-lg transition-colors text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {course.status === 'published' && (
                        <button
                          onClick={() => navigate(`/instructor/courses/${course._id}/analytics`)}
                          className="p-2 rounded-lg transition-colors text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          title="Analytics"
                        >
                          <ChartBarIcon className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => openDeleteDialog(course)}
                        className="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className={`rounded-lg shadow-sm border overflow-hidden ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-500'
                    }`}>
                      Course
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-500'
                    }`}>
                      Students
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-500'
                    }`}>
                      Rating
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-500'
                    }`}>
                      Revenue
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                  {sortedCourses.map((course) => (
                    <tr key={course._id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=160&q=80'} 
                            alt={course.title}
                            className="w-16 h-10 object-cover rounded bg-gray-200 mr-4"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className={`text-sm font-medium truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {course.title || 'Untitled Course'}
                            </h3>
                            <p className={`text-sm truncate ${
                              isDarkMode ? 'text-slate-400' : 'text-gray-500'
                            }`}>{course.subtitle || 'No subtitle'}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-xs ${
                                isDarkMode ? 'text-slate-500' : 'text-gray-400'
                              }`}>
                                {course.totalLectures || 0} lectures
                              </span>
                              <span className={`text-xs ${
                                isDarkMode ? 'text-slate-500' : 'text-gray-400'
                              }`}>
                                {formatDuration(course.totalDuration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PublishToggle 
                          course={course}
                          onToggle={handlePublishToggle}
                          onValidationError={handleValidationError}
                        />
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-900'
                      }`}>
                        {course.totalEnrollments || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {course.averageRating > 0 ? (
                          <div className="flex items-center">
                            <span className={`text-sm ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-900'
                            }`}>{course.averageRating.toFixed(1)}</span>
                            <span className={`text-xs ml-1 ${
                              isDarkMode ? 'text-slate-500' : 'text-gray-500'
                            }`}>
                              ({course.totalReviews || 0})
                            </span>
                          </div>
                        ) : (
                          <span className={`text-sm ${
                            isDarkMode ? 'text-slate-500' : 'text-gray-400'
                          }`}>No ratings</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-900'
                      }`}>
                        ₹{((course.price || 0) * (course.totalEnrollments || 0)).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link 
                            to={`/courses/${course._id}`}
                            className={`p-2 transition-colors ${
                              isDarkMode
                                ? 'text-slate-400 hover:text-purple-400'
                                : 'text-gray-400 hover:text-purple-600'
                            }`}
                            title="View Course"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/instructor/courses/edit/${course._id}`}
                            className={`p-2 transition-colors ${
                              isDarkMode
                                ? 'text-slate-400 hover:text-purple-400'
                                : 'text-gray-400 hover:text-purple-600'
                            }`}
                            title="Edit Course"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => navigate(`/instructor/courses/${course._id}/analytics`)}
                            className={`p-2 transition-colors ${
                              isDarkMode
                                ? 'text-slate-400 hover:text-purple-400'
                                : 'text-gray-400 hover:text-purple-600'
                            }`}
                            title="View Analytics"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog(course)}
                            className={`p-2 transition-colors ${
                              isDarkMode
                                ? 'text-slate-400 hover:text-red-400'
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                            title="Delete Course"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteCourse}
        loading={deleting}
        title="Delete Course?"
        message={`Are you sure you want to delete "${deleteDialog.course?.title}"? This action cannot be undone and will permanently remove all course content, enrollments, and data.`}
        confirmText="Delete Course"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon="danger"
      />
    </InstructorLayout>
  );
};

export default Courses;