const cron = require('node-cron');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const emailService = require('../utils/emailService');

/**
 * Process scheduled account deletions
 * Runs daily at 2 AM
 */
const processAccountDeletions = async () => {
  try {
    console.log('🗑️  Starting account deletion job...');
    
    // Find all users with scheduled deletions that are past due
    const usersToDelete = await User.find({
      'accountDeletion.isScheduled': true,
      'accountDeletion.scheduledFor': { $lte: new Date() }
    });

    if (usersToDelete.length === 0) {
      console.log('✅ No accounts scheduled for deletion');
      return;
    }

    console.log(`📋 Found ${usersToDelete.length} account(s) to delete`);

    for (const user of usersToDelete) {
      try {
        console.log(`🔄 Processing deletion for user: ${user.email} (${user.username})`);
        
        // Check if user is an instructor
        if (user.role === 'instructor') {
          await handleInstructorDeletion(user);
        } else {
          await handleStudentDeletion(user);
        }

        // Send final confirmation email
        try {
          await emailService.sendAccountDeletedEmail(user.email, user.username);
        } catch (emailError) {
          console.error('Failed to send deletion confirmation email:', emailError);
        }

        // Finally, delete the user
        await User.findByIdAndDelete(user._id);
        
        console.log(`✅ Successfully deleted account: ${user.email}`);
        
      } catch (error) {
        console.error(`❌ Failed to delete account ${user.email}:`, error);
      }
    }

    console.log('✅ Account deletion job completed');

  } catch (error) {
    console.error('❌ Account deletion job failed:', error);
  }
};

/**
 * Handle deletion for instructor accounts
 */
const handleInstructorDeletion = async (user) => {
  console.log(`👨‍🏫 Processing instructor account deletion...`);
  
  // Find all courses by this instructor
  const courses = await Course.find({ instructor: user._id });
  
  if (courses.length > 0) {
    console.log(`📚 Found ${courses.length} course(s) by instructor`);
    
    // Create or find generic instructor account
    let genericInstructor = await User.findOne({ 
      email: 'generic.instructor@edemy.com' 
    });
    
    if (!genericInstructor) {
      console.log('📝 Creating generic instructor account...');
      genericInstructor = await User.create({
        username: 'edemy_instructor',
        email: 'generic.instructor@edemy.com',
        password: require('crypto').randomBytes(32).toString('hex'), // Random password
        role: 'instructor',
        verification: {
          isEmailVerified: true
        },
        profile: {
          firstName: 'Edemy',
          lastName: 'Instructor'
        },
        instructorProfile: {
          bio: 'This is a generic Edemy instructor account for maintaining courses after original instructor account closure.',
          isApproved: true,
          approvedAt: new Date()
        }
      });
    }
    
    for (const course of courses) {
      const enrollmentCount = await Enrollment.countDocuments({ 
        course: course._id,
        status: 'active'
      });
      
      if (enrollmentCount > 0) {
        // Transfer course to generic instructor
        console.log(`↔️  Transferring course "${course.title}" with ${enrollmentCount} enrollment(s)`);
        course.instructor = genericInstructor._id;
        course.isPublished = false; // Unpublish to prevent new enrollments
        await course.save();
      } else {
        // Delete course if no enrollments
        console.log(`🗑️  Deleting course "${course.title}" (no enrollments)`);
        await Course.findByIdAndDelete(course._id);
        
        // Delete associated reviews
        await Review.deleteMany({ course: course._id });
      }
    }
  }
  
  // Delete instructor's reviews
  await Review.deleteMany({ user: user._id });
  
  // Delete instructor enrollments (if any)
  await Enrollment.deleteMany({ user: user._id });
  
  // Note: Keep payment records for accounting purposes
  // Just remove user reference
  await Payment.updateMany(
    { user: user._id },
    { $unset: { user: 1 } }
  );
};

/**
 * Handle deletion for student accounts
 */
const handleStudentDeletion = async (user) => {
  console.log(`🎓 Processing student account deletion...`);
  
  // Delete all enrollments
  const enrollments = await Enrollment.find({ user: user._id });
  console.log(`📚 Deleting ${enrollments.length} enrollment(s)`);
  
  for (const enrollment of enrollments) {
    // Update course enrollment count
    await Course.findByIdAndUpdate(
      enrollment.course,
      { $inc: { enrollmentCount: -1 } }
    );
  }
  
  await Enrollment.deleteMany({ user: user._id });
  
  // Delete all reviews
  const reviews = await Review.find({ user: user._id });
  console.log(`⭐ Deleting ${reviews.length} review(s)`);
  
  for (const review of reviews) {
    // Recalculate course ratings after review deletion
    await Course.findByIdAndUpdate(
      review.course,
      { $pull: { reviews: review._id } }
    );
  }
  
  await Review.deleteMany({ user: user._id });
  
  // Note: Keep payment records for accounting purposes
  // Just remove user reference
  await Payment.updateMany(
    { user: user._id },
    { $unset: { user: 1 } }
  );
};

/**
 * Initialize the cron job
 * Runs every day at 2:00 AM
 */
const initAccountDeletionJob = () => {
  // Run at 2:00 AM every day
  cron.schedule('0 2 * * *', processAccountDeletions, {
    timezone: "UTC"
  });
  
  console.log('⏰ Account deletion cron job initialized (runs daily at 2:00 AM UTC)');
};

/**
 * Run the job immediately (for testing)
 */
const runNow = async () => {
  console.log('🚀 Running account deletion job immediately...');
  await processAccountDeletions();
};

module.exports = {
  initAccountDeletionJob,
  processAccountDeletions,
  runNow
};
