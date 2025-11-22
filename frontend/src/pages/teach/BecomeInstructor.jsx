import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  AcademicCapIcon,
  BanknotesIcon,
  ClockIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const BecomeInstructor = () => {
  const { isDarkMode } = useTheme();

  const benefits = [
    {
      icon: BanknotesIcon,
      title: 'Earn Money',
      description: 'Set your own prices and earn revenue from your courses. Instructors earn up to 70% of course sales in INR.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Reach',
      description: 'Share your knowledge with students from around the world. Your classroom has no boundaries.'
    },
    {
      icon: ClockIcon,
      title: 'Flexible Schedule',
      description: 'Create courses on your own time and teach at your own pace. Work whenever and wherever you want.'
    },
    {
      icon: UserGroupIcon,
      title: 'Build Your Brand',
      description: 'Establish yourself as an expert in your field and grow your professional network.'
    },
    {
      icon: ChartBarIcon,
      title: 'Track Your Success',
      description: 'Access detailed analytics to understand student engagement and improve your courses.'
    },
    {
      icon: SparklesIcon,
      title: 'Full Support',
      description: 'Get help from our instructor support team and access resources to create amazing courses.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Apply to Become an Instructor',
      description: 'Submit your application with your expertise and teaching interests. We review all applications carefully.'
    },
    {
      number: '02',
      title: 'Plan Your Course',
      description: 'Outline your curriculum, define learning objectives, and structure your content for maximum impact.'
    },
    {
      number: '03',
      title: 'Record Your Content',
      description: 'Create high-quality video lectures, assignments, and quizzes using our guidelines and resources.'
    },
    {
      number: '04',
      title: 'Launch & Earn',
      description: 'Publish your course, reach thousands of students, and start earning from your expertise.'
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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className={`text-5xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Teach on <span className="text-blue-500">NexEd</span>
              </h1>
              <p className={`text-xl mb-8 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Share your knowledge with millions of students worldwide. Create courses, earn money, and make an impact.
              </p>
              <Link 
                to="/instructor/signup"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RocketLaunchIcon className="h-6 w-6 mr-2" />
                Start Teaching Today
              </Link>
            </div>
            <div className={`rounded-2xl overflow-hidden shadow-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Teaching"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Benefits */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Why Teach on NexEd?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl transition-all hover:scale-105 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <benefit.icon className={`h-12 w-12 mb-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <h3 className={`text-xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {benefit.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            How It Works
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <div className="flex items-start gap-6">
                  <div className={`text-5xl font-bold ${
                    isDarkMode ? 'text-blue-500/20' : 'text-blue-500/30'
                  }`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-lg ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-20">
          <div className={`p-12 rounded-3xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-gray-800' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
          }`}>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-500 mb-2">500+</div>
                <div className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Expert Instructors
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold text-purple-500 mb-2">10K+</div>
                <div className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Active Students
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold text-green-500 mb-2">$500K+</div>
                <div className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Instructor Earnings
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`p-12 rounded-3xl text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl`}>
          <AcademicCapIcon className={`h-20 w-20 mx-auto mb-6 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Start Teaching?
          </h2>
          <p className={`text-lg max-w-2xl mx-auto mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Join thousands of instructors who are already making an impact and earning from their expertise. 
            Your knowledge could change someone's life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/instructor/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link 
              to="/teach/guidelines"
              className={`inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Read Guidelines
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BecomeInstructor;
