import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UserGroupIcon, HeartIcon, ShieldCheckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const CommunityGuidelines = () => {
  const { isDarkMode } = useTheme();

  const guidelines = [
    {
      icon: HeartIcon,
      title: 'Be Respectful',
      dos: [
        'Treat all community members with kindness and respect',
        'Welcome diverse perspectives and backgrounds',
        'Use constructive language in discussions',
        'Give credit where credit is due'
      ],
      donts: [
        'Use offensive, discriminatory, or hateful language',
        'Harass, bully, or intimidate other users',
        'Make personal attacks or engage in arguments',
        'Share private information of others'
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: 'Maintain Quality',
      dos: [
        'Share accurate and helpful information',
        'Provide constructive feedback',
        'Cite sources when sharing facts or data',
        'Help others learn and grow'
      ],
      donts: [
        'Post spam or promotional content',
        'Share misleading or false information',
        'Plagiarize or copy content without attribution',
        'Post irrelevant or off-topic content'
      ]
    },
    {
      icon: UserGroupIcon,
      title: 'Foster Learning',
      dos: [
        'Ask thoughtful questions',
        'Share your knowledge and experience',
        'Encourage and support fellow learners',
        'Participate actively in discussions'
      ],
      donts: [
        'Mock or belittle someone for not knowing something',
        'Share assignment answers or encourage cheating',
        'Demand immediate responses from instructors',
        'Disrupt learning environments'
      ]
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <UserGroupIcon className={`h-16 w-16 mx-auto mb-6 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <h1 className={`text-4xl font-bold mb-4 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Community Guidelines
          </h1>
          <p className={`text-xl text-center max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Building a respectful, supportive, and inclusive learning community together.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <section className="mb-16">
          <div className={`p-8 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Our Commitment
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              At NexEd, we're committed to creating a safe, welcoming, and productive environment for all learners and instructors. These guidelines help ensure that everyone can learn, teach, and connect without fear of harassment, discrimination, or abuse.
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              By using NexEd, you agree to follow these guidelines. Violations may result in content removal, account suspension, or permanent ban from the platform.
            </p>
          </div>
        </section>

        {/* Guidelines */}
        <section className="mb-16">
          <h2 className={`text-3xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Our Guidelines
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

        {/* Reporting */}
        <section className="mb-16">
          <div className={`p-8 rounded-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-gray-800' 
              : 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Reporting Violations
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              If you encounter content or behavior that violates these guidelines, please report it immediately. We take all reports seriously and will investigate promptly.
            </p>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              You can report violations through:
            </p>
            <ul className={`list-disc pl-6 mb-6 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>The "Report" button on any content</li>
              <li>Contacting our support team directly</li>
              <li>Emailing conduct@nexed.com</li>
            </ul>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              We will protect the privacy of those who report violations and will not tolerate retaliation.
            </p>
          </div>
        </section>

        {/* Consequences */}
        <section className="mb-16">
          <div className={`p-8 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Consequences of Violations
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Depending on the severity and frequency of violations, we may take the following actions:
            </p>
            <ul className={`list-disc pl-6 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li><strong>Warning:</strong> For minor first-time violations</li>
              <li><strong>Content Removal:</strong> Deletion of violating posts or materials</li>
              <li><strong>Temporary Suspension:</strong> Limited access for a specified period</li>
              <li><strong>Permanent Ban:</strong> Complete removal from the platform for serious violations</li>
              <li><strong>Legal Action:</strong> In cases involving illegal activity or threats</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className={`p-12 rounded-3xl text-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-gray-800' 
            : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
        }`}>
          <HeartIcon className={`h-16 w-16 mx-auto mb-6 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Together We Learn Better
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Thank you for being part of our community and helping us maintain a positive, inclusive learning environment for everyone.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CommunityGuidelines;
