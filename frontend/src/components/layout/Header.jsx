import React, { useState, useRef } from 'react';
import { 
  ChevronDownIcon, 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  HeartIcon,
  BellIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for managing hover delays
  const dropdownTimerRef = useRef(null);
  const userMenuTimerRef = useRef(null);

  // Handle category dropdown hover with delay
  const handleDropdownEnter = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200); // 200ms delay before closing
  };

  // Handle user menu hover with delay
  const handleUserMenuEnter = () => {
    if (userMenuTimerRef.current) {
      clearTimeout(userMenuTimerRef.current);
    }
    setIsUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimerRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 200); // 200ms delay before closing
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBecomeEducator = () => {
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
    
    if (isAuthenticated) {
      if (user?.role === 'instructor') {
        // If already an instructor, go to instructor dashboard
        navigate('/instructor/dashboard');
      } else {
        // If user is logged in but not an instructor, go to educator onboarding
        navigate('/become-educator');
      }
    } else {
      // If not logged in, redirect to signup with educator intent
      navigate('/signup?intent=educator');
    }
  };

  const categories = [
    'Web Development',
    'Data Science',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Health & Fitness'
  ];

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-lg border-b shadow-xl transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-700/50' 
        : 'bg-white/95 border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">{/* Increased height for better proportion */}
          {/* Left Section - Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="group">
              <h1 className={`text-3xl font-bold transition-all duration-300 transform group-hover:scale-105 ${
                isDarkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}>
                Edemy
              </h1>
            </Link>
          </div>

          {/* Center Section - Categories, Search, Buttons */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 mx-8">
            {/* Categories Dropdown */}
            <div className="relative flex-shrink-0"
                 onMouseEnter={handleDropdownEnter}
                 onMouseLeave={handleDropdownLeave}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500'
                    : 'text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                }`}
              >
                Categories
                <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className={`absolute top-full left-0 mt-3 w-56 rounded-xl shadow-2xl z-50 overflow-hidden border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-slate-800/95 backdrop-blur-sm border-slate-600/50'
                    : 'bg-white/95 backdrop-blur-sm border-gray-200/50'
                }`}>
                  <div className="py-2">
                    {categories.map((category, index) => (
                      <a
                        key={index}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/courses?category=${encodeURIComponent(category)}`);
                          setIsDropdownOpen(false);
                        }}
                        className={`block px-4 py-3 text-sm transition-all duration-150 border-l-4 border-transparent ${
                          isDarkMode
                            ? 'text-slate-300 hover:text-white hover:bg-slate-700/70 hover:border-blue-500'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-blue-500'
                        }`}
                      >
                        {category}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar - Takes remaining space */}
            <div className="flex-1 relative group min-w-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 transition-colors duration-200 ${
                  isDarkMode
                    ? 'text-slate-400 group-focus-within:text-purple-400'
                    : 'text-gray-400 group-focus-within:text-purple-500'
                }`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border shadow-sm focus:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-slate-800/70'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-white'
                }`}
              />
            </div>

            {/* Explore Button */}
            <Link 
              to="/courses"
              className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500'
                  : 'text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
              }`}>
              Explore Courses
            </Link>

            {/* Become Educator Button */}
            {isAuthenticated && user?.role === 'instructor' ? (
              <Link 
                to="/instructor/dashboard"
                className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border ${
                  isDarkMode
                    ? 'text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/50 hover:border-blue-400'
                    : 'text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border-blue-200 hover:border-blue-600'
                }`}>
                Instructor
              </Link>
            ) : (
              <button 
                onClick={handleBecomeEducator}
                className={`flex-shrink-0 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border ${
                  isDarkMode
                    ? 'text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/50 hover:border-blue-400'
                    : 'text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border-blue-200 hover:border-blue-600'
                }`}>
                Become Educator
              </button>
            )}
          </div>

          {/* Right Section - Actions & Profile (moved to very end) */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {/* Authentication Section */}
            {isAuthenticated ? (
              <>
                {/* My Learning Button */}
                <Link
                  to="/my-learning"
                  className={`hidden lg:flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md ${
                    isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <AcademicCapIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">My Learning</span>
                </Link>

                {/* Wishlist Button */}
                <Link
                  to="/wishlist"
                  className={`hidden md:flex p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md relative group ${
                    isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <HeartIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    0
                  </span>
                </Link>

                {/* Cart Button */}
                <Link
                  to="/cart"
                  className={`hidden sm:flex p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md relative group ${
                    isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    0
                  </span>
                </Link>

                {/* Notifications Button */}
                <button className={`hidden sm:flex p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md relative group ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    0
                  </span>
                </button>

                {/* Divider */}
                <div className={`hidden sm:block h-8 w-px mx-1 ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
                }`}></div>

                {/* User Profile Menu - At the very end */}
                <div className="relative"
                     onMouseEnter={handleUserMenuEnter}
                     onMouseLeave={handleUserMenuLeave}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center space-x-2 p-1.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md ${
                      isDarkMode
                        ? 'hover:bg-slate-800/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Profile Photo / Initial */}
                    <div className={`relative h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white shadow-lg ${
                      user?.profile?.avatar 
                        ? '' 
                        : isDarkMode
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-blue-600 to-purple-700'
                    }`}>
                      {user?.profile?.avatar ? (
                        <img 
                          src={user.profile.avatar} 
                          alt={user?.fullName || user?.username} 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {(user?.fullName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                        </span>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <ChevronDownIcon className={`hidden md:block h-4 w-4 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    } ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`} />
                </button>

                {isUserMenuOpen && (
                  <div className={`absolute right-0 top-full mt-3 w-56 rounded-xl shadow-2xl z-50 overflow-hidden border transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-slate-800/95 backdrop-blur-sm border-slate-600/50'
                      : 'bg-white/95 backdrop-blur-sm border-gray-200/50'
                  }`}>
                    <div className={`p-4 border-b transition-colors ${
                      isDarkMode
                        ? 'border-slate-700/50 bg-slate-900/50'
                        : 'border-gray-200/50 bg-gray-50/50'
                    }`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user?.fullName || user?.username}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-2">
                      {user?.role === 'instructor' && (
                        <Link
                          to="/instructor/dashboard"
                          className={`block px-4 py-3 text-sm transition-all duration-150 border-l-4 border-transparent ${
                            isDarkMode
                              ? 'text-slate-300 hover:text-white hover:bg-slate-700/70 hover:border-blue-500'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-blue-500'
                          }`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Instructor
                        </Link>
                      )}
                      <Link
                        to="/dashboard"
                        className={`block px-4 py-3 text-sm transition-all duration-150 border-l-4 border-transparent ${
                          isDarkMode
                            ? 'text-slate-300 hover:text-white hover:bg-slate-700/70 hover:border-blue-500'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-blue-500'
                        }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {user?.role === 'instructor' ? 'Student Dashboard' : 'Dashboard'}
                      </Link>
                      <Link
                        to="/profile"
                        className={`block px-4 py-3 text-sm transition-all duration-150 border-l-4 border-transparent ${
                          isDarkMode
                            ? 'text-slate-300 hover:text-white hover:bg-slate-700/70 hover:border-blue-500'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-blue-500'
                        }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {user?.role === 'student' && (
                        <Link
                          to="/become-educator"
                          className={`block px-4 py-3 text-sm transition-all duration-150 border-l-4 border-transparent ${
                            isDarkMode
                              ? 'text-blue-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500'
                              : 'text-blue-600 hover:text-white hover:bg-blue-50 hover:border-blue-500'
                          }`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Become Educator
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-3 text-sm transition-all duration-150 border-t mt-2 ${
                          isDarkMode
                            ? 'text-slate-300 hover:text-white hover:bg-red-500/20 border-slate-700/50'
                            : 'text-gray-700 hover:text-white hover:bg-red-50 border-gray-200/50'
                        }`}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
            ) : (
              /* Login/Signup Buttons - At the end for non-authenticated users */
              <div className="hidden sm:flex items-center space-x-3">
                <Link 
                  to="/login"
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md ${
                    isDarkMode
                      ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500'
                      : 'text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Always at the very end */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-3 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden border-t backdrop-blur-lg transition-colors ${
            isDarkMode
              ? 'border-slate-700/50 bg-slate-900/95'
              : 'border-gray-200/50 bg-white/95'
          }`}>
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    isDarkMode
                      ? 'bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-red-500/50 focus:border-red-500/50'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                  }`}
                />
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                {/* Authenticated User Mobile Options */}
                {isAuthenticated && (
                  <>
                    <Link 
                      to="/my-learning"
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <AcademicCapIcon className="h-5 w-5" />
                      <span>My Learning</span>
                    </Link>
                    <Link 
                      to="/wishlist"
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <HeartIcon className="h-5 w-5" />
                      <span>Wishlist</span>
                      <span className="ml-auto px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">0</span>
                    </Link>
                    <Link 
                      to="/cart"
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>Cart</span>
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">0</span>
                    </Link>
                    <button 
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}>
                      <BellIcon className="h-5 w-5" />
                      <span>Notifications</span>
                      <span className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">0</span>
                    </button>
                    <div className={`border-t my-2 ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'}`}></div>
                  </>
                )}
                
                <button className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                  Categories
                </button>
                <Link 
                  to="/courses"
                  className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Explore Courses
                </Link>
                {isAuthenticated && user?.role === 'instructor' ? (
                  <Link 
                    to="/instructor/dashboard"
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      isDarkMode
                        ? 'text-blue-400 hover:text-white hover:bg-blue-500/20'
                        : 'text-blue-600 hover:text-white hover:bg-blue-500/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Instructor
                  </Link>
                ) : (
                  <button 
                    onClick={handleBecomeEducator}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      isDarkMode
                        ? 'text-blue-400 hover:text-white hover:bg-blue-500/20'
                        : 'text-blue-600 hover:text-white hover:bg-blue-500/10'
                    }`}>
                    Become Educator
                  </button>
                )}
              </div>

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className={`flex space-x-3 pt-4 border-t transition-colors ${
                  isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
                }`}>
                  <Link 
                    to="/login"
                    className={`flex-1 px-4 py-3 text-center text-sm font-medium border rounded-xl transition-all duration-200 ${
                      isDarkMode
                        ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border-slate-600/50 hover:border-slate-500'
                        : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    className={`flex-1 px-4 py-3 text-center text-sm font-medium text-white rounded-xl transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;