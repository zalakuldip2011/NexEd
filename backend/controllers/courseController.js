const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');
const { 
  getPersonalizedCourses, 
  getFeaturedCourses,
  getPopularCourses,
  getTrendingCourses,
  getSmartRecommendations
} = require('../services/recommendationService');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Public course endpoints for students

// Get all published courses with filters and search
const getCourses = async (req, res) => {
  try {
    console.log('📚 GET COURSES (PUBLIC)');
    console.log('   Query params:', req.query);
    
    const {
      search,
      category,
      level,
      minPrice,
      maxPrice,
      rating,
      tags,
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      ...(category && { category }),
      ...(level && { level }),
      ...(minPrice !== undefined && { minPrice: parseFloat(minPrice) }),
      ...(maxPrice !== undefined && { maxPrice: parseFloat(maxPrice) }),
      ...(rating && { rating: parseFloat(rating) }),
      ...(tags && { tags: tags.split(',') }),
      sortBy,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    console.log('   Filters:', JSON.stringify(filters));

    const courses = await Course.searchCourses(search, filters);
    const total = await Course.countDocuments({ isPublished: true });

    console.log('   ✅ Found', courses.length, 'courses (', total, 'total)');

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCourses: total,
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get courses by category
const getCoursesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const courses = await Course.getCoursesByCategory(category, parseInt(limit));

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses by category'
    });
  }
};

