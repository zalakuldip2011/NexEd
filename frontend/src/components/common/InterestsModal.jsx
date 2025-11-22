import React, { useState } from 'react';
import { 
  XMarkIcon, 
  AcademicCapIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import api from '../../services/api';

const CATEGORIES = [
  { id: 'web-dev', name: 'Web Development', icon: '💻' },
  { id: 'mobile-dev', name: 'Mobile Development', icon: '📱' },
  { id: 'data-science', name: 'Data Science', icon: '📊' },
  { id: 'ml', name: 'Machine Learning', icon: '🤖' },
  { id: 'ai', name: 'Artificial Intelligence', icon: '🧠' },
  { id: 'cloud', name: 'Cloud Computing', icon: '☁️' },
  { id: 'devops', name: 'DevOps', icon: '⚙️' },
  { id: 'cyber', name: 'Cybersecurity', icon: '🔒' },
  { id: 'blockchain', name: 'Blockchain', icon: '⛓️' },
  { id: 'game-dev', name: 'Game Development', icon: '🎮' },
  { id: 'ui-ux', name: 'UI/UX Design', icon: '🎨' },
  { id: 'graphic', name: 'Graphic Design', icon: '🖌️' },
  { id: '3d', name: '3D & Animation', icon: '🎬' },
  { id: 'marketing', name: 'Digital Marketing', icon: '📈' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'finance', name: 'Finance & Accounting', icon: '💰' },
  { id: 'entrepreneur', name: 'Entrepreneurship', icon: '🚀' },
  { id: 'personal', name: 'Personal Development', icon: '🌱' },
  { id: 'photo', name: 'Photography', icon: '📷' },
  { id: 'video', name: 'Video Production', icon: '🎥' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'fitness', name: 'Health & Fitness', icon: '💪' },
  { id: 'language', name: 'Language Learning', icon: '🌍' },
  { id: 'academic', name: 'Academic', icon: '📚' },
  { id: 'test-prep', name: 'Test Prep', icon: '✍️' },
  { id: 'other', name: 'Other', icon: '🔮' }
];

const SKILL_LEVELS = [
  { id: 'beginner', name: 'Beginner', desc: 'Just starting out' },
  { id: 'intermediate', name: 'Intermediate', desc: 'Some experience' },
  { id: 'advanced', name: 'Advanced', desc: 'Significant expertise' },
  { id: 'expert', name: 'Expert', desc: 'Professional level' }
];

const GOALS = [
  { id: 'Career Advancement', name: 'Career Advancement', icon: '📈' },
  { id: 'Skill Development', name: 'Skill Development', icon: '🎯' },
  { id: 'Certification', name: 'Get Certified', icon: '🏆' },
  { id: 'Hobby', name: 'Hobby/Fun', icon: '🎨' },
  { id: 'Academic Requirements', name: 'Academic', icon: '🎓' },
  { id: 'Business Growth', name: 'Business Growth', icon: '💼' },
  { id: 'Personal Interest', name: 'Personal Interest', icon: '✨' },
  { id: 'Other', name: 'Other', icon: '🔮' }
];

const InterestsModal = ({ isOpen, onClose, onComplete }) => {
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [selectedGoals, setSelectedGoals] = useState([]);

  if (!isOpen) return null;

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      if (selectedCategories.length < 10) {
        setSelectedCategories([...selectedCategories, category]);
      }
    }
  };

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedCategories.length === 0) {
      alert('Please select at least one interest');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.put(
        '/auth/interests',
        {
          categories: selectedCategories,
          skillLevel: skillLevel,
          goals: selectedGoals
        }
      );

      if (response.data.success) {
        // Update user context
        const updatedUser = {
          ...user,
          interests: response.data.data.interests
        };
        updateUser(updatedUser);
        
        if (onComplete) {
          onComplete();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error saving interests:', error);
      alert(error.response?.data?.message || 'Failed to save interests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b backdrop-blur-lg ${
          isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {step === 1 ? 'What would you like to learn?' : step === 2 ? 'Your skill level' : 'Your learning goals'}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {step === 1 
                    ? 'Select topics you\'re interested in (up to 10)'
                    : step === 2
                    ? 'Help us understand your current level'
                    : 'What do you want to achieve?'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                    : isDarkMode
                    ? 'bg-slate-700'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Categories */}
          {step === 1 && (
            <div>
              <div className="mb-4">
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Selected: {selectedCategories.length}/10
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((category) => {
                  const isSelected = selectedCategories.includes(category.name);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.name)}
                      disabled={!isSelected && selectedCategories.length >= 10}
                      className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : isDarkMode
                          ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      } ${!isSelected && selectedCategories.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className={`text-sm font-medium ${
                        isSelected
                          ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {category.name}
                      </div>
                      {isSelected && (
                        <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Skill Level */}
          {step === 2 && (
            <div className="space-y-4">
              {SKILL_LEVELS.map((level) => {
                const isSelected = skillLevel === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setSkillLevel(level.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all transform hover:scale-102 text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : isDarkMode
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-lg font-semibold ${
                          isSelected
                            ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            : isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {level.name}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {level.desc}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : isDarkMode
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className={`text-sm font-medium ${
                      isSelected
                        ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        : isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {goal.name}
                    </div>
                    {isSelected && (
                      <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 p-6 border-t backdrop-blur-lg ${
          isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && selectedCategories.length === 0}
                className={`ml-auto px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                  step === 1 && selectedCategories.length === 0 ? '' : ''
                }`}
              >
                <span>Continue</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || selectedCategories.length === 0}
                className="ml-auto px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Complete Setup</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsModal;
