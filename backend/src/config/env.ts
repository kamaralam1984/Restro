import dotenv from 'dotenv';

dotenv.config();

// Environment variable validation and export
export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || '',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',

  // WhatsApp
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || '',
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
  ADMIN_PHONE: process.env.ADMIN_PHONE || '',

  // Authentication
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// Validate required environment variables
export const validateEnv = (): void => {
  const required = ['MONGODB_URI'];
  const missing: string[] = [];

  required.forEach((key) => {
    if (!env[key as keyof typeof env]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
  }

  // Warn about optional but recommended variables
  if (env.NODE_ENV === 'production') {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️  Razorpay credentials not configured. Payment features will not work.');
    }
    if (!env.ADMIN_TOKEN) {
      console.warn('⚠️  ADMIN_TOKEN not configured. Authentication is disabled.');
    }
  }
};

