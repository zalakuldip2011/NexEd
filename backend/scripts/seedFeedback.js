const mongoose = require('mongoose');
require('dotenv').config();

const Feedback = require('../models/Feedback');
const connectDB = require('../config/db');

// Sample feedback data to seed the database
const sampleFeedback = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    rating: 5,
    title: 'Amazing Learning Experience!',
    message: 'NexEd has completely transformed my career. The courses are top-notch and the instructors are industry experts! I learned so much in just a few months.',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    rating: 5,
    title: 'Best Online Learning Platform',
    message: 'Best online learning platform I\'ve used. The course quality and platform experience are unmatched. Highly recommend to anyone looking to upskill.',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    rating: 5,
    title: 'Fantastic Design Courses',
    message: 'The design courses here are fantastic! I\'ve learned so much and I\'m already applying it in my work. The instructors provide great feedback too.',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    rating: 5,
    title: 'Incredible Value for Money',
    message: 'Incredible value for money. The instructors are responsive and the community is supportive. I\'ve completed 3 courses and loved every minute.',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: false
  },
  {
    name: 'Lisa Wang',
    email: 'lisa.wang@example.com',
    rating: 4,
    title: 'Great Platform, Room for Improvement',
    message: 'Really enjoying the courses so far. The content is well-structured and easy to follow. Would love to see more interactive elements added.',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: false
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    rating: 5,
    title: 'Excellent Course Quality',
    message: 'The MERN stack course is phenomenal. Clear explanations, real-world projects, and excellent support from instructors. Worth every penny!',
    type: 'course_quality',
    status: 'approved',
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Jennifer Lopez',
    email: 'jennifer.lopez@example.com',
    rating: 4,
    title: 'Very Good Overall Experience',
    message: 'Great learning experience overall. The platform is easy to navigate and the course materials are comprehensive. Looking forward to more courses.',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: false
  },
  {
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    rating: 5,
    title: 'Outstanding Support Team',
    message: 'Not only are the courses great, but the support team is incredibly helpful. They respond quickly and solve any issues I have.',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: false
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    rating: 4,
    title: 'Love the User Interface',
    message: 'The platform has a beautiful and intuitive design. It\'s easy to find courses and track my progress. Really enjoying my learning journey here.',
    type: 'platform_feature',
    status: 'approved',
    isPublic: true,
    isFeatured: false
  },
  {
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    rating: 5,
    title: 'Career Game Changer',
    message: 'NexEd helped me transition from marketing to web development. The courses are practical and industry-relevant. I got a job within 2 months of completing the program!',
    type: 'website_experience',
    status: 'approved',
    isPublic: true,
    isFeatured: true
  }
];

const seedFeedback = async () => {
  try {
    console.log('🌱 Starting feedback seeding process...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing feedback
    await Feedback.deleteMany({});
    console.log('🗑️  Cleared existing feedback');
    
    // Create feedback entries
    const createdFeedback = await Feedback.insertMany(sampleFeedback);
    console.log(`✅ Created ${createdFeedback.length} feedback entries`);
    
    // Show stats
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    
    console.log('\n📊 Feedback Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} entries (avg rating: ${stat.avgRating.toFixed(1)})`);
    });
    
    const featuredCount = await Feedback.countDocuments({ isFeatured: true });
    console.log(`   Featured: ${featuredCount} entries`);
    
    console.log('\n✨ Feedback seeding completed successfully!');
    console.log('💡 You can now see real reviews on your homepage');
    
  } catch (error) {
    console.error('❌ Error seeding feedback:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedFeedback();
}

module.exports = { seedFeedback, sampleFeedback };