// Get featured courses (enhanced with recommendation service)
const getFeaturedCoursesController = async (req, res) => {
  try {
    console.log('⭐ GET FEATURED COURSES');
    
    const limit = parseInt(req.query.limit) || 12;
    const courses = await getFeaturedCourses(limit);

    console.log('   ✅ Returning', courses.length, 'featured courses');

    res.json({
      success: true,
      data: {
        courses,
        total: courses.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting featured courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get popular tags
const getPopularTags = async (req, res) => {
  try {
    const tags = await Course.getPopularTags();

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular tags'
    });
  }
};

// Get course by ID with similar courses
const getCourseById = async (req, res) => {
  try {
    console.log('📖 GET COURSE BY ID (PUBLIC)');
    console.log('   Course ID:', req.params.id);
    
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      console.log('   ❌ Invalid course ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }
    
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profilePicture instructorProfile')
      .populate('reviews.student', 'name profilePicture');

    if (!course || !course.isPublished) {
      console.log('   ❌ Course not found or not published');
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('   Course found:', course.title);

    // Get similar courses
    const similarCourses = await course.getSimilarCourses();

    console.log('   ✅ Returning course data with', similarCourses.length, 'similar courses');
    res.json({
      success: true,
      data: {
        course,
        similarCourses
      }
    });
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get course categories with counts
const getCategories = async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(cat => ({
        category: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

// Instructor course management endpoints

// Get all courses for an instructor
const getInstructorCourses = async (req, res) => {
  try {
    console.log('=== GET INSTRUCTOR COURSES ===');
    console.log('User ID:', req.user?._id);
    console.log('User:', req.user);
    
    // Validate user exists
    if (!req.user || !req.user._id) {
      console.error('❌ No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        error: 'User not authenticated'
      });
    }
    
    // First, let's check if there are ANY courses in the database (for debugging)
    const allCoursesCount = await Course.countDocuments({});
    console.log('Total courses in database:', allCoursesCount);
    
    // Now find courses for this instructor with better error handling
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    console.log('Courses found for instructor:', courses.length);
    if (courses.length > 0) {
      console.log('Sample course:', { 
        title: courses[0].title, 
        status: courses[0].status,
        instructor: courses[0].instructor?._id?.toString()
      });
    }

    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('💥 Error fetching instructor courses:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get course statistics for instructor dashboard
const getCourseStats = async (req, res) => {
  try {
    console.log('=== GET COURSE STATS ===');
    console.log('Instructor ID:', req.user._id);
    
    const instructorId = req.user._id;
    
    // Get all courses for this instructor
    const allCourses = await Course.find({ instructor: instructorId });
    console.log(`Found ${allCourses.length} courses for instructor`);
    
    // Calculate stats
    const totalCourses = allCourses.length;
    const publishedCourses = allCourses.filter(c => c.status === 'published' || c.isPublished).length;
    const draftCourses = allCourses.filter(c => c.status === 'draft' || !c.isPublished).length;
    const totalEnrollments = allCourses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0);
    const totalRevenue = allCourses.reduce((sum, c) => sum + ((c.price || 0) * (c.totalEnrollments || 0)), 0);
    const ratingsSum = allCourses.reduce((sum, c) => sum + (c.averageRating || 0), 0);
    const averageRating = totalCourses > 0 ? ratingsSum / totalCourses : 0;
    
    // Get recent courses (last 5)
    const recentCourses = await Course.find({ instructor: instructorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title thumbnail status isPublished createdAt totalEnrollments averageRating price');
    
    const stats = {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents: totalEnrollments,
      totalEnrollments,
      totalRevenue,
      averageRating: parseFloat(averageRating.toFixed(1))
    };
    
    console.log('Stats calculated:', stats);
    console.log(`Recent courses: ${recentCourses.length}`);

    res.json({
      success: true,
      data: {
        stats,
        recentCourses
      }
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics',
      error: error.message
    });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  try {
    console.log('=== CREATE COURSE START ===');
    
    // CRITICAL FIX: Validate req.body exists and is an object
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      console.error('❌ Invalid request body:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected JSON object.',
        error: 'Request body is null, undefined, or not an object'
      });
    }
    
    console.log('Received course data:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    
    // CRITICAL: Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error('❌ No user found in request! Authentication failed.');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in and try again.',
        error: 'User not authenticated'
      });
    }
    
    console.log('✅ User authenticated:', req.user._id);
    
    // Only extract fields we actually use - ignore any extra fields
    const allowedFields = [
      'title', 'subtitle', 'description', 'category', 'level', 'price',
      'language', 'learningOutcomes', 'requirements', 'prerequisites',
      'targetAudience', 'tags', 'sections', 'status', 'thumbnail', 'featured',
      'promotionalPrice', 'discountPercentage', 'courseFeature' // Optional fields
    ];
    
    // Filter out any fields not in our allowed list - SAFE because we validated req.body above
    const filteredBody = {};
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        filteredBody[field] = req.body[field];
      }
    });
    
    console.log('Filtered to allowed fields only:', Object.keys(filteredBody));
    
    // Destructure with safety from filtered body
    const {
      title,
      subtitle,
      description,
      category,
      level,
      price,
      language,
      learningOutcomes,
      requirements,
      prerequisites,
      targetAudience,
      tags,
      sections,
      status,
      thumbnail,
      featured
    } = filteredBody;

    console.log('Destructured fields:', {
      title: title || 'MISSING',
      category: category || 'MISSING',
      level: level || 'MISSING',
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes.length : 'NOT ARRAY',
      sections: Array.isArray(sections) ? sections.length : 'NOT ARRAY'
    });

    // Safely handle arrays - ensure they are arrays and filter out empty strings
    console.log('Processing arrays...');
    const safeLearningOutcomes = Array.isArray(learningOutcomes) 
      ? learningOutcomes.filter(outcome => outcome && typeof outcome === 'string' && outcome.trim() !== '')
      : [];
    console.log('safeLearningOutcomes:', safeLearningOutcomes);
    
    const safeRequirements = Array.isArray(requirements) 
      ? requirements.filter(req => req && typeof req === 'string' && req.trim() !== '')
      : Array.isArray(prerequisites)
        ? prerequisites.filter(req => req && typeof req === 'string' && req.trim() !== '')
        : [];
    console.log('safeRequirements:', safeRequirements);
    
    const safeTags = Array.isArray(tags)
      ? tags.filter(tag => tag && typeof tag === 'string' && tag.trim() !== '')
      : [];
    console.log('safeTags:', safeTags);
    
    console.log('Processing sections...');
    const safeSections = Array.isArray(sections) 
      ? sections.map((section, idx) => {
          console.log(`Processing section ${idx}:`, section);
          if (!section || typeof section !== 'object') {
            console.warn(`Section ${idx} is not an object, skipping`);
            return null;
          }
          return {
            title: section.title || '',
            description: section.description || '',
            order: section.order || idx + 1,
            lectures: Array.isArray(section.lectures) 
              ? section.lectures.map((lecture, lIdx) => {
                  console.log(`  Processing lecture ${idx}-${lIdx}:`, lecture);
                  if (!lecture || typeof lecture !== 'object') {
                    console.warn(`  Lecture ${idx}-${lIdx} is not an object, skipping`);
                    return null;
                  }
                  
                  // Safely handle videoData object
                  const safeVideoData = lecture.videoData && typeof lecture.videoData === 'object'
                    ? lecture.videoData
                    : null;
                  
                  return {
                    title: lecture.title || '',
                    description: lecture.description || '',
                    type: lecture.type || 'video',
                    videoUrl: lecture.videoUrl || '',
                    videoData: safeVideoData,
                    duration: parseFloat(lecture.duration) || 0,
                    resources: Array.isArray(lecture.resources) ? lecture.resources : [],
                    isPreview: Boolean(lecture.isPreview),
                    order: lecture.order || lIdx + 1
                  };
                }).filter(l => l !== null)
              : []
          };
        }).filter(s => s !== null)
      : [];
    console.log('safeSections count:', safeSections.length);

    // Verify instructor ID before creating course
    if (!req.user || !req.user._id) {
      throw new Error('Instructor ID is missing. User authentication may have failed.');
    }

    // Prepare course data
    const courseData = {
      title: title || '',
      subtitle: subtitle || '',
      description: description || '',
      category: category || '',
      level: level || '',
      price: parseFloat(price) || 0,
      language: language || 'English',
      learningOutcomes: safeLearningOutcomes,
      requirements: safeRequirements,
      targetAudience: targetAudience || '',
      tags: safeTags,
      sections: safeSections,
      thumbnail: thumbnail || '',
      featured: Boolean(featured),
      instructor: req.user._id,
      status: status || 'draft',
      isPublished: status === 'published'
    };
    
    // Handle optional promotional/discount fields (they are allowed to be undefined/skipped)
    if (filteredBody.promotionalPrice !== undefined && filteredBody.promotionalPrice !== null) {
      courseData.promotionalPrice = parseFloat(filteredBody.promotionalPrice) || 0;
    }
    if (filteredBody.discountPercentage !== undefined && filteredBody.discountPercentage !== null) {
      courseData.discountPercentage = parseFloat(filteredBody.discountPercentage) || 0;
    }
    if (filteredBody.courseFeature !== undefined && filteredBody.courseFeature !== null) {
      courseData.courseFeature = filteredBody.courseFeature;
    }

    // Calculate total lectures and duration
    let totalLectures = 0;
    let totalDuration = 0;
    
    safeSections.forEach(section => {
      if (section.lectures && Array.isArray(section.lectures)) {
        totalLectures += section.lectures.length;
        section.lectures.forEach(lecture => {
          if (lecture.duration) {
            totalDuration += parseFloat(lecture.duration) * 60; // Convert minutes to seconds
          }
        });
      }
    });
    
    courseData.totalLectures = totalLectures;
    courseData.totalDuration = totalDuration;

    console.log('=== CREATE COURSE ===');
    console.log('User ID from req.user:', req.user._id);
    console.log('User ID type:', typeof req.user._id);
    console.log('Course title:', courseData.title);
    console.log('Course instructor:', courseData.instructor);

    const course = new Course(courseData);

    // If publishing, set published date
    if (status === 'published') {
      course.publishedAt = new Date();
    }

    await course.save();

    // Populate instructor data for response - with error handling
    try {
      await course.populate('instructor', 'name email profilePicture username');
    } catch (populateError) {
      console.warn('⚠️  Could not populate instructor data:', populateError.message);
      // Continue anyway - course was saved successfully
    }

    console.log('Course saved successfully!');
    console.log('Course ID:', course._id);
    console.log('Course instructor after save:', course.instructor?._id || course.instructor);

    res.status(201).json({
      success: true,
      message: status === 'published' ? 'Course published successfully' : 'Course saved as draft',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    console.error('Error stack:', error.stack);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: validationErrors.join(', '),
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// Get a single course (instructor only)
const getInstructorCourse = async (req, res) => {
  try {
    console.log('📖 GET INSTRUCTOR COURSE');
    console.log('   Course ID:', req.params.id);
    console.log('   User ID:', req.user._id);
    
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      console.log('   ❌ Invalid course ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }
    
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profilePicture instructorProfile');

    if (!course) {
      console.log('   ❌ Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('   Course found:', course.title);
    console.log('   Course instructor:', course.instructor);

    // Check if course has an instructor field
    if (!course.instructor) {
      console.log('   ❌ Course has no instructor assigned');
      return res.status(400).json({
        success: false,
        message: 'Course has no instructor assigned. Please re-create the course.'
      });
    }

    // Get instructor ID (handle both populated and non-populated cases)
    const instructorId = course.instructor._id 
      ? course.instructor._id.toString() 
      : course.instructor.toString();
    
    console.log('   Instructor ID:', instructorId);
    console.log('   Requesting User ID:', req.user._id.toString());

    // Check if user is the instructor of this course
    if (instructorId !== req.user._id.toString()) {
      console.log('   ❌ Not authorized - User is not the instructor');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course'
      });
    }

    console.log('   ✅ Authorization successful');
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a course
const updateCourse = async (req, res) => {
  try {
    console.log('📝 UPDATE COURSE');
    console.log('   Course ID:', req.params.id);
    console.log('   User ID:', req.user._id);
    
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      console.log('   ❌ Invalid course ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }
    
    const course = await Course.findById(req.params.id);

    if (!course) {
      console.log('   ❌ Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('   Course found:', course.title);

    // Check if course has an instructor field
    if (!course.instructor) {
      console.log('   ❌ Course has no instructor assigned');
      return res.status(400).json({
        success: false,
        message: 'Course has no instructor assigned. Please re-create the course.'
      });
    }

    console.log('   Course instructor:', course.instructor.toString());
    console.log('   Requesting user:', req.user._id.toString());

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      console.log('   ❌ Not authorized - User is not the instructor');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    console.log('   ✅ Authorization successful, updating course...');
    
    // Apply updates to the course object
    Object.assign(course, req.body);
    
    // Save to trigger pre-save middleware (calculateTotals)
    await course.save();
    
    console.log('   ✅ Course saved, populating instructor...');
    
    // Populate instructor data for response
    await course.populate('instructor', 'name email profilePicture');

    console.log('   ✅ Course updated successfully');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Error updating course:', error);
    console.error('   Error stack:', error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle course publish status (Quick publish/unpublish)
const togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has an instructor field
    if (!course.instructor) {
      return res.status(400).json({
        success: false,
        message: 'Course has no instructor assigned. Please re-create the course.'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course'
      });
    }

    // Determine the new status
    const newStatus = course.status === 'published' ? 'draft' : 'published';

    // Validation for publishing (only if changing to published)
    if (newStatus === 'published') {
      const validationErrors = [];

      if (!course.title || course.title.trim() === '') {
        validationErrors.push('Course title is required');
      }
      if (!course.description || course.description.trim() === '') {
        validationErrors.push('Course description is required');
      }
      if (!course.thumbnail) {
        validationErrors.push('Course thumbnail is required');
      }
      if (!course.category) {
        validationErrors.push('Course category is required');
      }
      if (course.price === undefined || course.price < 0) {
        validationErrors.push('Valid course price is required');
      }
      if (!course.sections || course.sections.length === 0) {
        validationErrors.push('At least one section is required');
      } else {
        const hasLectures = course.sections.some(section => 
          section.lectures && section.lectures.length > 0
        );
        if (!hasLectures) {
          validationErrors.push('At least one lecture is required');
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Course cannot be published. Please complete all required fields.',
          validationErrors,
          completionChecklist: {
            hasTitle: !!course.title,
            hasDescription: !!course.description,
            hasThumbnail: !!course.thumbnail,
            hasCategory: !!course.category,
            hasPrice: course.price !== undefined && course.price >= 0,
            hasSections: course.sections && course.sections.length > 0,
            hasLectures: course.sections && course.sections.some(s => s.lectures && s.lectures.length > 0)
          }
        });
      }
    }

    // Update the status
    course.status = newStatus;
    
    // Update isPublished flag for backwards compatibility
    course.isPublished = newStatus === 'published';
    
    await course.save();

    res.json({
      success: true,
      message: `Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      data: {
        courseId: course._id,
        status: course.status,
        isPublished: course.isPublished
      }
    });
  } catch (error) {
    console.error('Error toggling course publish status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course status',
      error: error.message
    });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has an instructor field
    if (!course.instructor) {
      return res.status(400).json({
        success: false,
        message: 'Course has no instructor assigned. Please re-create the course.'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Check if course has enrollments
    if (course.totalEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course'
    });
  }
};

// Publish/Unpublish course
const toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course'
      });
    }

    // Validate course before publishing
    if (!course.isPublished && course.sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish course without content sections'
      });
    }

    if (course.isPublished) {
      course.unpublish();
    } else {
      course.publish();
    }

    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      data: course
    });
  } catch (error) {
    console.error('Error toggling course status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course status'
    });
  }
};

// Get course analytics
const getCourseAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this course'
      });
    }

    // Get enrollment data with timestamps
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({ course: id })
      .populate('student', 'name email')
      .sort({ enrolledAt: 1 });

    // Calculate enrollment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollmentTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = enrollments.filter(e => {
        const enrollDate = new Date(e.enrolledAt);
        return enrollDate >= date && enrollDate < nextDate;
      }).length;
      
      enrollmentTrends.push({
        date: date.toISOString().split('T')[0],
        enrollments: count
      });
    }

    // Calculate revenue data
    const Payment = require('../models/Payment');
    const payments = await Payment.find({ 
      course: id,
      status: 'completed'
    }).sort({ createdAt: 1 });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Revenue trends (last 30 days)
    const revenueTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dailyRevenue = payments
        .filter(p => {
          const paymentDate = new Date(p.createdAt);
          return paymentDate >= date && paymentDate < nextDate;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      revenueTrends.push({
        date: date.toISOString().split('T')[0],
        revenue: dailyRevenue
      });
    }

    // Calculate student engagement metrics
    const totalStudents = enrollments.length;
    const activeStudents = enrollments.filter(e => e.progress > 0).length;
    const completedStudents = enrollments.filter(e => e.completed).length;
    
    const averageProgress = totalStudents > 0
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalStudents
      : 0;

    // Get reviews data
    const Review = require('../models/Review');
    const reviews = await Review.find({ course: id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    // Course completion rate by section
    const sectionEngagement = course.sections.map(section => {
      const sectionCompletions = enrollments.filter(e => {
        // Check if any lecture in this section is in completedLectures
        return section.lectures.some(lecture => 
          e.completedLectures?.includes(lecture._id.toString())
        );
      }).length;

      return {
        sectionTitle: section.title,
        completionRate: totalStudents > 0 
          ? (sectionCompletions / totalStudents) * 100 
          : 0
      };
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalEnrollments: totalStudents,
          activeStudents,
          completedStudents,
          completionRate: totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0,
          averageProgress: averageProgress.toFixed(1),
          totalRevenue,
          averageRating: course.averageRating || 0,
          totalReviews: reviews.length
        },
        enrollmentTrends,
        revenueTrends,
        ratingDistribution,
        sectionEngagement,
        recentReviews: reviews.slice(0, 5).map(r => ({
          id: r._id,
          rating: r.rating,
          comment: r.comment,
          userName: r.user?.name || 'Anonymous',
          createdAt: r.createdAt
        })),
        topPerformingLectures: course.sections.flatMap(section =>
          section.lectures.map(lecture => {
            const completions = enrollments.filter(e =>
              e.completedLectures?.includes(lecture._id.toString())
            ).length;
            return {
              title: lecture.title,
              section: section.title,
              completionRate: totalStudents > 0 ? (completions / totalStudents) * 100 : 0
            };
          })
        ).sort((a, b) => b.completionRate - a.completionRate).slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course analytics',
      error: error.message
    });
  }
};

module.exports = {
  // Public endpoints
  getCourses,
  getCoursesByCategory,
  getFeaturedCourses,
  getPopularTags,
  getCourseById,
  getCategories,
  
  // Instructor endpoints
  getInstructorCourses,
  getCourseStats,
  createCourse,
  getInstructorCourse,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  toggleCourseStatus,
  getCourseAnalytics
};

// Get popular courses with advanced algorithm
const getPopularCoursesController = async (req, res) => {
  try {
    console.log('🔥 GET POPULAR COURSES');
    const { limit = 12 } = req.query;

    const courses = await getPopularCourses(parseInt(limit));

    console.log(`   ✅ Returning ${courses.length} popular courses`);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('❌ Error fetching popular courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trending courses
const getTrendingCoursesController = async (req, res) => {
  try {
    console.log('📈 GET TRENDING COURSES');
    const { limit = 12 } = req.query;

    const courses = await getTrendingCourses(parseInt(limit));

    console.log(`   ✅ Returning ${courses.length} trending courses`);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('❌ Error fetching trending courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get smart recommendations mixing multiple algorithms
const getSmartRecommendationsController = async (req, res) => {
  try {
    console.log('🧠 GET SMART RECOMMENDATIONS');
    console.log('   User ID:', req.user?.id);

    const limit = parseInt(req.query.limit) || 24;
    
    // Get full user with interests and enrollment history
    const user = await User.findById(req.user.id)
      .select('interests enrolledCourses')
      .populate('enrolledCourses.course', 'category level');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const recommendations = await getSmartRecommendations(user, limit);

    console.log('   ✅ Returning', recommendations.courses.length, 'smart recommendations');
    console.log('   Breakdown:', recommendations.breakdown);

    res.json({
      success: true,
      data: {
        courses: recommendations.courses,
        breakdown: recommendations.breakdown,
        hasInterests: user.interests?.hasCompletedInterests || false,
        interestCategories: user.interests?.categories || []
      }
    });

  } catch (error) {
    console.error('❌ Error getting smart recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching smart recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get personalized courses for user (requires authentication)
const getPersonalizedCoursesForUser = async (req, res) => {
  try {
    console.log('🎯 GET PERSONALIZED COURSES');
    console.log('   User ID:', req.user?.id);

    const limit = parseInt(req.query.limit) || 12;
    
    // Get full user with interests
    const user = await User.findById(req.user.id).select('interests');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const courses = await getPersonalizedCourses(user, limit);

    console.log('   ✅ Returning', courses.length, 'personalized courses');

    res.json({
      success: true,
      data: {
        courses,
        hasInterests: user.interests?.hasCompletedInterests || false,
        interestCategories: user.interests?.categories || []
      }
    });

  } catch (error) {
    console.error('❌ Error getting personalized courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personalized courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get student performance for instructor's courses
const getStudentPerformance = async (req, res) => {
  try {
    console.log('📊 GET STUDENT PERFORMANCE');
    console.log('   Instructor ID:', req.user?.id);

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const Enrollment = require('../models/Enrollment');
    
    // Get instructor's published courses
    const instructorCourses = await Course.find({
      instructor: req.user.id,
      isPublished: true
    }).select('_id title');

    if (instructorCourses.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const courseIds = instructorCourses.map(course => course._id);
    
    // Get enrollment data for instructor's courses
    const enrollmentData = await Enrollment.aggregate([
      {
        $match: {
          course: { $in: courseIds }
        }
      },
      {
        $group: {
          _id: '$course',
          totalStudents: { $sum: 1 },
          completedStudents: {
            $sum: {
              $cond: [{ $gte: ['$progress.percentage', 100] }, 1, 0]
            }
          },
          activeStudents: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $gt: ['$progress.percentage', 0] },
                    { $lt: ['$progress.percentage', 100] }
                  ]
                }, 1, 0
              ]
            }
          },
          strugglingStudents: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$enrolledAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, // Enrolled more than 30 days ago
                    { $lt: ['$progress.percentage', 25] } // Less than 25% progress
                  ]
                }, 1, 0
              ]
            }
          },
          averageProgress: { $avg: '$progress.percentage' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseName: '$course.title',
          courseId: '$_id',
          totalStudents: 1,
          completedStudents: 1,
          activeStudents: 1,
          strugglingStudents: 1,
          averageProgress: { $round: ['$averageProgress', 1] },
          completionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$completedStudents', '$totalStudents'] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      {
        $sort: { totalStudents: -1 }
      }
    ]);

    console.log('   ✅ Found performance data for', enrollmentData.length, 'courses');

    res.json({
      success: true,
      data: enrollmentData
    });

  } catch (error) {
    console.error('❌ Error fetching student performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student performance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  // Public endpoints
  getCourses,
  getCoursesByCategory,
  getFeaturedCourses: getFeaturedCoursesController,
  getPopularCourses: getPopularCoursesController,
  getTrendingCourses: getTrendingCoursesController,
  getPopularTags,
  getCourseById,
  getCategories,
  getPersonalizedCoursesForUser,
  getSmartRecommendations: getSmartRecommendationsController,
  
  // Instructor endpoints
  getInstructorCourses,
  getCourseStats,
  createCourse,
  getInstructorCourse,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  toggleCourseStatus,
  getCourseAnalytics,
  getStudentPerformance
};