/**
 * Razorpay Checkout Helper
 * Dynamically loads Razorpay checkout and handles payment flow
 */

/**
 * Load Razorpay checkout script dynamically
 */
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      reject(new Error('Failed to load Razorpay checkout'));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay checkout modal
 * @param {Object} options - Payment options
 * @param {string} options.keyId - Razorpay key ID
 * @param {string} options.orderId - Razorpay order ID
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency (INR)
 * @param {string} options.name - Business name
 * @param {string} options.description - Payment description
 * @param {string} options.image - Logo URL
 * @param {Object} options.prefill - Prefill customer details
 * @param {Object} options.theme - Theme customization
 * @returns {Promise} Resolves with payment response
 */
export const openRazorpayCheckout = async (options) => {
  try {
    // Load Razorpay script
    await loadRazorpayScript();

    const {
      keyId,
      orderId,
      amount,
      currency = 'INR',
      name = 'NexEd',
      description = 'Course Purchase',
      image,
      prefill = {},
      theme = { color: '#3b82f6' },
      notes = {}
    } = options;

    // Validate required fields
    if (!keyId || !orderId || !amount) {
      throw new Error('Missing required payment parameters');
    }

    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: name,
        description: description,
        image: image,
        order_id: orderId,
        handler: function (response) {
          // Payment successful
          console.log('✅ Payment successful:', response);
          resolve({
            success: true,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || ''
        },
        notes: notes,
        theme: theme,
        modal: {
          ondismiss: function () {
            // User closed the modal
            console.log('⚠️ Payment cancelled by user');
            reject(new Error('Payment cancelled by user'));
          },
          escape: true,
          backdropclose: false
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 900, // 15 minutes
        remember_customer: true
      };

      const razorpay = new window.Razorpay(razorpayOptions);

      // Handle payment failure
      razorpay.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        reject({
          success: false,
          error: response.error,
          code: response.error.code,
          description: response.error.description,
          reason: response.error.reason,
          step: response.error.step,
          source: response.error.source
        });
      });

      // Open checkout modal
      razorpay.open();
    });

  } catch (error) {
    console.error('❌ Razorpay checkout error:', error);
    throw error;
  }
};

/**
 * Format amount to display
 * @param {number} amount - Amount in INR
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Convert amount to paise
 * @param {number} amountINR - Amount in INR
 * @returns {number} Amount in paise
 */
export const toPaise = (amountINR) => {
  return Math.round(amountINR * 100);
};

/**
 * Convert paise to INR
 * @param {number} paise - Amount in paise
 * @returns {number} Amount in INR
 */
export const toINR = (paise) => {
  return paise / 100;
};

export default {
  openRazorpayCheckout,
  formatAmount,
  toPaise,
  toINR
};
