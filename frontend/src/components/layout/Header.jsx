import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  GlobeAltIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
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
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">{/* Increased height for better proportion */}
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="group">
              <h1 className="text-3xl font-bold text-blue-400 hover:text-blue-300 transition-all duration-300 transform group-hover:scale-105">
                Edemy
              </h1>
            </Link>
          </div>

          {/* Center Section - Categories, Search, Explore */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 max-w-3xl mx-8">
            {/* Categories Dropdown */}
            <div className="relative"
                 onMouseEnter={() => setIsDropdownOpen(true)}
                 onMouseLeave={() => setIsDropdownOpen(false)}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group flex items-center px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Categories
                <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="py-2">
                    {categories.map((category, index) => (
                      <a
                        key={index}
                        href="#"
                        className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all duration-150 border-l-4 border-transparent hover:border-blue-500"
                      >
                        {category}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-red-400 transition-colors duration-200" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses, instructors..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-slate-800/70 transition-all duration-200 shadow-sm focus:shadow-md"
              />
            </div>

            {/* Explore Button */}
            <button className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md">
              Explore
            </button>

            {/* Become Educator Button */}
            <button className="px-5 py-2.5 text-sm font-medium text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/50 hover:border-blue-400 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md">
              Become Educator
            </button>
          </div>

          {/* Right Section - Cart, Login/Profile, Signup, Language, Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Cart - Hidden on mobile */}
            <button className="hidden sm:flex p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md relative group">
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                0
              </span>
            </button>

            {/* Authentication Section */}
            {isAuthenticated ? (
              /* User Menu */
              <div className="relative"
                   onMouseEnter={() => setIsUserMenuOpen(true)}
                   onMouseLeave={() => setIsUserMenuOpen(false)}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <div className="relative">
                    <UserCircleIcon className="h-8 w-8" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.username || user?.fullName || 'User'}
                  </span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                      <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all duration-150 border-l-4 border-transparent hover:border-blue-500"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all duration-150 border-l-4 border-transparent hover:border-blue-500"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {user?.role === 'instructor' && (
                        <Link
                          to="/instructor"
                          className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all duration-150 border-l-4 border-transparent hover:border-blue-500"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Instructor Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-red-500/20 transition-all duration-150 border-t border-slate-700/50 mt-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Signup Buttons */
              <div className="hidden sm:flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
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

            {/* Language Selector */}
            <button className="hidden sm:flex p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md">
              <GlobeAltIcon className="h-6 w-6" />
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
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
          <div className="lg:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-lg">
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                />
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200">
                  Categories
                </button>
                <button className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200">
                  Explore
                </button>
                <button className="w-full text-left px-4 py-3 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-xl transition-all duration-200">
                  Become Educator
                </button>
              </div>

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="flex space-x-3 pt-4 border-t border-slate-700/50">
                  <Link 
                    to="/login"
                    className="flex-1 px-4 py-3 text-center text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500 rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    className="flex-1 px-4 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200"
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