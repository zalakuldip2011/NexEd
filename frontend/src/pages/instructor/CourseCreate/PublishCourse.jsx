import React, { useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  GlobeAltIcon,
  TagIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PublishCourse = ({ data, updateData, onPrev, onSaveDraft, onPublish }) => {
  const [publishSettings, setPublishSettings] = useState({
    isPublished: false,
    visibility: 'public', // public, private, unlisted
    price: data?.price || 0,
    enableDiscounts: false,
    discountPercentage: 0,
    featured: false,
    enableCertificate: true,
    enableQA: true,
    enableReviews: true
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(data?.thumbnail || null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(Array.isArray(data?.tags) ? data.tags : []);

  // Auto-validate when data changes
  React.useEffect(() => {
    if (validationErrors.length > 0) {
      validateCourse();
    }
  }, [data?.title, data?.description, data?.category, data?.level]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      // ✅ SAFE: Validate tags before spreading
      const safeTags = Array.isArray(tags) ? tags : [];
      if (safeTags.length === 0 || !safeTags.includes(newTag)) {
        if (safeTags.length < 10) {
          const updatedTags = [...safeTags, newTag];
          setTags(updatedTags);
          updateData({ tags: updatedTags });
          setTagInput('');
        }
      }
    }
  };

  const removeTag = (tagToRemove) => {
    if (!Array.isArray(tags)) {
      setTags([]);
      updateData({ tags: [] });
      return;
    }
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    updateData({ tags: updatedTags });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setThumbnailFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
        updateData({ thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    updateData({ thumbnail: null });
  };

  const validateCourse = () => {
    const errors = [];
    
    if (!data?.title) errors.push('Course title is required');
    if (!data?.description) errors.push('Course description is required');
    if (!data?.category) errors.push('Course category is required');
    if (!data?.level) errors.push('Course level is required');
    if (!Array.isArray(data?.learningOutcomes) || data.learningOutcomes.length === 0) {
      errors.push('At least one learning outcome is required');
    }
    if (!Array.isArray(data?.sections) || data.sections.length === 0) {
      errors.push('At least one section is required');
    }
    if (Array.isArray(data?.sections) && data.sections.length > 0) {
      const hasLectures = data.sections.some(section => 
        Array.isArray(section.lectures) && section.lectures.length > 0
      );
      if (!hasLectures) errors.push('At least one lecture is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePublish = () => {
    try {
      // Re-validate before publishing
      if (validateCourse()) {
        // Safely get data with defaults - NEVER spread undefined/null
        const safeData = data && typeof data === 'object' ? data : {};
        const safePublishSettings = publishSettings && typeof publishSettings === 'object' ? publishSettings : {};
        const safeTags = Array.isArray(tags) ? tags : [];
        
        // Include ALL course data that might have been updated in this step
        const updatedData = {
          // Include any fields updated in this component
          title: safeData.title || '',
          subtitle: safeData.subtitle || '',
          description: safeData.description || '',
          category: safeData.category || '',
          level: safeData.level || '',
          language: safeData.language || 'English',
          thumbnail: safeData.thumbnail || thumbnailPreview || '',
          tags: safeTags,
          // Include publish settings
          price: safePublishSettings.price || safeData.price || 0,
          featured: safePublishSettings.featured || false
        };
        console.log('✅ PublishCourse - Sending updated data:', updatedData);
        // Pass updated data to parent
        onPublish(updatedData);
      } else {
        // Scroll to top to show validation errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('❌ Error in handlePublish:', error);
      alert(`Error preparing course data: ${error.message}`);
    }
  };

  const handleSaveDraft = () => {
    try {
      // Safely get data with defaults - NEVER spread undefined/null
      const safeData = data && typeof data === 'object' ? data : {};
      const safePublishSettings = publishSettings && typeof publishSettings === 'object' ? publishSettings : {};
      const safeTags = Array.isArray(tags) ? tags : [];
      
      // Include ALL course data that might have been updated in this step
      const updatedData = {
        // Include any fields updated in this component
        title: safeData.title || '',
        subtitle: safeData.subtitle || '',
        description: safeData.description || '',
        category: safeData.category || '',
        level: safeData.level || '',
        language: safeData.language || 'English',
        thumbnail: safeData.thumbnail || thumbnailPreview || '',
        tags: safeTags,
        // Include publish settings
        price: safePublishSettings.price || safeData.price || 0,
        featured: safePublishSettings.featured || false
      };
      console.log('✅ PublishCourse - Saving draft with data:', updatedData);
      // Pass updated data to parent
      onSaveDraft(updatedData);
    } catch (error) {
      console.error('❌ Error in handleSaveDraft:', error);
      alert(`Error preparing draft data: ${error.message}`);
    }
  };

  const updatePublishSettings = (field, value) => {
    setPublishSettings(prev => {
      const safePrev = prev && typeof prev === 'object' ? prev : {};
      return {
        ...safePrev,
        [field]: value
      };
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Publish Your Course</h2>
        
        {/* Course Validation */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Readiness Check</h3>
          
          {validationErrors.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="text-sm font-medium text-red-800">
                  Please fix the following issues before publishing:
                </h4>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-sm text-green-800">
                  Your course is ready to be published!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Publishing Settings */}
        <div className="space-y-6">
          {/* Basic Course Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={data?.title || ''}
                  onChange={(e) => {
                    updateData({ title: e.target.value });
                    // Clear validation errors if title is now filled
                    if (e.target.value.trim()) {
                      // ✅ SAFE: Validate prev before filtering
                      setValidationErrors(prev => {
                        const safePrev = Array.isArray(prev) ? prev : [];
                        return safePrev.filter(err => err !== 'Course title is required');
                      });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    data?.title && data.title.trim() 
                      ? 'border-green-300 bg-green-50' 
                      : (Array.isArray(validationErrors) && validationErrors.includes('Course title is required'))
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Complete Web Development Bootcamp"
                  maxLength={100}
                />
                {data?.title && data.title.trim() && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Title looks good!
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {(data?.title?.length || 0)}/100 characters
                </p>
              </div>

              {/* Course Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Subtitle
                </label>
                <input
                  type="text"
                  value={data?.subtitle || ''}
                  onChange={(e) => updateData({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Learn HTML, CSS, JavaScript, React and more"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(data?.subtitle?.length || 0)}/200 characters
                </p>
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  value={data?.description || ''}
                  onChange={(e) => updateData({ description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what students will learn in this course..."
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(data?.description?.length || 0)}/5000 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={data?.category || ''}
                  onChange={(e) => updateData({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Photography">Photography</option>
                  <option value="Music">Music</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Programming">Programming</option>
                  <option value="Technology">Technology</option>
                  <option value="Language">Language</option>
                  <option value="Academic">Academic</option>
                  <option value="Personal Development">Personal Development</option>
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Level *
                </label>
                <select
                  value={data?.level || ''}
                  onChange={(e) => updateData({ level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Language
                </label>
                <input
                  type="text"
                  value={data?.language || 'English'}
                  onChange={(e) => updateData({ language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="English"
                />
              </div>

              {/* Course Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                </label>
                <div className="mt-1">
                  {thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={thumbnailPreview} 
                        alt="Course thumbnail" 
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-purple-500 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PhotoIcon className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 1280x720px (16:9 aspect ratio)
                </p>
              </div>

              {/* Course Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Tags
                </label>
                <div className="space-y-2">
                  {/* Tags Display */}
                  {Array.isArray(tags) && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-purple-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Tag Input */}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a tag and press Enter (max 10 tags)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={Array.isArray(tags) && tags.length >= 10}
                  />
                  <p className="text-xs text-gray-500">
                    {Array.isArray(tags) ? tags.length : 0}/10 tags • Press Enter to add
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Settings</h3>
            
            <div className="space-y-4">
              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Visibility
                </label>
                <select
                  value={publishSettings.visibility}
                  onChange={(e) => updatePublishSettings('visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="public">Public - Anyone can find and enroll</option>
                  <option value="unlisted">Unlisted - Only accessible via direct link</option>
                  <option value="private">Private - Invitation only</option>
                </select>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Price
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={publishSettings.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string (for clearing) or valid numbers
                      if (value === '' || value === null) {
                        updatePublishSettings('price', '');
                      } else {
                        const parsed = parseFloat(value);
                        updatePublishSettings('price', isNaN(parsed) ? 0 : parsed);
                      }
                    }}
                    onBlur={(e) => {
                      // On blur, if empty, set to 0
                      if (e.target.value === '' || e.target.value === null) {
                        updatePublishSettings('price', 0);
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set to $0 for a free course
                </p>
              </div>

              {/* Discount Settings */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={publishSettings.enableDiscounts}
                    onChange={(e) => updatePublishSettings('enableDiscounts', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable promotional pricing</span>
                </label>
                
                {publishSettings.enableDiscounts && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage
                    </label>
                    <input
                      type="number"
                      value={publishSettings.discountPercentage}
                      onChange={(e) => updatePublishSettings('discountPercentage', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="20"
                      min="0"
                      max="90"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Features</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={publishSettings.enableCertificate}
                  onChange={(e) => updatePublishSettings('enableCertificate', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Issue completion certificates</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={publishSettings.enableQA}
                  onChange={(e) => updatePublishSettings('enableQA', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Q&A section</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={publishSettings.enableReviews}
                  onChange={(e) => updatePublishSettings('enableReviews', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Allow student reviews</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={publishSettings.featured}
                  onChange={(e) => updatePublishSettings('featured', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Request featured placement</span>
              </label>
            </div>
          </div>

          {/* Course Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Title:</p>
                <p className="font-medium text-gray-900">{data?.title || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Category:</p>
                <p className="font-medium text-gray-900">{data?.category || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Level:</p>
                <p className="font-medium text-gray-900">{data?.level || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Price:</p>
                <p className="font-medium text-gray-900">
                  ${publishSettings.price === 0 ? 'Free' : publishSettings.price}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Sections:</p>
                <p className="font-medium text-gray-900">
                  {data?.sections?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Lectures:</p>
                <p className="font-medium text-gray-900">
                  {data?.sections?.reduce((total, section) => 
                    total + (section.lectures?.length || 0), 0
                  ) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-3 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
          >
            Save as Draft
          </button>
          
          <button
            onClick={handlePublish}
            disabled={validationErrors.length > 0}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishCourse;