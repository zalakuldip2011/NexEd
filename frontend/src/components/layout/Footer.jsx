import React from 'react';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  QuestionMarkCircleIcon, 
  ShieldCheckIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const footerSections = [
    {
      title: "About Us",
      links: [
        { name: "About Edemy", href: "#" },
        { name: "Our Mission", href: "#" },
        { name: "Team", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
        { name: "Blog", href: "#" }
      ]
    },
    {
      title: "Teach on Edemy",
      links: [
        { name: "Become an Instructor", href: "#" },
        { name: "Instructor Dashboard", href: "#" },
        { name: "Course Creation", href: "#" },
        { name: "Teaching Guidelines", href: "#" },
        { name: "Instructor Support", href: "#" },
        { name: "Promotion Tips", href: "#" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "Student Support", href: "#" },
        { name: "Technical Issues", href: "#" },
        { name: "Course Refunds", href: "#" },
        { name: "Accessibility", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
        { name: "GDPR", href: "#" },
        { name: "Copyright Policy", href: "#" },
        { name: "Community Guidelines", href: "#" }
      ]
    }
  ];

  const categories = [
    "Web Development", "Data Science", "Design", "Business", 
    "Marketing", "Photography", "Music", "Health & Fitness",
    "Personal Development", "IT & Software", "Finance", "Language Learning"
  ];

  const socialLinks = [
    { name: "Facebook", href: "#", icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" },
    { name: "Twitter", href: "#", icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" },
    { name: "LinkedIn", href: "#", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
    { name: "Instagram", href: "#", icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.624 5.367 11.99 11.988 11.99s11.987-5.366 11.987-11.99C24.014 5.367 18.641.001 12.017.001zm0 21.658c-5.338 0-9.671-4.333-9.671-9.671S6.679 2.316 12.017 2.316s9.671 4.333 9.671 9.671-4.333 9.671-9.671 9.671zm4.912-9.671c0 2.71-2.202 4.912-4.912 4.912s-4.912-2.202-4.912-4.912 2.202-4.912 4.912-4.912 4.912 2.202 4.912 4.912zm-9.007-1.52c.823 0 1.491-.668 1.491-1.491s-.668-1.491-1.491-1.491-1.491.668-1.491 1.491.668 1.491 1.491 1.491z" },
    { name: "YouTube", href: "#", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                {section.title === "About Us" && <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-400" />}
                {section.title === "Teach on Edemy" && <UserGroupIcon className="h-5 w-5 mr-2 text-blue-400" />}
                {section.title === "Support" && <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-blue-400" />}
                {section.title === "Legal" && <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-400" />}
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-400" />
            Course Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <a 
                key={index}
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                {category}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-blue-400" />
              Stay Updated
            </h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest courses and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Mobile App Promotion */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-semibold text-white mb-2">
                Learn on the go with our mobile app
              </h3>
              <p className="text-gray-400">
                Download the Edemy app and learn anytime, anywhere.
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8" />
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo and Copyright */}
            <div className="flex items-center mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-blue-400 mr-4">Edemy</h2>
              <span className="text-gray-400 text-sm">
                © 2024 Edemy. All rights reserved.
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm mr-2">Follow us:</span>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Language and Region */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                English
              </button>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400 text-sm">USD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;