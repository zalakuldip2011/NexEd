import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  AcademicCapIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  TrophyIcon,
  UserGroupIcon,
  VideoCameraIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const FeaturesSection = () => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: VideoCameraIcon,
      title: 'HD Video Content',
      description: 'High-quality video lectures with crystal clear audio and visuals',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ClockIcon,
      title: 'Learn at Your Pace',
      description: 'Access courses 24/7 and learn whenever it fits your schedule',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: TrophyIcon,
      title: 'Certificates',
      description: 'Earn verified certificates upon completion to boost your resume',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Learning',
      description: 'Learn on-the-go with our mobile-friendly platform',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Support',
      description: 'Connect with peers and mentors in our active learning community',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: SparklesIcon,
      title: 'Interactive Exercises',
      description: 'Practice with hands-on projects and coding challenges',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Lifetime Access',
      description: 'Once enrolled, access your courses forever with all updates',
      color: 'from-emerald-500 to-green-500'
    }
  ];

  return (
    <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Why Choose NexEd?
          </h2>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join thousands of learners who have transformed their careers with our comprehensive learning platform
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`group p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-750 shadow-lg shadow-gray-900/50' 
                  : 'bg-white hover:shadow-2xl shadow-lg'
              }`}
            >
              {/* Icon with Gradient Background */}
              <motion.div 
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </motion.div>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
