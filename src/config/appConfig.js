// Centralized Application Configuration for E-Commerce & Artwork Uploads

export const APP_CONFIG = {
  // Artwork Upload Settings
  MAX_ARTWORK_FILE_SIZE_MB: 100, // Configurable max file size limit
  ALLOWED_ARTWORK_EXTENSIONS: ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'psd', 'cdr'],
  PREVIEWABLE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'pdf'],

  // Payment & COD Configuration
  ALLOW_COD: true,
  COD_MIN_ORDER_AMOUNT: 0,
  COD_MAX_ORDER_AMOUNT: 50000,
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_51MockKeyIdForPrintigly',

  // Tax & Shipping Configuration
  DEFAULT_GST_PERCENTAGE: 0,
  PRICES_INCLUDE_GST: true,
  FREE_SHIPPING_THRESHOLD: 999,
  STANDARD_SHIPPING_FEE: 99,
  EXPRESS_SHIPPING_FEE: 299,

  // Discount Coupons
  AVAILABLE_COUPONS: {
    'WELCOME10': { discountPercent: 10, minOrder: 500, label: '10% OFF Welcome Discount' },
    'PRINT20': { discountPercent: 20, minOrder: 2000, label: '20% OFF Enterprise Print Deal' },
    'FLAT100': { discountAmount: 100, minOrder: 999, label: '₹100 Instant Cashback' },
  }
};
