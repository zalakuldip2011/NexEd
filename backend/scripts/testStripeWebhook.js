/**
 * Stripe Webhook Test Utility
 * 
 * This script simulates Stripe webhook events for local testing
 * Usage: node backend/scripts/testStripeWebhook.js
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

/**
 * Generate Stripe webhook signature
 */
function generateStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadString}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Create a test checkout session completed event
 */
function createCheckoutSessionCompletedEvent(sessionId, paymentIds, courseIds, studentId) {
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        object: 'checkout.session',
        amount_total: 9900,
        currency: 'usd',
        customer: `cus_test_${Date.now()}`,
        customer_email: 'student@example.com',
        payment_intent: `pi_test_${Date.now()}`,
        payment_status: 'paid',
        status: 'complete',
        metadata: {
          studentId: studentId,
          paymentIds: paymentIds,
          courseIds: courseIds
        }
      }
    }
  };
}

/**
 * Create a test payment intent succeeded event
 */
function createPaymentIntentSucceededEvent(paymentIntentId) {
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 9900,
        currency: 'usd',
        status: 'succeeded',
        customer: `cus_test_${Date.now()}`,
        latest_charge: `ch_test_${Date.now()}`,
        metadata: {}
      }
    }
  };
}

/**
 * Create a test charge refunded event
 */
function createChargeRefundedEvent(chargeId, amount) {
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type: 'charge.refunded',
    data: {
      object: {
        id: chargeId,
        object: 'charge',
        amount: amount,
        amount_refunded: amount,
        currency: 'usd',
        refunded: true,
        refunds: {
          data: [{
            id: `re_test_${Date.now()}`,
            amount: amount,
            created: Math.floor(Date.now() / 1000),
            status: 'succeeded'
          }]
        }
      }
    }
  };
}

/**
 * Send webhook event to the server
 */
async function sendWebhookEvent(event) {
  try {
    const signature = generateStripeSignature(event, WEBHOOK_SECRET);
    
    console.log('\n📤 Sending webhook event...');
    console.log(`Event Type: ${event.type}`);
    console.log(`Event ID: ${event.id}`);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/webhook`,
      event,
      {
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': signature
        }
      }
    );
    
    console.log('✅ Webhook delivered successfully');
    console.log('Response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Webhook delivery failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

/**
 * Test checkout session completed webhook
 */
async function testCheckoutSessionCompleted() {
  console.log('\n🧪 Testing checkout.session.completed webhook...');
  console.log('================================================');
  
  // You need to provide actual IDs from your database
  const sessionId = process.argv[2] || 'cs_test_1234567890';
  const paymentIds = process.argv[3] || 'pay_1,pay_2';
  const courseIds = process.argv[4] || 'course_1,course_2';
  const studentId = process.argv[5] || 'student_123';
  
  console.log(`Session ID: ${sessionId}`);
  console.log(`Payment IDs: ${paymentIds}`);
  console.log(`Course IDs: ${courseIds}`);
  console.log(`Student ID: ${studentId}`);
  
  const event = createCheckoutSessionCompletedEvent(
    sessionId,
    paymentIds,
    courseIds,
    studentId
  );
  
  await sendWebhookEvent(event);
}

/**
 * Test payment intent succeeded webhook
 */
async function testPaymentIntentSucceeded() {
  console.log('\n🧪 Testing payment_intent.succeeded webhook...');
  console.log('================================================');
  
  const paymentIntentId = process.argv[2] || `pi_test_${Date.now()}`;
  console.log(`Payment Intent ID: ${paymentIntentId}`);
  
  const event = createPaymentIntentSucceededEvent(paymentIntentId);
  await sendWebhookEvent(event);
}

/**
 * Test charge refunded webhook
 */
async function testChargeRefunded() {
  console.log('\n🧪 Testing charge.refunded webhook...');
  console.log('================================================');
  
  const chargeId = process.argv[2] || `ch_test_${Date.now()}`;
  const amount = parseInt(process.argv[3]) || 9900;
  
  console.log(`Charge ID: ${chargeId}`);
  console.log(`Amount: $${(amount / 100).toFixed(2)}`);
  
  const event = createChargeRefundedEvent(chargeId, amount);
  await sendWebhookEvent(event);
}

/**
 * Validate webhook secret configuration
 */
function validateConfiguration() {
  console.log('\n🔍 Validating Configuration...');
  console.log('================================================');
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`Webhook Secret: ${WEBHOOK_SECRET ? '✅ Set' : '❌ Not set'}`);
  
  if (!WEBHOOK_SECRET || WEBHOOK_SECRET === 'whsec_test_secret') {
    console.warn('\n⚠️  WARNING: Using default test webhook secret!');
    console.warn('Set STRIPE_WEBHOOK_SECRET environment variable for production.');
  }
  
  console.log('\n');
}

/**
 * Display usage information
 */
function displayUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Stripe Webhook Test Utility for NexEd               ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node backend/scripts/testStripeWebhook.js [command] [args...]

COMMANDS:
  checkout <sessionId> <paymentIds> <courseIds> <studentId>
    Test checkout.session.completed webhook
    Example: node testStripeWebhook.js checkout cs_123 pay_1,pay_2 course_1,course_2 user_123

  payment <paymentIntentId>
    Test payment_intent.succeeded webhook
    Example: node testStripeWebhook.js payment pi_123456789

  refund <chargeId> <amount>
    Test charge.refunded webhook
    Example: node testStripeWebhook.js refund ch_123456789 9900

  validate
    Validate webhook configuration only

ENVIRONMENT VARIABLES:
  API_URL                  - Backend API URL (default: http://localhost:5000)
  STRIPE_WEBHOOK_SECRET    - Stripe webhook signing secret

EXAMPLES:
  # Test checkout session completion
  npm run test:webhook checkout cs_test_123 pay_abc123,pay_def456 course_1,course_2 user_789

  # Test payment intent
  npm run test:webhook payment pi_test_123456

  # Validate configuration
  npm run test:webhook validate

NOTES:
  - Make sure your backend server is running
  - Use actual database IDs from your test data
  - Check backend logs for detailed webhook processing information
  `);
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2] || 'help';
  
  if (command === 'help' || command === '--help' || command === '-h') {
    displayUsage();
    return;
  }
  
  validateConfiguration();
  
  try {
    switch (command) {
      case 'checkout':
        await testCheckoutSessionCompleted();
        break;
      case 'payment':
        await testPaymentIntentSucceeded();
        break;
      case 'refund':
        await testChargeRefunded();
        break;
      case 'validate':
        console.log('✅ Configuration validated');
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run with --help for usage information');
        process.exit(1);
    }
    
    console.log('\n✨ Test completed successfully!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Test failed!\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  sendWebhookEvent,
  createCheckoutSessionCompletedEvent,
  createPaymentIntentSucceededEvent,
  createChargeRefundedEvent,
  generateStripeSignature
};
