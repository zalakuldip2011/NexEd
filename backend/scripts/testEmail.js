require('dotenv').config();
const emailService = require('../utils/emailService');

async function testEmail() {
  console.log('\n🧪 Testing Email Configuration...\n');
  
  console.log('Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***hidden***' : 'NOT SET');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('\n');

  // Test connection
  console.log('Testing SMTP connection...');
  const connectionSuccess = await emailService.testConnection();
  
  if (!connectionSuccess) {
    console.error('\n❌ SMTP Connection Failed!');
    console.log('\nPossible Issues:');
    console.log('1. Invalid Gmail credentials');
    console.log('2. App Password not enabled (need 2FA + App Password)');
    console.log('3. "Less secure app access" disabled (if not using App Password)');
    console.log('4. Network/firewall blocking port 587');
    return;
  }

  console.log('✅ SMTP Connection Successful!\n');

  // Test sending email
  const testEmail = process.env.EMAIL_USER1; // Send to yourself for testing
  
  console.log(`Sending test email to: ${testEmail}...`);
  
  try {
    const result = await emailService.sendPasswordResetEmail(
      testEmail,
      'Test User',
      '123456'
    );
    
    if (result.success) {
      console.log('\n✅ Test Email Sent Successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\n📬 Check your inbox:', testEmail);
    } else {
      console.error('\n❌ Failed to send test email');
    }
  } catch (error) {
    console.error('\n❌ Error sending test email:', error.message);
    console.log('\nError Details:', error);
  }
}

testEmail()
  .then(() => {
    console.log('\n✨ Email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });
