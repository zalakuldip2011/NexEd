import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { 
  StarIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import axios from 'axios';

const FeedbackForm = ({ isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const { success, error } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : '',
    email: user?.email || '',
    rating: 0,
    title: '',
    message: '',
    type: 'website_experience'
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'website_experience', label: 'Website Experience', icon: '🌟' },
    { value: 'course_quality', label: 'Course Quality', icon: '📚' },
    { value: 'platform_feature', label: 'Platform Features', icon: '⚡' },
    { value: 'technical_issue', label: 'Technical Issue', icon: '🔧' },
    { value: 'general', label: 'General Feedback', icon: '💬' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.rating || !formData.title.trim() || !formData.message.trim()) {
      error('Please fill in all required fields');
      return;
    }

    if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      error('Name must be between 2 and 100 characters');
      return;
    }

    if (formData.title.trim().length < 5 || formData.title.trim().length > 200) {
      error('Title must be between 5 and 200 characters');
      return;
    }

    if (formData.message.trim().length < 10 || formData.message.trim().length > 1000) {
      error('Message must be between 10 and 1000 characters');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      error('Please provide a rating between 1 and 5 stars');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post('/api/feedback', formData);

      if (response.data.success) {
        success(response.data.message);
        
        // Reset form
        setFormData({
          name: user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : '',
          email: user?.email || '',
          rating: 0,
          title: '',
          message: '',
          type: 'website_experience'
        });

        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }

    } catch (err) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit feedback. Please try again.';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Share Your Experience
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Help us improve NexEd with your valuable feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Feedback Type */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Feedback Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    formData.type === type.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{type.icon}</span>
                    <span className={`text-sm font-medium ${
                      formData.type === type.value
                        ? 'text-purple-700 dark:text-purple-300'
                        : isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Overall Experience <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 rounded transition-transform hover:scale-110"
                >
                  {star <= (hoveredRating || formData.rating) ? (
                    <StarSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIcon className={`h-8 w-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  )}
                </button>
              ))}
              <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formData.rating > 0 && `${formData.rating} out of 5 stars`}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Review Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Give your feedback a title (minimum 5 characters)"
              maxLength={200}
              required
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.title.length}/200 characters (minimum 5)
            </p>
          </div>

          {/* Message */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Tell us about your experience with NexEd. What did you like? What could we improve? (minimum 10 characters)"
              maxLength={1000}
              required
            />
            <div className={`text-right text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.message.length}/1000 characters (minimum 10)
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2 text-sm">
              <HeartIcon className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                Your feedback helps us improve
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.rating}
                className={`px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isSubmitting || !formData.rating
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transform hover:scale-105'
                }`}
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;