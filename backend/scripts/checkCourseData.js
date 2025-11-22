/**
 * Check specific course data for debugging
 */

const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

const checkCourse = async () => {
  try {
    const courseId = process.argv[2] || '691759296d8cdb167cfcb2bf';
    
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log(`📋 Fetching course: ${courseId}`);
    const course = await Course.findById(courseId);

    if (!course) {
      console.error('❌ Course not found!');
      process.exit(1);
    }

    console.log('\n📚 Course Details:');
    console.log('='.repeat(70));
    console.log('Title:', course.title);
    console.log('ID:', course._id);
    console.log('Price:', course.price);
    console.log('Status:', course.status);
    console.log('Instructor ID:', course.instructor);
    console.log('Instructor Type:', typeof course.instructor);
    console.log('Instructor exists:', course.instructor ? 'YES' : 'NO');
    console.log('\n📊 Full Course Object:');
    console.log(JSON.stringify(course.toObject(), null, 2));

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

checkCourse();
