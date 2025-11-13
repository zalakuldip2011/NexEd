import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
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
          <ShieldCheckIcon className={`h-16 w-16 mx-auto mb-6 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <h1 className={`text-4xl font-bold mb-4 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Privacy Policy
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
        <div className={`prose max-w-none ${
          isDarkMode ? 'prose-invert' : ''
        }`}>
          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              1. Introduction
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              At NexEd, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              2. Information We Collect
            </h2>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              2.1 Personal Information
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              We collect information that you voluntarily provide to us when you:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Register for an account</li>
              <li>Enroll in courses</li>
              <li>Complete your profile</li>
              <li>Communicate with us</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              This information may include: name, email address, username, password, profile photo, payment information, and course preferences.
            </p>

            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              2.2 Automatically Collected Information
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              We automatically collect certain information when you visit, use, or navigate our platform:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>IP address and location data</li>
              <li>Browser and device information</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              3. How We Use Your Information
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              We use the information we collect to:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Provide, operate, and maintain our platform</li>
              <li>Process your transactions and manage your enrollments</li>
              <li>Send you course updates and educational content</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Personalize your learning experience</li>
              <li>Analyze usage patterns and improve our services</li>
              <li>Detect, prevent, and address technical issues or fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              4. Sharing Your Information
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              We may share your information in the following situations:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li><strong>With Instructors:</strong> When you enroll in a course, your information is shared with the instructor</li>
              <li><strong>With Service Providers:</strong> We share information with third-party vendors who perform services on our behalf</li>
              <li><strong>For Legal Reasons:</strong> We may disclose information to comply with legal obligations or protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
              <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              5. Data Security
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no electronic transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              6. Your Privacy Rights
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Access, update, or delete your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              To exercise these rights, please contact us at privacy@nexed.com
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              7. Cookies and Tracking Technologies
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              8. Children's Privacy
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              9. Changes to This Privacy Policy
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              10. Contact Us
            </h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className={`p-6 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                NexEd Privacy Team
              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Email: privacy@nexed.com
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

export default PrivacyPolicy;
