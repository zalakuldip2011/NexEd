const Stripe = require('stripe');

// Initialize Stripe with error handling for missing API key
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here'
  ? Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

// Export stripe instance or a mock for development
module.exports = stripe || {
  checkout: {
    sessions: {
      create: async () => {
        console.warn('⚠️ Stripe not configured. Using mock session.');
        return { id: 'mock_session_' + Date.now(), url: 'http://localhost:3000/payment/mock' };
      }
    }
  },
  paymentIntents: {
    create: async () => {
      console.warn('⚠️ Stripe not configured. Using mock payment intent.');
      return { id: 'mock_pi_' + Date.now(), client_secret: 'mock_secret' };
    },
    retrieve: async () => ({ status: 'succeeded' })
  },
  refunds: {
    create: async () => ({ id: 'mock_refund_' + Date.now(), status: 'succeeded' })
  },
  webhooks: {
    constructEvent: () => {
      throw new Error('Stripe webhooks not configured');
    }
  }
};
