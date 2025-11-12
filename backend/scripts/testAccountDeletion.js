/**
 * Test Script for Account Deletion Cron Job
 * 
 * This script allows you to manually test the account deletion process
 * without waiting for the scheduled cron job.
 * 
 * Usage:
 * node backend/scripts/testAccountDeletion.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { runNow } = require('../jobs/accountDeletion');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Main test function
const testAccountDeletion = async () => {
  console.log('\n🧪 Starting Account Deletion Test...\n');
  console.log('='.repeat(50));
  
  try {
    // Connect to database
    await connectDB();
    
    // Run the deletion job
    await runNow();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);
  }
};

// Run the test
testAccountDeletion();
