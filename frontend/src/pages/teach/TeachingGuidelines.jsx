import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  VideoCameraIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const TeachingGuidelines = () => {
  const { isDarkMode } = useTheme();

  const guidelines = [
    {
      title: 'Course Quality Standards',
      icon: SparklesIcon,
      dos: [
        'Create high-quality video content with clear audio and visuals (minimum 720p resolution)',
        'Structure your course with clear learning objectives and outcomes',
        'Include practical examples, exercises, and real-world applications',
        'Provide downloadable resources and supplementary materials',
        'Keep lectures concise and focused (ideally 5-15 minutes per video)',
        'Use engaging teaching methods and varied presentation styles'
      ],
      donts: [
        'Use copyrighted material without proper permission',
        'Create courses with poor audio or video quality',
        'Include outdated or inaccurate information',
        'Copy content from other courses or sources',
        'Create overly promotional or sales-focused content'
      ]
    },
    {
      title: 'Content Creation Guidelines',
      icon: VideoCameraIcon,
      dos: [
        'Plan your course structure before recording',
        'Use a quality microphone and recording setup',
        'Speak clearly and at an appropriate pace',
        'Use screen recordings, slides, or live demonstrations effectively',
        'Edit your videos to remove mistakes and dead air',
        'Add captions or transcripts for accessibility'
      ],
      donts: [
        'Ramble or go off-topic frequently',
        'Use distracting backgrounds or poor lighting',
        'Include personal or sensitive information',
        'Make assumptions about student knowledge without proper introduction',
        'Use offensive or inappropriate language'
      ]
    },
    {
      title: 'Student Engagement',
      icon: ClipboardDocumentCheckIcon,
      dos: [
        'Respond to student questions within 48 hours',
        'Create meaningful assignments and quizzes',
        'Encourage discussion and peer learning',
        'Update course content regularly based on feedback',
        'Provide constructive feedback on assignments',
        'Be available and supportive to your students'
      ],
      donts: [
        'Ignore student feedback or questions',
        'Be dismissive of beginner questions',
        'Promise support you cannot deliver',
        'Engage in arguments or unprofessional behavior',
        'Spam students with promotional messages'
      ]
    }
  ];

  const technicalRequirements = [
    {
      category: 'Video Requirements',
      specs: [
        'Minimum resolution: 1280x720 (720p HD)',
        'Recommended resolution: 1920x1080 (1080p Full HD)',
        'Frame rate: 24-30 fps',
        'Format: MP4 (H.264 codec)',
        'Aspect ratio: 16:9'
      ]
    },
    {
      category: 'Audio Requirements',
      specs: [
        'Clear, audible voice with minimal background noise',
        'Sample rate: 44.1 kHz or 48 kHz',
        'Bit depth: 16-bit or higher',
        'Format: AAC or MP3',
        'Use a quality external microphone (not laptop built-in)'
      ]
    },
    {
      category: 'Course Structure',
      specs: [
        'Minimum 5 lectures per course',
        'Total video content: At least 30 minutes',
        'Maximum lecture length: 20 minutes (recommended: 5-15 minutes)',
        'Include introduction and conclusion lectures',
        'Organize content into logical sections'
      ]
    }
  ];

  const bestPractices = [
    {
      icon: LightBulbIcon,
      title: 'Start Strong',
      description: 'Your first lecture is crucial. Introduce yourself, explain what students will learn, and why it matters.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Set Clear Goals',
      description: 'Define specific, measurable learning objectives for each section and lecture.'
    },
    {
      icon: VideoCameraIcon,
      title: 'Keep It Engaging',
      description: 'Vary your teaching methods - use slides, screen recordings, demonstrations, and real-world examples.'
    },
    {
      icon: ClipboardDocumentCheckIcon,
      title: 'Test Understanding',
      description: 'Include quizzes, assignments, and projects to help students practice and apply what they learn.'
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
            <DocumentTextIcon className={`h-16 w-16 mx-auto mb-6 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h1 className={`text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Teaching <span className="text-blue-500">Guidelines</span>
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything you need to know to create high-quality, engaging courses on NexEd.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Best Practices */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Best Practices
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {bestPractices.map((practice, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl transition-all hover:scale-105 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <practice.icon className={`h-12 w-12 mb-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <h3 className={`text-xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {practice.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {practice.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Guidelines */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Dos and Don'ts
          </h2>
          <div className="space-y-8">
            {guidelines.map((guideline, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <guideline.icon className={`h-10 w-10 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h3 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {guideline.title}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Dos */}
                  <div>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <CheckCircleIcon className="h-6 w-6" />
                      Do
                    </h4>
                    <ul className="space-y-3">
                      {guideline.dos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircleIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don'ts */}
                  <div>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <XCircleIcon className="h-6 w-6" />
                      Don't
                    </h4>
                    <ul className="space-y-3">
                      {guideline.donts.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <XCircleIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            isDarkMode ? 'text-red-400' : 'text-red-600'
                          }`} />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Requirements */}
        <section className="mb-20">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Technical Requirements
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {technicalRequirements.map((req, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}
              >
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {req.category}
                </h3>
                <ul className="space-y-3">
                  {req.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircleIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {spec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={`p-12 rounded-3xl text-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-gray-800' 
            : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Create Your Course?
          </h2>
          <p className={`text-lg max-w-2xl mx-auto mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Follow these guidelines to create an amazing learning experience for your students.
          </p>
          <a 
            href="/instructor/dashboard"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Instructor Dashboard
          </a>
        </section>
      </div>
    </div>
  );
};

export default TeachingGuidelines;
