import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  QuestionMarkCircleIcon, 
  ShieldCheckIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  HeartIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import FeedbackForm from '../common/FeedbackForm';

const Footer = () => {
  const { isDarkMode } = useTheme();
  const [socialMessage, setSocialMessage] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  const footerSections = [
    {
      title: "About Us",
      links: [
        { name: "About NexEd", href: "/about" },
        { name: "Our Mission", href: "/mission" },
        { name: "Team", href: "/team" }
      ]
    },
    {
      title: "Teach on NexEd",
      links: [
        { name: "Become an Instructor", href: "/teach" },
        { name: "Instructor Dashboard", href: "/instructor/dashboard" },
        { name: "Teaching Guidelines", href: "/teach/guidelines" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/support" },
        { name: "Contact Us", href: "/contact" },
        { name: "Share Feedback", href: "#", onClick: () => setShowFeedbackForm(true), special: true }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Community Guidelines", href: "/community-guidelines" }
      ]
    }
  ];

  const categories = [
    "Web Development", "Data Science", "Design", "Business", 
    "Marketing", "Photography", "Music", "Health & Fitness",
    "Personal Development", "IT & Software", "Finance", "Language Learning"
  ];

  const socialLinks = [
    { 
      name: "X (Twitter)", 
      icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" 
    },
    { 
      name: "YouTube", 
      icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" 
    },
    { 
      name: "LinkedIn", 
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" 
    },
    { 
      name: "Instagram", 
      icon: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" 
    }
  ];

  const handleSocialClick = (e, socialName) => {
    e.preventDefault();
    setSocialMessage(socialName);
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      setSocialMessage(null);
    }, 5000);
  };

  return (
    <footer className={`border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-950 border-gray-800' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {section.title === "About Us" && <AcademicCapIcon className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                {section.title === "Teach on NexEd" && <UserGroupIcon className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                {section.title === "Support" && <QuestionMarkCircleIcon className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                {section.title === "Legal" && <ShieldCheckIcon className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.special ? (
                      <button 
                        onClick={link.onClick}
                        className={`transition-colors duration-200 flex items-center space-x-2 ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>{link.name}</span>
                      </button>
                    ) : (
                      <a 
                        href={link.href}
                        className={`transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className={`mt-16 pt-8 border-t transition-colors ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <DocumentTextIcon className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            Course Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <a 
                key={index}
                href="#"
                className={`transition-colors duration-200 text-sm ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className={`mt-16 pt-8 border-t transition-colors ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="max-w-md">
            <h3 className={`text-lg font-semibold mb-4 flex items-center transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <HeartIcon className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              Stay Updated
            </h3>
            <p className={`mb-4 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Subscribe to our newsletter for the latest courses and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-2 border rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                }`}
              />
              <button className={`px-6 py-2 font-medium rounded-r-lg transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className={`border-t transition-colors ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-800'
          : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Social Media Message */}
          {socialMessage && (
            <div className={`mb-4 p-4 rounded-lg border-l-4 flex items-start justify-between animate-fade-in ${
              isDarkMode
                ? 'bg-blue-900/20 border-blue-500 text-blue-300'
                : 'bg-blue-50 border-blue-500 text-blue-700'
            }`}>
              <div>
                <p className="font-semibold">Coming Soon!</p>
                <p className="text-sm mt-1">
                  We're not on {socialMessage} yet, but we'll be launching our social media presence very soon. Stay tuned for updates!
                </p>
              </div>
              <button
                onClick={() => setSocialMessage(null)}
                className={`ml-4 transition-colors ${
                  isDarkMode ? 'hover:text-blue-100' : 'hover:text-blue-900'
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo and Copyright */}
            <div className="flex items-center mb-4 md:mb-0">
              <h2 className={`text-2xl font-bold mr-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>NexEd</h2>
              <span className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                © 2025 NexEd. All rights reserved.
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className={`text-sm mr-2 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Follow us:</span>
              {socialLinks.map((social, index) => (
                <button
                  key={index}
                  onClick={(e) => handleSocialClick(e, social.name)}
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label={social.name}
                  title={social.name}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Form Modal */}
      <FeedbackForm 
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        onSuccess={() => {
          // Optional: You can add additional success handling here
        }}
      />
    </footer>
  );
};

export default Footer;