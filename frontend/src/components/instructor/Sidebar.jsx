import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: 'Home',
      href: '/instructor',
      icon: HomeIcon,
      description: 'Dashboard overview'
    },
    {
      name: 'Courses',
      href: '/instructor/courses',
      icon: BookOpenIcon,
      description: 'Manage your courses'
    },
    {
      name: 'Communication',
      href: '/instructor/communication',
      icon: ChatBubbleLeftRightIcon,
      description: 'Student Q&A'
    },
    {
      name: 'Performance',
      href: '/instructor/performance',
      icon: ChartBarIcon,
      description: 'Analytics & insights'
    },
    {
      name: 'Tools',
      href: '/instructor/tools',
      icon: WrenchScrewdriverIcon,
      description: 'Creator tools'
    },
    {
      name: 'Resources',
      href: '/instructor/resources',
      icon: InformationCircleIcon,
      description: 'Help & guides'
    }
  ];

  const isActive = (href) => {
    if (href === '/instructor') {
      return location.pathname === '/instructor';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg shadow-lg border transition-colors ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
              : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
          }`}
        >
          {isCollapsed ? (
            <Bars3Icon className="h-6 w-6" />
          ) : (
            <XMarkIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-all duration-300 ease-in-out ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }
        ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        lg:static lg:inset-0 lg:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between h-16 px-6 border-b transition-colors ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <Link to="/instructor" className="flex items-center">
            <span className={`text-xl font-bold ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>NexEd</span>
            <span className={`ml-2 text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>Instructor</span>
          </Link>
        </div>

        {/* Quick Action - Create Course */}
        <div className={`p-4 border-b transition-colors ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <Link
            to="/instructor/courses/create"
            className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg shadow-lg transition-all hover:-translate-y-0.5 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
            }`}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all
                  ${active 
                    ? (isDarkMode 
                        ? 'bg-purple-500/10 text-purple-400 border-r-2 border-purple-500 shadow-lg shadow-purple-500/10' 
                        : 'bg-purple-50 text-purple-700 border-r-2 border-purple-600')
                    : (isDarkMode 
                        ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900')
                  }
                `}
                onClick={() => setIsCollapsed(true)} // Close mobile menu on click
              >
                <Icon className={`
                  flex-shrink-0 h-5 w-5 mr-3 transition-colors
                  ${active 
                    ? (isDarkMode ? 'text-purple-400' : 'text-purple-600')
                    : (isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-gray-400 group-hover:text-gray-500')
                  }
                `} />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs transition-colors ${
                    isDarkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Back to Student View Button */}
        <div className={`px-4 py-3 border-t transition-colors ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => navigate('/')}
            className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors border ${
              isDarkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Student View
          </button>
        </div>

        {/* Bottom section */}
        <div className={`p-4 border-t transition-colors ${
          isDarkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-md ${
                isDarkMode ? 'bg-slate-700' : 'bg-purple-100'
              }`}>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-slate-200' : 'text-purple-600'
                }`}>I</span>
              </div>
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-slate-200' : 'text-gray-700'
              }`}>Instructor</p>
              <p className={`text-xs ${
                isDarkMode ? 'text-slate-500' : 'text-gray-500'
              }`}>Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;