import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  AcademicCapIcon, 
  SparklesIcon, 
  RocketLaunchIcon,
  HeartIcon,
  LightBulbIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const AboutNexEd = () => {
  const { isDarkMode } = useTheme();

  const stats = [
    { label: 'Active Students', value: '10,000+', icon: UserGroupIcon },
    { label: 'Expert Instructors', value: '500+', icon: AcademicCapIcon },
    { label: 'Quality Courses', value: '1,000+', icon: SparklesIcon },
    { label: 'Success Rate', value: '95%', icon: RocketLaunchIcon }
  ];

  const values = [
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We embrace cutting-edge technology and innovative teaching methods to deliver the best learning experience.'
    },
    {
      icon: HeartIcon,
      title: 'Passion for Learning',
      description: 'We believe that education should be accessible, engaging, and inspiring for everyone, everywhere.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community',
      description: 'We foster a supportive community where learners and instructors can connect, collaborate, and grow together.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Excellence',
      description: 'We are committed to maintaining the highest standards of quality in every course and interaction.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Hero Section */}
      <div className={`border-b transition-colors ${
        isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              About <span className="text-blue-500">NexEd</span>
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Empowering learners worldwide with accessible, high-quality education that transforms lives and careers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Our Story
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                NexEd was founded with a simple yet powerful vision: to make quality education accessible to everyone, regardless of their location or background.
              </p>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                What started as a small platform has grown into a thriving global community of learners and educators. Today, we're proud to be at the forefront of the online learning revolution, helping millions of people acquire new skills and achieve their goals.
              </p>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Our platform combines cutting-edge technology with expert instruction to create an engaging, effective learning experience that fits into your busy life.
              </p>
            </div>
            <div className={`rounded-2xl overflow-hidden shadow-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students learning"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl text-center transition-all hover:scale-105 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <stat.icon className={`h-12 w-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className={`text-4xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl transition-all hover:scale-105 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <value.icon className={`h-12 w-12 mb-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <h3 className={`text-xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {value.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className={`p-12 rounded-3xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' 
            : 'bg-gradient-to-br from-blue-50 to-purple-50'
        }`}>
          <h2 className={`text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`text-5xl mb-4`}>🎯</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Personalized Learning
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                AI-powered recommendations tailored to your interests and career goals.
              </p>
            </div>
            <div className="text-center">
              <div className={`text-5xl mb-4`}>👨‍🏫</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Expert Instructors
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Learn from industry professionals with real-world experience.
              </p>
            </div>
            <div className="text-center">
              <div className={`text-5xl mb-4`}>⚡</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Lifetime Access
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Learn at your own pace with unlimited access to course materials.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutNexEd;
