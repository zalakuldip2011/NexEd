const Course = require('../models/Course');
const User = require('../models/User');

/**
 * Calculate course popularity score based on multiple factors
 * @param {Object} course - Course object
 * @returns {Number} - Popularity score
 */
const calculatePopularityScore = (course) => {
  let score = 0;
  
  // Enrollment count (40% weight) - more generous for new courses
  const enrollments = course.totalEnrollments || 0;
  const enrollmentScore = enrollments > 0 ? Math.min(enrollments / 50, 50) * 0.4 : 5; // Base 5 points for new courses
  score += enrollmentScore;
  
  // Rating (30% weight) - handle zero ratings gracefully
  const rating = course.averageRating || 0;
  const ratingScore = rating > 0 ? rating * 6 * 0.3 : 10; // Base 10 points for unrated courses
  score += ratingScore;
  
  // Review count (15% weight) - base score for new courses
  const reviews = course.totalReviews || 0;
  const reviewScore = reviews > 0 ? Math.min(reviews / 5, 20) * 0.15 : 3; // Base 3 points for new courses
  score += reviewScore;
  
  // Recency boost (10% weight) - favor newer courses
  const daysSinceCreation = (Date.now() - new Date(course.createdAt)) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, (90 - daysSinceCreation) / 90) * 15 * 0.1; // Increased for new platforms
  score += recencyScore;
  
  // Content quality boost (5% weight) - reward substantial courses
  const contentScore = course.totalDuration >= 3600 ? 5 : course.totalDuration >= 1800 ? 3 : 1;
  score += contentScore * 0.05;
  
  // Manual feature boost
  if (course.featured) score += 20;
  
  return Math.round(score * 100) / 100;
};

/**
 * Get featured courses with intelligent selection
 * @param {Number} limit - Number of courses to return
 * @returns {Array} - Array of featured courses
 */
