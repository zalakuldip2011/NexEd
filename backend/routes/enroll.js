/**
 * Enrollment Routes with Razorpay Payment Integration
 * Handles course enrollment, payment creation, verification, and webhooks
 * 
 * FIXED: express.raw() middleware properly isolated in webhook route
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { auth, requireRole } = require('../middleware/auth');
const { asyncHandler, badRequestError, notFoundError } = require('../middleware/errorHandler');
const { logPayment, logError } = require('../utils/errorLogger');
const { paymentLogger } = require('../utils/paymentLogger');
const NotificationService = require('../services/notificationService');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Cart = require('../models/Cart');

/**
 * @desc    Create Razorpay order or enroll directly for free courses
 * @route   POST /api/enroll/create-order
 * @access  Private (Student/Instructor - anyone can learn)
 */
router.post('/create-order', auth, asyncHandler(async (req, res) => {
  // DEBUG: Log incoming request
  console.log('\n' + '='.repeat(80));
  console.log('📝 POST /api/enroll/create-order');
  console.log('='.repeat(80));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('👤 User ID:', req.user?.id);
  console.log('👤 Username:', req.user?.username);
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔑 Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Configured ✅' : 'Missing ❌');
  console.log('🔐 Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Configured ✅' : 'Missing ❌');
  console.log('-'.repeat(80));

  const { courseId, courseIds } = req.body;
  const userId = req.user.id;

  // Build array of course IDs (single or multiple from cart)
  let coursesToEnroll = [];
  if (courseId) {
    coursesToEnroll = [courseId];
  } else if (courseIds && Array.isArray(courseIds)) {
    coursesToEnroll = courseIds;
  } else {
    console.error('❌ Missing courseId or courseIds');
    throw badRequestError('Please provide courseId or courseIds');
  }

  console.log('📚 Courses to enroll:', coursesToEnroll);
  console.log('📊 Course count:', coursesToEnroll.length);

  // Fetch courses and validate
  console.log('🔍 Fetching courses from database...');
  const courses = await Course.find({ _id: { $in: coursesToEnroll } });
  
  console.log('✅ Found courses:', courses.length);
  
  if (courses.length === 0) {
    console.error('❌ No courses found in database');
    console.error('❌ Requested IDs:', coursesToEnroll);
    throw notFoundError('No courses found with the provided IDs');
  }
  
  if (courses.length !== coursesToEnroll.length) {
    console.error('❌ Course count mismatch!');
    console.error('   Expected:', coursesToEnroll.length);
    console.error('   Found:', courses.length);
    const foundIds = courses.map(c => c._id.toString());
    const missing = coursesToEnroll.filter(id => !foundIds.includes(id));
    console.error('   Missing course IDs:', missing);
    throw notFoundError(`Courses not found: ${missing.join(', ')}`);
  }
  
  // Validate course data integrity
  console.log('🔍 Validating course data...');
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    console.log(`\n📖 Course ${i + 1}/${courses.length}:`);
    console.log(`   ID: ${course._id}`);
    console.log(`   Title: ${course.title}`);
    console.log(`   Price: ₹${course.price || 0}`);
    console.log(`   Status: ${course.status}`);
    console.log(`   Instructor: ${course.instructor || 'MISSING ❌'}`);
    
    if (!course.instructor) {
      console.error(`\n❌ CRITICAL ERROR: Course has no instructor!`);
      console.error('   Course ID:', course._id);
      console.error('   Course Title:', course.title);
      throw badRequestError(`Course "${course.title}" is missing instructor data. Please contact support.`);
    }
    
    if (course.status !== 'published') {
      console.error(`\n❌ Course is not published!`);
      console.error('   Status:', course.status);
      throw badRequestError(`Course "${course.title}" is not available for enrollment.`);
    }
  }

  logPayment('create-order-initiated', {
    userId,
    courseCount: coursesToEnroll.length,
    courseIds: coursesToEnroll
  });

  // Check if already enrolled in any course
  const existingEnrollments = await Enrollment.find({
    student: userId,
    course: { $in: coursesToEnroll },
    status: { $in: ['active', 'completed'] }
  });

  if (existingEnrollments.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'You are already enrolled in one or more of these courses',
      enrolledCourses: existingEnrollments.map(e => e.course)
    });
  }

  // Calculate total amount in INR
  let totalAmountINR = 0;
  const courseDetails = courses.map(course => {
    const priceINR = course.price || 0;
    totalAmountINR += priceINR;
    return {
      courseId: course._id,
      title: course.title,
      price: priceINR,
      instructor: course.instructor
    };
  });

  // FREE COURSE FLOW - Enroll directly without payment
  if (totalAmountINR === 0) {
    console.log('\n🆓 FREE COURSE DETECTED - Direct enrollment');
    const enrollments = [];
    
    for (const course of courses) {
      // Create free payment record
      const payment = new Payment({
        student: userId,
        course: course._id,
        instructor: course.instructor,
        amount: 0,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'free',
        paymentProvider: 'free',
        transactionId: `free_${userId}_${course._id}_${Date.now()}`,
        pricing: {
          originalPrice: 0,
          discount: 0,
          subtotal: 0,
          tax: 0,
          platformFee: 0,
          finalAmount: 0
        },
        revenue: {
          instructorShare: 0,
          platformShare: 0,
          instructorSharePercentage: 70
        },
        completedAt: new Date()
      });
      
      await payment.save();

      // Create enrollment
      const enrollment = new Enrollment({
        student: userId,
        course: course._id,
        instructor: course.instructor,
        payment: payment._id,
        enrolledAt: new Date(),
        status: 'active'
      });
      
      await enrollment.save();
      
      // Update course student count
      course.studentCount = (course.studentCount || 0) + 1;
      await course.save();
      
      enrollments.push(enrollment);
    }

    // Clear cart if multiple courses
    if (courseIds && courseIds.length > 0) {
      await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { course: { $in: courseIds } } } }
      );
    }

    console.log('✅ Free course enrollment successful');
    console.log('='.repeat(80) + '\n');

    return res.status(201).json({
      success: true,
      message: 'Successfully enrolled in free course(s)',
      isFree: true,
      enrollments,
      totalAmount: 0
    });
  }

  // PAID COURSE FLOW - Create Razorpay order
  console.log('\n💰 PAID COURSE - Creating Razorpay order');
  const amountInPaise = Math.round(totalAmountINR * 100); // Convert to paise
  // Fix: Shorten receipt to stay under 40 character limit
  const receipt = `rcpt_${userId.slice(-8)}_${Date.now().toString().slice(-10)}`;
  
  console.log('   Amount in INR:', totalAmountINR);
  console.log('   Amount in Paise:', amountInPaise);
  console.log('   Receipt:', receipt, `(${receipt.length} chars)`);
  
  // Validate amount
  if (!amountInPaise || amountInPaise <= 0 || !Number.isInteger(amountInPaise)) {
    console.error('❌ Invalid amount:', amountInPaise);
    throw badRequestError(`Invalid amount: ${amountInPaise}. Amount must be a positive integer in paise.`);
  }
  
  const orderOptions = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
    notes: {
      userId: userId,
      courseIds: JSON.stringify(coursesToEnroll),
      courseCount: coursesToEnroll.length
    }
  };

  console.log('   Order options:', JSON.stringify(orderOptions, null, 2));

  // Create Razorpay order
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create(orderOptions);
    console.log('✅ Razorpay order created:', razorpayOrder.id);
    
    paymentLogger.logSuccess('razorpay-order-created', {
      orderId: razorpayOrder.id,
      amount: totalAmountINR,
      courseCount: courses.length,
      userId,
      receipt
    });
  } catch (razorpayError) {
    console.error('❌ Razorpay order creation failed:', razorpayError);
    console.error('   Error details:', razorpayError.error || razorpayError);
    
    paymentLogger.logError('razorpay-order-creation-failed', razorpayError, {
      orderOptions,
      userId,
      courseCount: courses.length,
      totalAmount: totalAmountINR
    });
    
    throw new Error(`Failed to create Razorpay order: ${razorpayError.error?.description || razorpayError.message || 'Unknown error'}`);
  }

  // Create Payment record in database (pending status)
  console.log('\n' + '-'.repeat(80));
  console.log('💾 Creating payment records in database');
  console.log('-'.repeat(80));
  
  const paymentPromises = courses.map(async (course, index) => {
    const coursePrice = course.price || 0;
    const instructorShare = coursePrice * 0.70; // 70% to instructor
    const platformShare = coursePrice * 0.30; // 30% to platform
    
    console.log(`\n💳 Payment ${index + 1}/${courses.length}: ${course.title}`);
    console.log(`   Course ID: ${course._id}`);
    console.log(`   Student: ${userId}`);
    console.log(`   Instructor: ${course.instructor}`);
    console.log(`   Amount: ₹${coursePrice}`);
    console.log(`   Instructor Share (70%): ₹${instructorShare.toFixed(2)}`);
    console.log(`   Platform Share (30%): ₹${platformShare.toFixed(2)}`);
    console.log(`   Razorpay Order ID: ${razorpayOrder.id}`);
    
    // Validate required fields before creating payment
    if (!userId) {
      console.error('❌ Missing userId');
      throw new Error('User ID is required');
    }
    if (!course._id) {
      console.error('❌ Missing course._id');
      throw new Error('Course ID is required');
    }
    if (!course.instructor) {
      console.error('❌ Missing course.instructor');
      throw new Error(`Instructor is required for course: ${course.title}`);
    }
    
    try {
      const payment = new Payment({
        student: userId,
        course: course._id,
        instructor: course.instructor,
        amount: coursePrice,
        currency: 'INR',
        status: 'pending',
        paymentMethod: 'razorpay',
        paymentProvider: 'razorpay',
        transactionId: razorpayOrder.id,
        paymentDetails: {
          razorpayOrderId: razorpayOrder.id
        },
        pricing: {
          originalPrice: coursePrice,
          discount: 0,
          subtotal: coursePrice,
          tax: 0,
          platformFee: platformShare,
          finalAmount: coursePrice
        },
        revenue: {
          instructorShare: instructorShare,
          platformShare: platformShare,
          instructorSharePercentage: 70
        },
        metadata: {
          receipt: receipt,
          orderCreatedAt: new Date()
        }
      });
      
      await payment.save();
      console.log(`   ✅ Payment record saved: ${payment._id}`);
      console.log(`   ✅ Status: ${payment.status}`);
      console.log(`   ✅ Transaction ID: ${payment.transactionId}`);
      return payment;
    } catch (paymentError) {
      console.error(`\n❌ PAYMENT CREATION FAILED for course: ${course.title}`);
      console.error('   Course ID:', course._id);
      console.error('   Error name:', paymentError.name);
      console.error('   Error message:', paymentError.message);
      
      if (paymentError.name === 'ValidationError') {
        console.error('   Validation errors:');
        Object.keys(paymentError.errors || {}).forEach(field => {
          console.error(`      - ${field}: ${paymentError.errors[field].message}`);
        });
      }
      
      console.error('   Payment data attempted:', {
        student: userId,
        course: course._id.toString(),
        instructor: course.instructor?.toString(),
        amount: coursePrice,
        currency: 'INR',
        paymentMethod: 'razorpay',
        transactionId: razorpayOrder.id
      });
      
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }
  });

  try {
    const createdPayments = await Promise.all(paymentPromises);
    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS: All payment records created');
    console.log('   Total payments:', createdPayments.length);
    console.log('   Payment IDs:', createdPayments.map(p => p._id.toString()));
    console.log('='.repeat(80));
  } catch (paymentCreationError) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ FAILED: Payment record creation');
    console.error('   Error:', paymentCreationError.message);
    console.error('   Stack:', paymentCreationError.stack);
    console.error('='.repeat(80));
    throw new Error(`Payment creation failed: ${paymentCreationError.message}`);
  }

  // Return order details for frontend
  const responseData = {
    success: true,
    message: 'Order created successfully',
    order: {
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt
    },
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    courseDetails: courseDetails,
    totalAmount: totalAmountINR,
    totalAmountPaise: amountInPaise
  };
  
  console.log('\n📤 Sending response to client:');
  console.log('   Success:', responseData.success);
  console.log('   Order ID:', responseData.order.orderId);
  console.log('   Amount (INR):', totalAmountINR);
  console.log('   Amount (Paise):', amountInPaise);
  console.log('   Courses:', courseDetails.length);
  console.log('='.repeat(80) + '\n');
  
  res.status(201).json(responseData);

  logPayment('order-created-successfully', {
    userId,
    orderId: razorpayOrder.id,
    amount: totalAmountINR,
    courseCount: courses.length
  });
}));

