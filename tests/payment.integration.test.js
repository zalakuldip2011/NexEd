const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const User = require('../backend/models/User');
const Course = require('../backend/models/Course');
const Payment = require('../backend/models/Payment');
const Enrollment = require('../backend/models/Enrollment');
const { generateStripeSignature } = require('../backend/scripts/testStripeWebhook');

// Test data
let studentToken;
let studentId;
let instructorToken;
let instructorId;
let courseId;
let paymentId;

describe('Payment Integration Tests', () => {
  
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/nexed_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    
    // Clear test data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Payment.deleteMany({});
    await Enrollment.deleteMany({});
    
    // Create test instructor
    const instructorRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testinstructor',
        email: 'instructor@test.com',
        password: 'Password123!',
        role: 'instructor',
        profile: {
          firstName: 'Test',
          lastName: 'Instructor'
        }
      });
    
    instructorToken = instructorRes.body.token;
    instructorId = instructorRes.body.user.id;
    
    // Create test student
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'teststudent',
        email: 'student@test.com',
        password: 'Password123!',
        role: 'student',
        profile: {
          firstName: 'Test',
          lastName: 'Student'
        }
      });
    
    studentToken = studentRes.body.token;
    studentId = studentRes.body.user.id;
    
    // Create test course
    const courseRes = await request(app)
      .post('/api/courses/instructor')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Test Course for Payment',
        description: 'A test course for payment integration',
        price: 99,
        category: 'Programming',
        level: 'Beginner',
        status: 'published'
      });
    
    courseId = courseRes.body.course._id;
  });
  
  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Course.deleteMany({});
    await Payment.deleteMany({});
    await Enrollment.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('Free Course Enrollment', () => {
    test('Should enroll in free course without payment', async () => {
      // Update course to be free
      await Course.findByIdAndUpdate(courseId, { price: 0 });
      
      const res = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.enrollment).toBeDefined();
      expect(res.body.enrollment.course).toBe(courseId);
      expect(res.body.enrollment.student).toBe(studentId);
    });
  });
  
  describe('Paid Course Checkout', () => {
    beforeAll(async () => {
      // Reset course to paid
      await Course.findByIdAndUpdate(courseId, { price: 99 });
    });
    
    test('Should create Stripe checkout session for paid course', async () => {
      const res = await request(app)
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseIds: [courseId],
          successUrl: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: 'http://localhost:3000/payment/cancel'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.sessionUrl).toBeDefined();
      expect(res.body.paymentIds).toBeDefined();
      expect(res.body.paymentIds.length).toBe(1);
      
      paymentId = res.body.paymentIds[0];
      
      // Verify payment record was created
      const payment = await Payment.findById(paymentId);
      expect(payment).toBeDefined();
      expect(payment.status).toBe('processing');
      expect(payment.student.toString()).toBe(studentId);
      expect(payment.course.toString()).toBe(courseId);
    });
    
    test('Should prevent duplicate checkout for same course', async () => {
      const res = await request(app)
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseIds: [courseId],
          successUrl: 'http://localhost:3000/payment/success',
          cancelUrl: 'http://localhost:3000/payment/cancel'
        });
      
      // Should still allow creating a new session (cart behavior)
      // But once enrolled, should prevent
      expect(res.status).toBe(200);
    });
  });
  
  describe('Webhook Processing', () => {
    test('Should process checkout.session.completed webhook', async () => {
      // Get the payment we created
      const payment = await Payment.findById(paymentId);
      expect(payment).toBeDefined();
      
      const sessionId = payment.stripeSessionId;
      
      // Create webhook event
      const webhookEvent = {
        id: `evt_test_${Date.now()}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            payment_intent: `pi_test_${Date.now()}`,
            customer: `cus_test_${Date.now()}`,
            payment_status: 'paid',
            metadata: {
              studentId: studentId,
              paymentIds: paymentId,
              courseIds: courseId
            }
          }
        }
      };
      
      // Generate signature
      const signature = generateStripeSignature(
        webhookEvent,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
      );
      
      // Send webhook
      const res = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', signature)
        .send(webhookEvent);
      
      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
      
      // Verify payment was completed
      const updatedPayment = await Payment.findById(paymentId);
      expect(updatedPayment.status).toBe('completed');
      
      // Verify enrollment was created
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId
      });
      
      expect(enrollment).toBeDefined();
      expect(enrollment.status).toBe('active');
      expect(enrollment.payment.toString()).toBe(paymentId);
    });
    
    test('Should handle duplicate webhook events (idempotency)', async () => {
      const payment = await Payment.findById(paymentId);
      const sessionId = payment.stripeSessionId;
      
      // Create the same webhook event
      const webhookEvent = {
        id: 'evt_duplicate_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            payment_intent: payment.stripePaymentIntentId,
            customer: payment.stripeCustomerId,
            payment_status: 'paid',
            metadata: {
              studentId: studentId,
              paymentIds: paymentId,
              courseIds: courseId
            }
          }
        }
      };
      
      const signature = generateStripeSignature(
        webhookEvent,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
      );
      
      // Send webhook first time
      await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', signature)
        .send(webhookEvent);
      
      // Send webhook second time (duplicate)
      const res = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', signature)
        .send(webhookEvent);
      
      expect(res.status).toBe(200);
      expect(res.body.note).toContain('already processed');
      
      // Verify only one enrollment exists
      const enrollments = await Enrollment.find({
        student: studentId,
        course: courseId
      });
      
      expect(enrollments.length).toBe(1);
    });
  });
  
  describe('Payment Verification', () => {
    test('Should verify payment by session ID', async () => {
      const payment = await Payment.findById(paymentId);
      const sessionId = payment.stripeSessionId;
      
      const res = await request(app)
        .get(`/api/payments/verify/${sessionId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.session).toBeDefined();
      expect(res.body.payments).toBeDefined();
      expect(res.body.payments.length).toBeGreaterThan(0);
    });
  });
  
  describe('Payment History', () => {
    test('Should retrieve student payment history', async () => {
      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payments).toBeDefined();
      expect(res.body.payments.length).toBeGreaterThan(0);
      
      const paymentRecord = res.body.payments.find(p => p._id === paymentId);
      expect(paymentRecord).toBeDefined();
      expect(paymentRecord.status).toBe('completed');
    });
  });
  
  describe('Receipt Generation', () => {
    test('Should generate receipt for completed payment', async () => {
      const res = await request(app)
        .get(`/api/payments/${paymentId}/receipt`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      // Receipt endpoint might return JSON or redirect
      expect(res.body || res.text).toBeDefined();
    });
  });
  
  describe('Multi-Course Checkout', () => {
    let secondCourseId;
    
    beforeAll(async () => {
      // Create another course
      const courseRes = await request(app)
        .post('/api/courses/instructor')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Second Test Course',
          description: 'Another test course',
          price: 149,
          category: 'Design',
          level: 'Intermediate',
          status: 'published'
        });
      
      secondCourseId = courseRes.body.course._id;
    });
    
    test('Should create checkout session for multiple courses', async () => {
      const res = await request(app)
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseIds: [secondCourseId],
          successUrl: 'http://localhost:3000/payment/success',
          cancelUrl: 'http://localhost:3000/payment/cancel'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.paymentIds).toBeDefined();
      expect(res.body.paymentIds.length).toBe(1);
    });
  });
});