const getFeaturedCourses = async (limit = 12) => {
  try {
    console.log('⭐ Getting featured courses with intelligent selection');
    
    // Get all available courses (flexible for platforms with incomplete metadata)
    const courses = await Course.find({
      $or: [
        { isPublished: true, status: 'published' }, // Properly published courses
        { isPublished: true, status: { $exists: false } }, // Published but no status field
        { isPublished: { $exists: false }, status: 'published' }, // Status set but no isPublished
        { isPublished: { $exists: false }, status: { $exists: false }, title: { $exists: true } }, // Basic courses with just title
        { featured: true } // Manually featured courses
      ]
    })
    .populate('instructor', 'username email profile')
    .lean();
    
    // Calculate feature scores for each course
    const scoredCourses = courses.map(course => {
      let featureScore = 0;
      
      // Manually featured courses get highest priority
      if (course.featured) featureScore += 100;
      
      // High rating courses (handle zero ratings gracefully)
      if (course.averageRating >= 4.8) featureScore += 50;
      else if (course.averageRating >= 4.5) featureScore += 30;
      else if (course.averageRating >= 4.2) featureScore += 15;
      else if (course.averageRating === 0) featureScore += 20; // Give new courses a chance
      
      // Popular courses (more lenient thresholds)
      if (course.totalEnrollments >= 100) featureScore += 40;
      else if (course.totalEnrollments >= 50) featureScore += 25;
      else if (course.totalEnrollments >= 10) featureScore += 15;
      else if (course.totalEnrollments === 0) featureScore += 10; // New courses get base score
      
      // Well-reviewed courses (lower thresholds)
      if (course.totalReviews >= 20) featureScore += 20;
      else if (course.totalReviews >= 5) featureScore += 10;
      else if (course.totalReviews === 0) featureScore += 5; // New courses get base score
      
      // Recent quality courses
      const daysSinceCreation = (Date.now() - new Date(course.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 30 && course.averageRating >= 4.5) featureScore += 25;
      
      // Course completeness score
      if (course.sections && course.sections.length >= 5) featureScore += 10;
      if (course.totalDuration >= 3600) featureScore += 5; // 1+ hours
      
      return { ...course, featureScore };
    });
    
    // Sort by feature score and diversify by category
    scoredCourses.sort((a, b) => b.featureScore - a.featureScore);
    
    // Diversify selection to include different categories
    const selectedCourses = [];
    const usedCategories = new Set();
    const maxPerCategory = Math.ceil(limit / 5); // Max 20% from same category
    
    // First pass: select top courses ensuring category diversity
    for (const course of scoredCourses) {
      if (selectedCourses.length >= limit) break;
      
      const categoryCount = selectedCourses.filter(c => c.category === course.category).length;
      if (categoryCount < maxPerCategory) {
        selectedCourses.push(course);
        usedCategories.add(course.category);
      }
    }
    
    // Second pass: fill remaining slots with best available
    for (const course of scoredCourses) {
      if (selectedCourses.length >= limit) break;
      if (!selectedCourses.find(c => c._id.toString() === course._id.toString())) {
        selectedCourses.push(course);
      }
    }
    
    console.log(`   ✅ Selected ${selectedCourses.length} featured courses from ${usedCategories.size} categories`);
    
    return selectedCourses.slice(0, limit).map(({ featureScore, ...course }) => course);
    
  } catch (error) {
    console.error('❌ Error getting featured courses:', error);
    throw error;
  }
};

/**
 * Get popular courses with advanced popularity algorithm
 * @param {Number} limit - Number of courses to return
 * @returns {Array} - Array of popular courses
 */
const getPopularCourses = async (limit = 12) => {
  try {
    console.log('🔥 Getting popular courses with advanced algorithm');
    
    const courses = await Course.find({
      $or: [
        { isPublished: true, status: 'published' }, // Properly published courses
        { isPublished: true }, // Just published flag
        { status: 'published' }, // Just status field
        { title: { $exists: true } } // Any course with a title (fallback for incomplete metadata)
      ]
    })
    .populate('instructor', 'username email profile')
    .lean();
    
    // Calculate popularity scores
    const scoredCourses = courses.map(course => ({
      ...course,
      popularityScore: calculatePopularityScore(course)
    }));
    
    // Sort by popularity score
    scoredCourses.sort((a, b) => b.popularityScore - a.popularityScore);
    
    console.log(`   ✅ Calculated popularity scores for ${scoredCourses.length} courses`);
    
    return scoredCourses.slice(0, limit).map(({ popularityScore, ...course }) => course);
    
  } catch (error) {
    console.error('❌ Error getting popular courses:', error);
    throw error;
  }
};

/**
 * Get trending courses (courses gaining popularity recently)
 * @param {Number} limit - Number of courses to return
 * @returns {Array} - Array of trending courses
 */
const getTrendingCourses = async (limit = 12) => {
  try {
    console.log('📈 Getting trending courses');
    
    // Get courses created or updated in the last 90 days (more inclusive)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const courses = await Course.find({
      $and: [
        {
          $or: [
            { isPublished: true }, // Published courses
            { status: 'published' }, // Status published
            { title: { $exists: true } } // Any course (fallback)
          ]
        },
        {
          $or: [
            { createdAt: { $gte: ninetyDaysAgo } },
            { updatedAt: { $gte: ninetyDaysAgo } },
            { totalEnrollments: 0 }, // Include all new courses
            { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } // Include courses from last year
          ]
        }
      ]
    })
    .populate('instructor', 'username email profile')
    .lean();
    
    // Calculate trending scores
    const scoredCourses = courses.map(course => {
      let trendingScore = 0;
      
      // Recency factor
      const daysSinceCreation = (Date.now() - new Date(course.createdAt)) / (1000 * 60 * 60 * 24);
      const recencyMultiplier = Math.max(0.1, (60 - daysSinceCreation) / 60);
      
      // Base popularity adjusted by recency
      const basePopularity = calculatePopularityScore(course);
      trendingScore = basePopularity * recencyMultiplier;
      
      // Boost for rapid enrollment growth
      const enrollmentVelocity = (course.totalEnrollments || 0) / Math.max(1, daysSinceCreation);
      trendingScore += enrollmentVelocity * 10;
      
      // Boost for high rating on new courses
      if (daysSinceCreation <= 30 && course.averageRating >= 4.5) {
        trendingScore += 20;
      }
      
      return { ...course, trendingScore };
    });
    
    // Sort by trending score
    scoredCourses.sort((a, b) => b.trendingScore - a.trendingScore);
    
    console.log(`   ✅ Identified ${scoredCourses.length} trending courses`);
    
    return scoredCourses.slice(0, limit).map(({ trendingScore, ...course }) => course);
    
  } catch (error) {
    console.error('❌ Error getting trending courses:', error);
    throw error;
  }
};

/**
 * Get personalized course recommendations based on user interests
 * @param {Object} user - User object with interests
 * @param {Number} limit - Number of courses to return
 * @returns {Array} - Array of recommended courses
 */
const getPersonalizedCourses = async (user, limit = 12) => {
  try {
    console.log('🎯 Getting personalized courses for user:', user.id);
    console.log('   User interests:', user.interests);

    // If user hasn't set interests, return intelligently selected popular courses
    if (!user.interests || !user.interests.hasCompletedInterests || !user.interests.categories || user.interests.categories.length === 0) {
      console.log('   No interests set, returning curated popular courses');
      console.log('   No interests set, returning curated popular courses');
      // Fallback to simple course list if popular algorithm fails
      try {
        return await getPopularCourses(limit);
      } catch (error) {
        console.log('   Popular courses failed, falling back to basic course list');
        return await Course.find({ title: { $exists: true } })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('instructor', 'username email profile')
          .lean();
      }
    }

    const { categories, skillLevel } = user.interests;

    // Build query to match courses (flexible for incomplete metadata)
    const query = {
      $or: [
        { isPublished: true, status: 'published' }, // Properly published
        { isPublished: true }, // Just published flag
        { status: 'published' }, // Just status field  
        { title: { $exists: true } } // Any course with title (fallback)
      ]
    };

    // Match categories (case-insensitive, flexible matching)
    if (categories && categories.length > 0) {
      // Create regex patterns for flexible matching
      const categoryPatterns = categories.map(cat => new RegExp(cat, 'i'));
      
      query.$or = [
        { category: { $in: categoryPatterns } },
        { subcategory: { $in: categoryPatterns } },
        { tags: { $in: categoryPatterns } }
      ];
    }

    // Match skill level if specified
    const levelMapping = {
      'beginner': ['Beginner', 'All Levels', 'Introductory'],
      'intermediate': ['Intermediate', 'All Levels', 'Beginner', 'Advanced'],
      'advanced': ['Advanced', 'Intermediate', 'All Levels', 'Expert'],
      'expert': ['Expert', 'Advanced', 'All Levels']
    };

    if (skillLevel && levelMapping[skillLevel]) {
      query.level = { $in: levelMapping[skillLevel] };
    }

    console.log('   Query:', JSON.stringify(query, null, 2));

    // Get courses matching interests
    let courses = await Course.find(query)
      .sort({ 
        rating: -1, 
        enrollmentCount: -1,
        createdAt: -1 
      })
      .limit(limit * 2) // Get more to filter and sort
      .populate('instructor', 'username email profile')
      .lean();

    console.log('   Found', courses.length, 'matching courses');

    // If not enough courses found, supplement with popular courses
    if (courses.length < limit) {
      const remainingLimit = limit - courses.length;
      const courseIds = courses.map(c => c._id);
      
      const additionalCourses = await Course.find({
        $or: [
          { isPublished: true, status: 'published' },
          { isPublished: true },
          { title: { $exists: true } }
        ],
        _id: { $nin: courseIds }
      })
        .sort({ enrollmentCount: -1, rating: -1 })
        .limit(remainingLimit)
        .populate('instructor', 'username email profile')
        .lean();

      courses = [...courses, ...additionalCourses];
      console.log('   Added', additionalCourses.length, 'popular courses');
    }

    // Calculate advanced relevance score for each course
    courses = courses.map(course => {
      let relevanceScore = 0;

      // Category match with weighted scoring (40% weight)
      if (categories && categories.length > 0) {
        let categoryMatchScore = 0;
        
        categories.forEach(userCategory => {
          const userCatLower = userCategory.toLowerCase();
          
          // Exact category match (highest score)
          if (course.category && course.category.toLowerCase() === userCatLower) {
            categoryMatchScore += 100;
          }
          // Partial category match
          else if (course.category && course.category.toLowerCase().includes(userCatLower)) {
            categoryMatchScore += 70;
          }
          // Subcategory match
          else if (course.subcategory && course.subcategory.toLowerCase().includes(userCatLower)) {
            categoryMatchScore += 50;
          }
          // Tags match
          else if (course.tags && course.tags.some(tag => tag.toLowerCase().includes(userCatLower))) {
            categoryMatchScore += 30;
          }
          // Fuzzy match in title or description
          else if (course.title && course.title.toLowerCase().includes(userCatLower)) {
            categoryMatchScore += 20;
          }
          else if (course.description && course.description.toLowerCase().includes(userCatLower)) {
            categoryMatchScore += 10;
          }
        });
        
        relevanceScore += (categoryMatchScore / categories.length) * 0.4;
      }

      // Skill level match with smooth progression (20% weight)
      if (skillLevel && course.level) {
        const levelMapping = {
          'beginner': 0, 'intermediate': 1, 'advanced': 2, 'expert': 3,
          'all levels': 0.5 // Special case for all levels
        };
        
        const userLevelIndex = levelMapping[skillLevel.toLowerCase()] || 0;
        const courseLevelIndex = levelMapping[course.level.toLowerCase()] || 0;
        
        if (course.level.toLowerCase() === 'all levels') {
          relevanceScore += 60 * 0.2; // All levels courses are always somewhat relevant
        } else {
          const levelDifference = Math.abs(courseLevelIndex - userLevelIndex);
          const levelScore = Math.max(0, 80 - (levelDifference * 25));
          relevanceScore += levelScore * 0.2;
        }
      }

      // Quality and popularity (25% weight)
      const popularityScore = calculatePopularityScore(course);
      relevanceScore += popularityScore * 0.25;

      // User behavior patterns (10% weight)
      // TODO: Implement based on user's course history
      
      // Instructor quality (5% weight)
      if (course.instructor && course.instructor.profile) {
        const instructorRating = course.instructor.profile.rating || 0;
        relevanceScore += (instructorRating / 5) * 20 * 0.05;
      }

      return {
        ...course,
        relevanceScore: Math.round(relevanceScore * 100) / 100
      };
    });

    // Sort by relevance score
    courses.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Remove relevance score from final results and limit
    courses = courses.slice(0, limit).map(({ relevanceScore, ...course }) => course);

    console.log('   Returning', courses.length, 'personalized courses');

    return courses;

  } catch (error) {
    console.error('❌ Error getting personalized courses:', error);
    throw error;
  }
};