/**
 * @desc    Verify Razorpay payment and create enrollments
 * @route   POST /api/enroll/verify
 * @access  Private (Student/Instructor - anyone can learn)
 */
router.post('/verify', auth, asyncHandler(async (req, res) => {
  console.log('\n' + '='.repeat(80));
  console.log('🔐 POST /api/enroll/verify - PAYMENT VERIFICATION');
  console.log('='.repeat(80));
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseIds
  } = req.body;

  const userId = req.user.id;
  
  console.log('📦 Verification request:');
  console.log('   User ID:', userId);
  console.log('   User:', req.user.username);
  console.log('   Order ID:', razorpay_order_id);
  console.log('   Payment ID:', razorpay_payment_id);
  console.log('   Signature:', razorpay_signature ? `${razorpay_signature.substring(0, 20)}...` : 'MISSING ❌');
  console.log('   Course IDs:', courseIds);
  console.log('-'.repeat(80));

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error('❌ Validation failed: Missing required fields');
    console.error('   Order ID:', razorpay_order_id ? '✅' : '❌ MISSING');
    console.error('   Payment ID:', razorpay_payment_id ? '✅' : '❌ MISSING');
    console.error('   Signature:', razorpay_signature ? '✅' : '❌ MISSING');
    throw badRequestError('Missing payment verification details');
  }

  logPayment('payment-verification-initiated', {
    userId,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id
  });

  // Verify signature
  console.log('\n🔍 Verifying Razorpay signature...');
  console.log('   Secret key:', process.env.RAZORPAY_KEY_SECRET ? 'Configured ✅' : 'Missing ❌');
  
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  
  console.log('   Generated signature:', `${generatedSignature.substring(0, 20)}...`);
  console.log('   Received signature:', `${razorpay_signature.substring(0, 20)}...`);
  console.log('   Match:', generatedSignature === razorpay_signature ? '✅ VALID' : '❌ INVALID');

  if (generatedSignature !== razorpay_signature) {
    console.error('\n❌ SIGNATURE VERIFICATION FAILED!');
    console.error('   This could mean:');
    console.error('   1. Payment was tampered with');
    console.error('   2. Wrong Razorpay secret key');
    console.error('   3. Payment data corrupted');
    
    // Mark payments as failed
    const updateResult = await Payment.updateMany(
      {
        student: userId,
        transactionId: razorpay_order_id,
        status: 'pending'
      },
      {
        status: 'failed',
        failureReason: 'Invalid payment signature',
        failedAt: new Date()
      }
    );
    
    console.error('   Marked', updateResult.modifiedCount, 'payments as failed');

    paymentLogger.logError('payment-signature-verification-failed', 
      new Error('Invalid payment signature'), {
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        expectedSignature: generatedSignature.substring(0, 20) + '...',
        receivedSignature: razorpay_signature.substring(0, 20) + '...',
        failedPayments: updateResult.modifiedCount
      });

    logPayment('payment-verification-failed', {
      userId,
      orderId: razorpay_order_id,
      reason: 'Invalid signature'
    });

    return res.status(400).json({
      success: false,
      message: 'Payment verification failed - Invalid signature'
    });
  }

  // Signature is valid - fetch payment details from Razorpay
  console.log('\n✅ Signature verified! Fetching payment details from Razorpay...');
  let razorpayPayment;
  try {
    razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log('   Payment method:', razorpayPayment?.method);
    console.log('   Payment status:', razorpayPayment?.status);
  } catch (error) {
    console.error('⚠️  Could not fetch payment details from Razorpay:', error.message);
    logError(error, {
      action: 'fetch-razorpay-payment',
      paymentId: razorpay_payment_id
    });
  }

  // Find all pending payments for this order
  console.log('\n🔍 Finding pending payments in database...');
  const payments = await Payment.find({
    student: userId,
    transactionId: razorpay_order_id,
    status: 'pending'
  }).populate('course');

  console.log('   Found', payments.length, 'pending payment(s)');

  if (payments.length === 0) {
    console.error('❌ No pending payments found!');
    throw notFoundError('No pending payments found for this order');
  }

  // Update payments and create enrollments
  console.log('\n💾 Updating payments and creating enrollments...');
  const enrollments = [];
  
  for (const payment of payments) {
    console.log(`\n   Processing: ${payment.course.title}`);
    
    // Update payment record
    payment.status = 'completed';
    payment.paymentDetails = {
      ...payment.paymentDetails,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: razorpayPayment?.method || 'card',
      cardBrand: razorpayPayment?.card?.network,
      cardLast4: razorpayPayment?.card?.last4
    };
    payment.completedAt = new Date();
    
    await payment.save();
    console.log('      ✅ Payment marked as completed');

    // Check if enrollment already exists (idempotency)
    let enrollment = await Enrollment.findOne({
      student: userId,
      course: payment.course._id,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      // Create new enrollment
      enrollment = new Enrollment({
        student: userId,
        course: payment.course._id,
        instructor: payment.instructor,
        payment: payment._id,
        enrolledAt: new Date(),
        status: 'active'
      });
      
      await enrollment.save();
      console.log('      ✅ Enrollment created');

      // Update course student count
      await Course.findByIdAndUpdate(
        payment.course._id,
        { $inc: { studentCount: 1 } }
      );
      console.log('      ✅ Course student count updated');
    } else {
      console.log('      ℹ️  Already enrolled (idempotency check)');
    }

    enrollments.push(enrollment);
  }

  // Clear purchased courses from cart
  if (courseIds && courseIds.length > 0) {
    await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { course: { $in: courseIds } } } }
    );
    console.log('\n🛒 Cart cleared');
  }

  // Populate enrollments with course details
  const populatedEnrollments = await Enrollment.find({
    _id: { $in: enrollments.map(e => e._id) }
  }).populate('course', 'title description thumbnail category level');

  console.log('\n' + '='.repeat(80));
  console.log('✅ PAYMENT VERIFIED & ENROLLMENTS CREATED');
  console.log('   Enrollments:', enrollments.length);
  console.log('   Order ID:', razorpay_order_id);
  console.log('   Payment ID:', razorpay_payment_id);
  console.log('='.repeat(80) + '\n');

  paymentLogger.logSuccess('payment-verified-and-enrolled', {
    userId,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    enrollmentCount: enrollments.length,
    courses: enrollments.map(e => ({
      courseId: e.course._id,
      title: e.course.title
    }))
  });

  logPayment('payment-verified-successfully', {
    userId,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    enrollmentCount: enrollments.length
  });

  // Create payment success notification
  try {
    await NotificationService.createPaymentSuccessNotification(
      userId,
      { _id: razorpay_payment_id, amount: payment.amount },
      enrollments.map(e => e.course)
    );
  } catch (error) {
    console.error('Error creating payment success notification:', error);
  }

  res.json({
    success: true,
    message: 'Payment verified and enrollment(s) created successfully',
    verified: true,
    enrollments: populatedEnrollments,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id
  });
}));

