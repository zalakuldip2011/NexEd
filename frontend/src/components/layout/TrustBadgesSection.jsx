import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheckIcon, 
  CreditCardIcon, 
  GlobeAltIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  LockClosedIcon
} from '@heroicons/react/24/solid';

const TrustBadgesSection = () => {
  const { isDarkMode } = useTheme();

  const badges = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: 'SSL encrypted transactions'
    },
    {
      icon: CreditCardIcon,
      title: 'Money-Back Guarantee',
      description: '30-day refund policy'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Community',
      description: '120+ countries worldwide'
    },
    {
      icon: AcademicCapIcon,
      title: 'Certified Instructors',
      description: 'Industry experts'
    },
    {
      icon: CheckBadgeIcon,
      title: 'Verified Certificates',
      description: 'Shareable credentials'
    },
    {
      icon: LockClosedIcon,
      title: 'Data Privacy',
      description: 'GDPR compliant'
    }
  ];

  const partners = [
    { name: 'Google', logo: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png' },
    { name: 'Microsoft', logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Apple', logo: 'https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png' },
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' }
  ];

  return (
    <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="mb-20">
          <h3 className={`text-center text-2xl font-bold mb-12 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Why Students Trust Us
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-center mb-3">
                  <badge.icon className={`h-8 w-8 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <h4 className={`text-sm font-semibold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {badge.title}
                </h4>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} pt-16`}>
          <h3 className={`text-center text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Trusted by Companies Worldwide
          </h3>
          <p className={`text-center mb-12 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Our students work at leading companies around the globe
          </p>
          
          {/* Partners Logos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {partners.map((partner, index) => (
              <div
                key={index}
                className={`flex items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-gray-50 hover:bg-white hover:shadow-lg'
                }`}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className={`h-8 w-auto object-contain ${
                    isDarkMode ? 'opacity-70 hover:opacity-100' : 'opacity-60 hover:opacity-100'
                  } transition-opacity duration-300`}
                  style={{ filter: isDarkMode ? 'grayscale(100%) brightness(200%)' : 'grayscale(100%)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className={`mt-20 text-center p-12 rounded-3xl ${
          isDarkMode
            ? 'bg-gradient-to-r from-purple-900 to-pink-900'
            : 'bg-gradient-to-r from-purple-600 to-pink-600'
        }`}>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h3>
          <p className="text-xl text-purple-100 mb-8">
            Join 50,000+ students already learning on NexEd
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
              Browse Courses
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-300">
              Become an Instructor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;
