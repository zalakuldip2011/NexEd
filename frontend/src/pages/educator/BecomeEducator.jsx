import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  BanknotesIcon, 
  ClockIcon, 
  GlobeAltIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BecomeEducator = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      navigate('/signup?intent=educator');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/become-educator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to instructor dashboard
        navigate('/instructor/dashboard');
      } else {
        setError(data.message || 'Failed to become an educator. Please try again.');
      }
    } catch (error) {
      console.error('Become educator error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: BanknotesIcon,
      title: 'Earn Money',
      description: 'Make money from your expertise and passion for teaching'
    },
    {
      icon: UserGroupIcon,
      title: 'Reach Students Globally',
      description: 'Connect with millions of students worldwide'
    },
    {
      icon: ClockIcon,
      title: 'Flexible Schedule',
      description: 'Teach on your own schedule and at your own pace'
    },
    {
      icon: ChartBarIcon,
      title: 'Track Your Success',
      description: 'Monitor your course performance with detailed analytics'
    }
  ];

  const features = [
    'Create unlimited courses',
    'Upload videos, documents, and quizzes',
    'Set your own pricing',
    'Receive instant payments',
    'Engage with students through Q&A',
    'Get detailed analytics and insights',
    'Access to marketing tools',
    '24/7 instructor support'
  ];

  const steps = [
    {
      icon: DocumentTextIcon,
      title: 'Create Your Course',
      description: 'Plan your curriculum and create engaging content'
    },
    {
      icon: PlayCircleIcon,
      title: 'Record & Upload',
      description: 'Record your lessons and upload supporting materials'
    },
    {
      icon: GlobeAltIcon,
      title: 'Publish & Earn',
      description: 'Publish your course and start earning from day one'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Become an <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Educator</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Share your knowledge and passion with millions of students worldwide. 
              Create courses, build your brand, and earn money doing what you love.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    Get Started Teaching
                    <ArrowRightIcon className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {!isAuthenticated && (
                <p className="text-sm text-slate-400">
                  Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
                </p>
              )}
            </div>

            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Teach on NexEd?</h2>
            <p className="text-xl text-slate-300">Join thousands of instructors earning money by sharing their expertise</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Everything You Need to Succeed</h2>
              <p className="text-xl text-slate-300 mb-8">
                Our comprehensive platform provides all the tools and support you need to create, market, and sell your courses.
              </p>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <AcademicCapIcon className="w-12 h-12 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Professional Tools</h3>
                      <p className="text-slate-300">Advanced course creation and management tools</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <ChartBarIcon className="w-12 h-12 text-purple-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>
                      <p className="text-slate-300">Track student progress and course performance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <BanknotesIcon className="w-12 h-12 text-green-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Revenue Tracking</h3>
                      <p className="text-slate-300">Monitor your earnings and payment history</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-300">Start teaching in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Teaching?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join our community of educators and start making an impact today
          </p>
          
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              'Get Started Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeEducator;