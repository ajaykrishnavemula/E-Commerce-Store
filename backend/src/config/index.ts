import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Rate limiter configuration interface
interface RateLimiterConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests per windowMs
}

// Payment configuration interface
interface PaymentConfig {
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  paypalClientId: string;
  paypalClientSecret: string;
  paypalMode: 'sandbox' | 'live';
}

// Elasticsearch configuration interface
interface ElasticsearchConfig {
  node: string;
  username: string;
  password: string;
  enabled: boolean;
}

// Email configuration interface
interface EmailConfig {
  from: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
}

// Storage configuration interface
interface StorageConfig {
  productImagePath: string;
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
}

// Configuration interface
interface Config {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  environment: 'development' | 'production' | 'test';
  nodeEnv: string;
  frontendUrl: string;
  corsOrigin: string | string[];
  env: 'development' | 'production' | 'test'; // Alias for environment
  rateLimiter: RateLimiterConfig;
  payment: PaymentConfig;
  email: EmailConfig;
  storage: StorageConfig;
  elasticsearch: ElasticsearchConfig;
  maxLoginAttempts: number;
  lockTime: number; // in milliseconds
  defaultCurrency: string;
  taxRate: number;
  shippingRates: {
    standard: number;
    express: number;
  };
}

// Configuration object
const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/commerce-pro-api',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development', // Alias for environment
  rateLimiter: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per windowMs
  },
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    paypalMode: (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox',
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@commerceproapi.com',
    smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
  },
  storage: {
    productImagePath: process.env.PRODUCT_IMAGE_PATH || 'uploads/products',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,webp').split(','),
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
    enabled: process.env.ELASTICSEARCH_ENABLED === 'true',
  },
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockTime: parseInt(process.env.LOCK_TIME || '3600000', 10), // 1 hour
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
  taxRate: parseFloat(process.env.TAX_RATE || '0.1'), // 10%
  shippingRates: {
    standard: parseFloat(process.env.SHIPPING_RATE_STANDARD || '5.99'),
    express: parseFloat(process.env.SHIPPING_RATE_EXPRESS || '14.99'),
  },
};

export default config;

