const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// Note: You'll need to install stripe and @paypal/checkout-server-sdk
// npm install stripe @paypal/checkout-server-sdk

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/payments/checkout
 * @access  Private (Student)
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { courseIds, successUrl, cancelUrl } = req.body;
    const studentId = req.user.id;

    if (!courseIds || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs are required'
      });
    }

    // Fetch all courses
    const courses = await Course.find({ _id: { $in: courseIds } }).populate('instructor');

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No courses found'
      });
    }

    // Validate courses
    for (const course of courses) {
      if (course.status !== 'published') {
        return res.status(400).json({
          success: false,
          message: `Course "${course.title}" is not available for purchase`
        });
      }

      if (course.instructor._id.toString() === studentId) {
        return res.status(400).json({
          success: false,
          message: `You cannot purchase your own course "${course.title}"`
        });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: studentId,
        course: course._id
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: `You are already enrolled in "${course.title}"`
        });
      }
    }

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create line items for Stripe Checkout
    const lineItems = courses.map(course => {
      const price = course.price || 0;
      const discount = course.discount || 0;
      const finalPrice = price * (1 - discount / 100);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description?.substring(0, 500) || 'No description',
            images: course.thumbnail ? [course.thumbnail] : []
          },
          unit_amount: Math.round(finalPrice * 100) // Convert to cents
        },
        quantity: 1
      };
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      client_reference_id: studentId,
      metadata: {
        studentId: studentId,
        courseIds: courseIds.join(','),
        timestamp: new Date().toISOString()
      }
    });

    // Create payment records for each course
    for (const course of courses) {
      const price = course.price || 0;
      const discount = course.discount || 0;
      const finalPrice = price * (1 - discount / 100);

      await Payment.create({
        student: studentId,
        course: course._id,
        instructor: course.instructor._id,
        amount: finalPrice,
        currency: 'usd',
        provider: 'stripe',
        providerPaymentId: session.id,
        status: 'pending',
        metadata: {
          courseTitle: course.title,
          studentEmail: req.user.email,
          checkoutSessionId: session.id
        }
      });
    }

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating checkout session',
      error: error.message
    });
  }
};

/**
 * @desc    Verify payment after Stripe Checkout
 * @route   POST /api/payments/verify
 * @access  Private (Student)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: session.payment_status
      });
    }

    // Find and update payment records
    const payments = await Payment.find({
      providerPaymentId: sessionId,
      status: 'pending'
    }).populate('course');

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending payments found for this session'
      });
    }

    // Update payments and create enrollments
    const enrollments = [];
    for (const payment of payments) {
      // Update payment status
      payment.status = 'completed';
      payment.paidAt = new Date();
      payment.providerResponse = session;
      await payment.save();

      // Create enrollment
      const enrollment = await Enrollment.create({
        student: payment.student,
        course: payment.course._id,
        enrolledAt: new Date(),
        progress: {
          completedLectures: [],
          percentage: 0
        }
      });

      enrollments.push(enrollment);
    }

    res.json({
      success: true,
      message: 'Payment verified and enrollments created',
      payments,
      enrollments
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment',
      error: error.message
    });
  }
};

/**
 * @desc    Create payment intent (Stripe) or order (PayPal)
 * @route   POST /api/payments/create
 * @access  Private (Student)
 */
