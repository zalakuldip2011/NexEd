import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  HeartIcon, 
  GlobeAltIcon,
  LightBulbIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const OurMission = () => {
  const { isDarkMode } = useTheme();

  const pillars = [
    {
      icon: GlobeAltIcon,
      title: 'Global Accessibility',
      description: 'Break down geographical barriers and make quality education available to learners in every corner of the world.'
    },
    {
      icon: HeartIcon,
      title: 'Affordable Learning',
      description: 'Provide high-quality courses at accessible prices, with free options for those who need them most.'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation in Education',
      description: 'Leverage cutting-edge technology to create engaging, interactive, and effective learning experiences.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Building',
      description: 'Foster a supportive global community where learners and instructors can connect and grow together.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Career Advancement',
      description: 'Equip learners with practical, in-demand skills that directly translate to career opportunities.'
    },
    {
      icon: SparklesIcon,
      title: 'Lifelong Learning',
      description: 'Inspire a culture of continuous learning and personal growth at every stage of life.'
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
              Our <span className="text-blue-500">Mission</span>
            </h1>
            <p className={`text-2xl max-w-4xl mx-auto font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              To democratize education and empower individuals worldwide to achieve their full potential through accessible, high-quality online learning.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Statement */}
        <section className="mb-20">
          <div className={`p-12 rounded-3xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-gray-800' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-6 text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What Drives Us
            </h2>
            <p className={`text-lg leading-relaxed mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              At NexEd, we believe that education is the most powerful tool for personal and societal transformation. 
              In today's rapidly changing world, access to quality education should not be a privilege—it should be a right.
            </p>
            <p className={`text-lg leading-relaxed mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              We're on a mission to remove the traditional barriers of education—high costs, geographical limitations, 
              and rigid schedules—that have prevented millions of talented individuals from reaching their potential.
            </p>
            <p className={`text-lg leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Through our platform, we're creating a global classroom where anyone, anywhere, can learn anything—from 
              foundational skills to advanced professional expertise—at their own pace and on their own terms.
            </p>
          </div>
        </section>

        {/* Mission Pillars */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            The Six Pillars of Our Mission
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl transition-all hover:scale-105 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <pillar.icon className={`h-12 w-12 mb-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <h3 className={`text-xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {pillar.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Section */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Our Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl text-center ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
            }`}>
              <div className="text-5xl font-bold text-blue-500 mb-2">10K+</div>
              <div className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Students Empowered
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Learners from 50+ countries achieving their goals
              </p>
            </div>
            <div className={`p-8 rounded-2xl text-center ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'
            }`}>
              <div className="text-5xl font-bold text-purple-500 mb-2">95%</div>
              <div className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Success Rate
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Students who complete courses achieve their learning objectives
              </p>
            </div>
            <div className={`p-8 rounded-2xl text-center ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
            }`}>
              <div className="text-5xl font-bold text-green-500 mb-2">1K+</div>
              <div className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Quality Courses
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Expertly crafted courses across diverse subjects
              </p>
            </div>
          </div>
        </section>

        {/* Vision for the Future */}
        <section className={`p-12 rounded-3xl text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl`}>
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Our Vision for the Future
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            We envision a world where education knows no boundaries—where every person, regardless of their circumstances, 
            has the opportunity to learn, grow, and succeed. Through continuous innovation and unwavering commitment to our 
            mission, we're building that future, one learner at a time.
          </p>
          <div className="mt-8">
            <a 
              href="/courses"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your Learning Journey
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OurMission;