/**
 * Get recommended courses for a category
 * @param {String} category - Category name
 * @param {Number} limit - Number of courses to return
 * @returns {Array} - Array of courses
 */
const getCoursesByCategory = async (category, limit = 12) => {
  try {
    const categoryRegex = new RegExp(category, 'i');
    
    const courses = await Course.find({
      isPublished: true,
      status: 'published',
      $or: [
        { category: categoryRegex },
        { subcategory: categoryRegex },
        { tags: categoryRegex }
      ]
    })
      .sort({ rating: -1, enrollmentCount: -1 })
      .limit(limit)
      .populate('instructor', 'username email profile')
      .lean();

    return courses;
  } catch (error) {
    console.error('Error getting courses by category:', error);
    throw error;
  }
};

/**
 * Get courses based on user's learning path and progress
 * @param {String} userId - User ID
 * @param {Number} limit - Number of courses to return
 * @returns {Array} - Array of recommended next courses
 */
const getRecommendedNextCourses = async (userId, limit = 6) => {
  try {
    console.log('🎯 Getting recommended next courses for user:', userId);
    
    // Get user's completed and current courses
    const user = await User.findById(userId)
      .populate('enrolledCourses.course')
      .lean();
    
    if (!user || !user.enrolledCourses) {
      return [];
    }
    
    const completedCourses = user.enrolledCourses
      .filter(enrollment => enrollment.progress >= 80)
      .map(enrollment => enrollment.course);
    
    const currentCourses = user.enrolledCourses
      .filter(enrollment => enrollment.progress > 0 && enrollment.progress < 80)
      .map(enrollment => enrollment.course);
    
    // Extract categories and levels from completed courses
    const learnedCategories = [...new Set(completedCourses.map(c => c.category))];
    const completedLevels = completedCourses.map(c => c.level);
    
    // Determine suggested next level
    const levelProgression = { 'Beginner': 'Intermediate', 'Intermediate': 'Advanced', 'Advanced': 'Expert' };
    const suggestedLevels = [...new Set(completedLevels.map(level => levelProgression[level] || level))];
    
    // Find courses that are natural progressions
    const enrolledCourseIds = user.enrolledCourses.map(e => e.course._id.toString());
    
    const nextCourses = await Course.find({
      isPublished: true,
      status: 'published',
      _id: { $nin: enrolledCourseIds },
      $or: [
        { category: { $in: learnedCategories }, level: { $in: suggestedLevels } },
        { category: { $in: learnedCategories } },
        { tags: { $in: learnedCategories.map(cat => cat.toLowerCase()) } }
      ]
    })
    .populate('instructor', 'username email profile')
    .limit(limit * 2)
    .lean();
    
    // Score based on learning path relevance
    const scoredCourses = nextCourses.map(course => {
      let pathScore = 0;
      
      // Same category, next level (highest priority)
      if (learnedCategories.includes(course.category) && suggestedLevels.includes(course.level)) {
        pathScore += 100;
      }
      // Same category, any level
      else if (learnedCategories.includes(course.category)) {
        pathScore += 60;
      }
      // Related tags
      else if (course.tags && course.tags.some(tag => learnedCategories.some(cat => cat.toLowerCase().includes(tag.toLowerCase())))) {
        pathScore += 40;
      }
      
      // Add quality score
      pathScore += calculatePopularityScore(course) * 0.3;
      
      return { ...course, pathScore };
    });
    
    scoredCourses.sort((a, b) => b.pathScore - a.pathScore);
    
    console.log(`   ✅ Found ${scoredCourses.length} recommended next courses`);
    
    return scoredCourses.slice(0, limit).map(({ pathScore, ...course }) => course);
    
  } catch (error) {
    console.error('❌ Error getting recommended next courses:', error);
    return [];
  }
};