exports.createPayment = async (req, res) => {
  try {
    const { courseId, provider = 'stripe', couponCode } = req.body;
    const studentId = req.user.id;

    // Validate course
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
      });
    }

    // Check if course is free
    if (course.price === 0 || course.isFree) {
      return res.status(400).json({
        success: false,
        message: 'This course is free. No payment required.'
      });
    }

    // Check if student is the instructor
    if (course.instructor._id.toString() === studentId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own course'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.isEnrolled(studentId, courseId);
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Check for existing pending payment
    const existingPayment = await Payment.findOne({
      student: studentId,
      course: courseId,
      status: 'pending'
    });

    if (existingPayment) {
      return res.json({
        success: true,
        message: 'Payment already initiated',
        payment: existingPayment
      });
    }

    // Calculate amount (apply coupon if valid)
    let amount = course.price;
    let discountAmount = 0;
    
    // TODO: Implement coupon validation here
    // if (couponCode) {
    //   const coupon = await Coupon.findOne({ code: couponCode, active: true });
    //   if (coupon) {
    //     discountAmount = (amount * coupon.discount) / 100;
    //     amount -= discountAmount;
    //   }
    // }

    // Create payment record
    const payment = await Payment.createPayment({
      student: studentId,
      course: courseId,
      instructor: course.instructor._id,
      amount,
      currency: 'usd',
      provider,
      metadata: {
        courseTitle: course.title,
        studentEmail: req.user.email,
        discountAmount,
        couponCode: couponCode || null
      }
    });

    // Provider-specific logic
    if (provider === 'stripe') {
      // Initialize Stripe (you need to set STRIPE_SECRET_KEY in env)
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: 'usd',
        metadata: {
          paymentId: payment._id.toString(),
          courseId: courseId,
          studentId: studentId
        },
        description: `Purchase of ${course.title}`
      });

      payment.provider = 'stripe';
      payment.providerPaymentId = paymentIntent.id;
      payment.providerResponse = paymentIntent;
      await payment.save();

      res.status(201).json({
        success: true,
        message: 'Payment intent created successfully',
        payment: {
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          clientSecret: paymentIntent.client_secret
        }
      });

    } else if (provider === 'paypal') {
      // Initialize PayPal
      const paypal = require('@paypal/checkout-server-sdk');
      
      // Configure PayPal environment
      const environment = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          );
      
      const client = new paypal.core.PayPalHttpClient(environment);

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          },
          description: `Purchase of ${course.title}`
        }],
        application_context: {
          brand_name: 'NexEd',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        }
      });

      const order = await client.execute(request);

      payment.provider = 'paypal';
      payment.providerPaymentId = order.result.id;
      payment.providerResponse = order.result;
      await payment.save();

      res.status(201).json({
        success: true,
        message: 'PayPal order created successfully',
        payment: {
          id: payment._id,
          orderId: order.result.id,
          approveLink: order.result.links.find(link => link.rel === 'approve').href
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment provider'
      });
    }

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment',
      error: error.message
    });
  }
};

/**
 * @desc    Confirm payment completion
 * @route   POST /api/payments/:id/confirm
 * @access  Private (Student)
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already completed',
        payment
      });
    }

    // Verify with payment provider
    if (payment.provider === 'stripe') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        await payment.complete(paymentIntent);
        
        res.json({
          success: true,
          message: 'Payment confirmed successfully',
          payment
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment not completed',
          status: paymentIntent.status
        });
      }

    } else if (payment.provider === 'paypal') {
      const paypal = require('@paypal/checkout-server-sdk');
      
      const environment = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          );
      
      const client = new paypal.core.PayPalHttpClient(environment);

      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      
      const capture = await client.execute(request);

      if (capture.result.status === 'COMPLETED') {
        await payment.complete(capture.result);
        
        res.json({
          success: true,
          message: 'Payment confirmed successfully',
          payment
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment not completed',
          status: capture.result.status
        });
      }
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment',
      error: error.message
    });
  }
};

/**
 * @desc    Handle Stripe webhook
 * @route   POST /api/payments/webhook/stripe
 * @access  Public (Stripe only)
 */
