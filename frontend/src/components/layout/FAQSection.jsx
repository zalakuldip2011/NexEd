import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FAQSection = () => {
  const { isDarkMode } = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I get started with NexEd?',
      answer: 'Getting started is easy! Simply create a free account, browse our course catalog, and enroll in any course that interests you. You can start learning immediately after enrollment.'
    },
    {
      question: 'Are the courses really free?',
      answer: 'We offer both free and paid courses. Free courses give you access to video lectures and basic materials. Premium courses include certificates, downloadable resources, instructor Q&A, and lifetime access to updates.'
    },
    {
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Yes! We offer a 30-day money-back guarantee for all paid courses. If you\'re not completely satisfied with your purchase, you can request a full refund within 30 days of enrollment.'
    },
    {
      question: 'Do I get a certificate after completing a course?',
      answer: 'Yes, you receive a certificate of completion for every course you finish. Our certificates are shareable and can be added to your LinkedIn profile or resume to showcase your new skills.'
    },
    {
      question: 'How long do I have access to a course?',
      answer: 'Once you enroll in a course, you have lifetime access. You can learn at your own pace, revisit lessons anytime, and access all future updates to the course content.'
    },
    {
      question: 'Can I learn on mobile devices?',
      answer: 'Absolutely! Our platform is fully responsive and works seamlessly on desktop, tablet, and mobile devices. Learn anytime, anywhere, at your own convenience.'
    },
    {
      question: 'What if I have questions during the course?',
      answer: 'Every course has a Q&A section where you can ask questions and get answers from instructors and fellow students. Premium courses also include direct instructor support.'
    },
    {
      question: 'Can I become an instructor on NexEd?',
      answer: 'Yes! We welcome subject matter experts to become instructors. Click on "Become an Educator" to apply. Our team will review your application and guide you through the course creation process.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Frequently Asked Questions
          </h2>
          <p className={`text-lg md:text-xl ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Got questions? We've got answers
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-900 hover:bg-gray-850'
                  : 'bg-white hover:shadow-lg'
              } ${openIndex === index ? 'shadow-xl' : 'shadow-md'}`}
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors duration-200"
              >
                <span className={`text-lg font-semibold pr-8 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 rotate-180'
                    : isDarkMode
                    ? 'bg-gray-800'
                    : 'bg-gray-100'
                }`}>
                  {openIndex === index ? (
                    <ChevronUpIcon className="h-5 w-5 text-white" />
                  ) : (
                    <ChevronDownIcon className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  )}
                </div>
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`px-6 pb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <div className={`pt-2 border-t ${
                    isDarkMode ? 'border-gray-800' : 'border-gray-100'
                  }`}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className={`mt-12 text-center p-8 rounded-2xl ${
          isDarkMode
            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-800'
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
        }`}>
          <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Still have questions?
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