/**
 * Get smart course recommendations mixing multiple algorithms
 * @param {Object} user - User object
 * @param {Number} limit - Number of courses to return
 * @returns {Object} - Object with different recommendation types
 */
const getSmartRecommendations = async (user, limit = 24) => {
  try {
    console.log('🧠 Getting smart recommendations for user:', user.id);
    
    const [personalized, featured, popular, trending, nextCourses] = await Promise.all([
      getPersonalizedCourses(user, Math.ceil(limit * 0.4)), // 40% personalized
      getFeaturedCourses(Math.ceil(limit * 0.25)),          // 25% featured
      getPopularCourses(Math.ceil(limit * 0.2)),           // 20% popular
      getTrendingCourses(Math.ceil(limit * 0.1)),          // 10% trending
      getRecommendedNextCourses(user.id, Math.ceil(limit * 0.05)) // 5% learning path
    ]);
    
    // Combine and deduplicate
    const allCourses = [...personalized, ...featured, ...popular, ...trending, ...nextCourses];
    const uniqueCourses = allCourses.filter((course, index, self) => 
      index === self.findIndex(c => c._id.toString() === course._id.toString())
    );
    
    // Shuffle and limit
    const shuffled = uniqueCourses.sort(() => Math.random() - 0.5);
    
    console.log(`   ✅ Generated ${uniqueCourses.length} smart recommendations`);
    
    return {
      courses: shuffled.slice(0, limit),
      breakdown: {
        personalized: personalized.length,
        featured: featured.length,
        popular: popular.length,
        trending: trending.length,
        nextCourses: nextCourses.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error getting smart recommendations:', error);
    throw error;
  }
};

module.exports = {
  getPersonalizedCourses,
  getFeaturedCourses,
  getPopularCourses,
  getTrendingCourses,
  getCoursesByCategory,
  getRecommendedNextCourses,
  getSmartRecommendations,
  calculatePopularityScore
};
