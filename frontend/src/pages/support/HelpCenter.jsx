import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  PlayCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const HelpCenter = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    {
      icon: BookOpenIcon,
      title: 'Getting Started',
      description: 'Learn the basics of using NexEd',
      link: '#getting-started',
      articles: 12,
    },
    {
      icon: PlayCircleIcon,
      title: 'Taking Courses',
      description: 'How to enroll and learn effectively',
      link: '#taking-courses',
      articles: 15,
    },
    {
      icon: CreditCardIcon,
      title: 'Payments & Refunds',
      description: 'Billing, pricing, and refund policy',
      link: '#payments',
      articles: 8,
    },
    {
      icon: ShieldCheckIcon,
      title: 'Account & Security',
      description: 'Manage your account and privacy',
      link: '#account',
      articles: 10,
    },
    {
      icon: UserGroupIcon,
      title: 'Teaching on NexEd',
      description: 'Create and publish your courses',
      link: '#teaching',
      articles: 18,
    },
    {
      icon: QuestionMarkCircleIcon,
      title: 'Technical Support',
      description: 'Troubleshooting and technical issues',
      link: '#technical',
      articles: 14,
    },
  ];

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer:
        'To enroll in a course, browse our course catalog, click on the course you\'re interested in, and click the "Enroll Now" button. You can pay using credit card, debit card, or PayPal. Once enrolled, the course will appear in your "My Learning" section.',
    },
    {
      question: 'What is your refund policy?',
      answer:
        'We offer a 30-day money-back guarantee on all courses. If you\'re not satisfied with a course, you can request a full refund within 30 days of purchase. To request a refund, go to your purchase history and click "Request Refund" next to the course.',
    },
    {
      question: 'Can I download course videos for offline viewing?',
      answer:
        'Currently, course videos are only available for online streaming. We\'re working on adding offline download capabilities in the future. You can access your courses anytime, anywhere with an internet connection.',
    },
    {
      question: 'How do I become an instructor?',
      answer:
        'To become an instructor, click on "Teach on NexEd" in the footer, then click "Become an Instructor" and fill out the application form. Our team will review your application within 3-5 business days. Once approved, you can start creating courses.',
    },
    {
      question: 'Do I get a certificate after completing a course?',
      answer:
        'Yes! Upon completing all course content and any required assessments, you\'ll receive a certificate of completion. You can download it from your course page and share it on LinkedIn or add it to your resume.',
    },
    {
      question: 'Can I access courses on mobile devices?',
      answer:
        'Absolutely! NexEd is fully responsive and works on all devices including smartphones, tablets, and desktop computers. Simply log in to your account from any device to access your courses.',
    },
    {
      question: 'How long do I have access to a course after purchase?',
      answer:
        'Once you purchase a course, you have lifetime access to it. You can learn at your own pace and revisit the content anytime. Course updates and new content added by the instructor are also included.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and PayPal. All transactions are secure and encrypted using industry-standard security protocols.',
    },
  ];

  const popularArticles = [
    {
      title: 'How to Reset Your Password',
      category: 'Account & Security',
      views: '12.5K',
    },
    {
      title: 'Understanding Course Certificates',
      category: 'Taking Courses',
      views: '10.2K',
    },
    {
      title: 'Instructor Revenue Share Explained',
      category: 'Teaching on NexEd',
      views: '8.7K',
    },
    {
      title: 'Troubleshooting Video Playback Issues',
      category: 'Technical Support',
      views: '7.9K',
    },
    {
      title: 'How to Request a Refund',
      category: 'Payments & Refunds',
      views: '6.5K',
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />

      {/* Hero Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-gradient-to-br from-indigo-600 to-purple-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <QuestionMarkCircleIcon className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Search our knowledge base or browse categories below
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for articles, questions, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-xl text-lg ${
                  isDarkMode
                    ? 'bg-gray-800 text-white border-gray-700'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2
          className={`text-3xl font-bold mb-8 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <a
              key={index}
              href={category.link}
              className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                  : 'bg-white hover:shadow-xl border border-gray-200'
              }`}
            >
              <category.icon
                className={`h-12 w-12 mb-4 ${
                  isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`}
              />
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {category.title}
              </h3>
              <p
                className={`mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {category.description}
              </p>
              <span
                className={`text-sm ${
                  isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`}
              >
                {category.articles} articles
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Popular Articles Section */}
      <section
        className={`py-16 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className={`text-3xl font-bold mb-8 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Popular Articles
          </h2>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <a
                key={index}
                href="#"
                className={`block p-6 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-750 hover:bg-gray-700 border border-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {article.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {article.category}
                    </p>
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    {article.views} views
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2
          className={`text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full p-6 text-left flex items-center justify-between hover:${
                  isDarkMode ? 'bg-gray-750' : 'bg-gray-50'
                } transition-colors duration-200`}
              >
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {faq.question}
                </h3>
                {expandedFAQ === index ? (
                  <ChevronUpIcon
                    className={`h-6 w-6 ${
                      isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`}
                  />
                ) : (
                  <ChevronDownIcon
                    className={`h-6 w-6 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  />
                )}
              </button>
              {expandedFAQ === index && (
                <div className="px-6 pb-6">
                  <p
                    className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    } leading-relaxed`}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section
        className={`py-16 ${
          isDarkMode
            ? 'bg-gradient-to-br from-indigo-900 to-purple-900'
            : 'bg-gradient-to-br from-indigo-600 to-purple-600'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still need help?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Our support team is here to assist you
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Contact Support
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;