exports.handleStripeWebhook = async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({
          providerPaymentId: paymentIntent.id
        });

        if (payment && payment.status === 'pending') {
          await payment.complete(paymentIntent);
          await payment.addWebhookEvent('payment_intent.succeeded', event);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({
          providerPaymentId: paymentIntent.id
        });

        if (payment) {
          payment.status = 'failed';
          payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
          await payment.save();
          await payment.addWebhookEvent('payment_intent.payment_failed', event);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const payment = await Payment.findOne({
          'providerResponse.latest_charge': charge.id
        });

        if (payment) {
          await payment.refund(charge.amount_refunded / 100, 'Customer request');
          await payment.addWebhookEvent('charge.refunded', event);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Handle PayPal webhook
 * @route   POST /api/payments/webhook/paypal
 * @access  Public (PayPal only)
 */
exports.handlePayPalWebhook = async (req, res) => {
  try {
    const webhookEvent = req.body;

    // TODO: Verify webhook signature
    // const verification = await verifyPayPalWebhook(req);

    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const captureId = webhookEvent.resource.id;
        const payment = await Payment.findOne({
          'providerResponse.purchase_units.0.payments.captures.0.id': captureId
        });

        if (payment && payment.status === 'pending') {
          await payment.complete(webhookEvent.resource);
          await payment.addWebhookEvent('PAYMENT.CAPTURE.COMPLETED', webhookEvent);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const captureId = webhookEvent.resource.id;
        const payment = await Payment.findOne({
          'providerResponse.purchase_units.0.payments.captures.0.id': captureId
        });

        if (payment) {
          const refundAmount = parseFloat(webhookEvent.resource.amount.value);
          await payment.refund(refundAmount, 'Customer request');
          await payment.addWebhookEvent('PAYMENT.CAPTURE.REFUNDED', webhookEvent);
        }
        break;
      }

      default:
        console.log(`Unhandled PayPal event type ${webhookEvent.event_type}`);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Request refund
 * @route   POST /api/payments/:id/refund
 * @access  Private (Student/Admin)
 */
exports.requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    if (payment.refund.isRefunded) {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }

    // Check refund policy (e.g., within 30 days)
    const daysSincePurchase = (Date.now() - payment.paidAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePurchase > 30) {
      return res.status(400).json({
        success: false,
        message: 'Refund period has expired (30 days from purchase)'
      });
    }

    // Process refund with provider
    if (payment.provider === 'stripe') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const refund = await stripe.refunds.create({
        payment_intent: payment.providerPaymentId,
        reason: 'requested_by_customer'
      });

      await payment.refund(payment.amount, reason);

      res.json({
        success: true,
        message: 'Refund processed successfully',
        payment
      });

    } else if (payment.provider === 'paypal') {
      const paypal = require('@paypal/checkout-server-sdk');
      
      const environment = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
          );
      
      const client = new paypal.core.PayPalHttpClient(environment);

      const captureId = payment.providerResponse.purchase_units[0].payments.captures[0].id;
      const request = new paypal.payments.CapturesRefundRequest(captureId);
      request.requestBody({
        amount: {
          value: payment.amount.toFixed(2),
          currency_code: payment.currency.toUpperCase()
        }
      });

      const refund = await client.execute(request);

      await payment.refund(payment.amount, reason);

      res.json({
        success: true,
        message: 'Refund processed successfully',
        payment
      });
    }

  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:id
 * @access  Private (Student/Instructor/Admin)
 */
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'username email')
      .populate('course', 'title thumbnail price')
      .populate('instructor', 'username email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (
      payment.student._id.toString() !== req.user.id &&
      payment.instructor._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment',
      error: error.message
    });
  }
};

/**
 * @desc    Get student's payment history
 * @route   GET /api/payments/my-payments
 * @access  Private (Student)
 */
exports.getMyPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { student: req.user.id };
    if (status) query.status = status;

    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      payments
    });

  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments',
      error: error.message
    });
  }
};

/**
 * @desc    Get instructor revenue
 * @route   GET /api/payments/instructor/revenue
 * @access  Private (Instructor)
 */
exports.getInstructorRevenue = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    const revenue = await Payment.getInstructorRevenue(
      req.user.id,
      courseId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.json({
      success: true,
      revenue
    });

  } catch (error) {
    console.error('Get instructor revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching revenue',
      error: error.message
    });
  }
};

/**
 * @desc    Get platform revenue (Admin only)
 * @route   GET /api/payments/admin/platform-revenue
 * @access  Private (Admin)
 */
exports.getPlatformRevenue = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { startDate, endDate } = req.query;

    const revenue = await Payment.getPlatformRevenue(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.json({
      success: true,
      revenue
    });

  } catch (error) {
    console.error('Get platform revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching platform revenue',
      error: error.message
    });
  }
};

/**
 * @desc    Generate payment receipt
 * @route   GET /api/payments/:id/receipt
 * @access  Private (Student)
 */
exports.generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'username email')
      .populate('course', 'title')
      .populate('instructor', 'username');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Receipt can only be generated for completed payments'
      });
    }

    const receipt = await payment.generateReceipt();

    res.json({
      success: true,
      receipt
    });

  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating receipt',
      error: error.message
    });
  }
};