/**
 * @desc    Razorpay webhook handler
 * @route   POST /api/enroll/webhook
 * @access  Public (with signature verification)
 * 
 * ⚠️ CRITICAL FIX: express.raw() middleware is wrapped in a function
 * to prevent it from breaking JSON parsing in other routes
 */
router.post('/webhook',
  // 🔥 FIX: Wrap express.raw() to isolate it from other routes
  (req, res, next) => {
    express.raw({ type: 'application/json' })(req, res, next);
  },
  asyncHandler(async (req, res) => {
    console.log('\n' + '='.repeat(80));
    console.log('🪝 POST /api/enroll/webhook - Razorpay Webhook');
    console.log('='.repeat(80));
    
    const signature = req.headers['x-razorpay-signature'];
    
    console.log('   Signature received:', signature ? '✅' : '❌ MISSING');
    
    if (!signature) {
      console.error('❌ No signature in webhook request');
      throw badRequestError('No signature provided');
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      console.log('   Verifying webhook signature...');
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('❌ Invalid webhook signature!');
        logPayment('webhook-signature-invalid', {
          event: req.body.event,
          receivedSignature: signature
        });
        
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
      console.log('   ✅ Signature verified');
    } else {
      console.warn('⚠️  No webhook secret configured - skipping verification');
    }

    const event = req.body.event;
    const payload = req.body.payload.payment?.entity || req.body.payload.order?.entity;

    console.log('   Event:', event);
    console.log('   Payment ID:', payload?.id);
    console.log('   Order ID:', payload?.order_id);

    logPayment('webhook-received', {
      event,
      paymentId: payload?.id,
      orderId: payload?.order_id
    });

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
      case 'order.paid':
        console.log('   ✅ Payment captured - handled by verify endpoint');
        logPayment('webhook-payment-captured', {
          paymentId: payload.id,
          orderId: payload.order_id
        });
        break;

      case 'payment.failed':
        console.log('   ❌ Payment failed');
        // Mark payment as failed
        const updateResult = await Payment.updateMany(
          { transactionId: payload.order_id },
          {
            status: 'failed',
            failureReason: payload.error_description || 'Payment failed',
            failedAt: new Date()
          }
        );
        console.log('   Marked', updateResult.modifiedCount, 'payments as failed');
        
        logPayment('webhook-payment-failed', {
          paymentId: payload.id,
          orderId: payload.order_id,
          reason: payload.error_description
        });
        break;

      default:
        console.log('   ℹ️  Unhandled event type');
        logPayment('webhook-unhandled-event', { event });
    }

    console.log('='.repeat(80) + '\n');

    // Always respond 200 to acknowledge receipt
    res.status(200).json({ success: true, received: true });
  })
);

/**
 * @desc    Check enrollment status for a course
 * @route   GET /api/enroll/check/:courseId
 * @access  Private
 */
router.get('/check/:courseId', auth, asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  const enrollment = await Enrollment.findOne({
    student: userId,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  });

  res.json({
    success: true,
    enrolled: !!enrollment,
    enrollment: enrollment || null
  });
}));

/**
 * @desc    Get payment system health and stats (Admin only)
 * @route   GET /api/enroll/payment-stats
 * @access  Private (Admin)
 */
router.get('/payment-stats', auth, requireRole('admin'), asyncHandler(async (req, res) => {
  const stats = paymentLogger.getPaymentStats();
  const recentErrors = paymentLogger.getRecentErrors(10);

  res.json({
    success: true,
    data: {
      stats,
      recentErrors,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * @desc    Get recent payment errors for debugging (Admin only)
 * @route   GET /api/enroll/payment-errors
 * @access  Private (Admin)
 */
router.get('/payment-errors', auth, requireRole('admin'), asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const errors = paymentLogger.getRecentErrors(limit);

  res.json({
    success: true,
    count: errors.length,
    data: {
      errors,
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;
