import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsOfService = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Hero Section */}
      <div className={`border-b transition-colors ${
        isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <DocumentTextIcon className={`h-16 w-16 mx-auto mb-6 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <h1 className={`text-4xl font-bold mb-4 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Terms of Service
          </h1>
          <p className={`text-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Last Updated: November 13, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`prose max-w-none`}>
          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              1. Acceptance of Terms
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              By accessing and using NexEd, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              2. User Accounts
            </h2>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              2.1 Account Registration
            </h3>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>You must be at least 13 years old to create an account</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must not share your account credentials</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              2.2 Account Responsibilities
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              You are responsible for all activities that occur under your account. You agree to immediately notify NexEd of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              3. Course Access and Content
            </h2>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              3.1 License to Access Content
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              When you enroll in a course, NexEd grants you a limited, non-exclusive, non-transferable license to access and view the course content for your personal, non-commercial use.
            </p>

            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              3.2 Restrictions
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              You may not:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Download or copy course content (except where explicitly permitted)</li>
              <li>Share your account or course access with others</li>
              <li>Sell, rent, or otherwise distribute course content</li>
              <li>Use course content for commercial purposes</li>
              <li>Modify or create derivative works from course content</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              4. Instructor Terms
            </h2>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              4.1 Content Ownership
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Instructors retain ownership of the content they create and upload. By publishing content on NexEd, instructors grant NexEd a worldwide, non-exclusive license to use, host, and distribute the content.
            </p>

            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              4.2 Revenue Sharing
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Instructors receive 70% of the revenue from course sales. NexEd retains 30% to cover platform costs, payment processing, and support services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              5. Payment and Refunds
            </h2>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              5.1 Pricing
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Course prices are set by instructors and may vary. Prices are displayed in your local currency and include applicable taxes.
            </p>

            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              5.2 Refund Policy
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              We offer a 30-day money-back guarantee for most courses. To request a refund:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Request must be made within 30 days of purchase</li>
              <li>You must not have completed more than 30% of the course</li>
              <li>Refund requests must include a valid reason</li>
              <li>Refunds are not available for courses on sale or promotional pricing</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              6. Prohibited Conduct
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              You agree not to:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or viruses</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Spam or send unsolicited messages</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated systems to access the platform</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              7. Intellectual Property
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              All content on NexEd, including text, graphics, logos, and software, is the property of NexEd or its content suppliers and is protected by international copyright and intellectual property laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              8. Disclaimer of Warranties
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              NexEd is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              9. Limitation of Liability
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              To the maximum extent permitted by law, NexEd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              10. Changes to Terms
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of NexEd after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              11. Contact Information
            </h2>
            <div className={`p-6 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                NexEd Legal Team
              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Email: legal@nexed.com
              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Address: [Your Business Address]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
