import express, { Express, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import configuration
import config from './config';
import { logger } from './utils/logger';

// Import database connection
import connectDB from './db/connect';

// Import middleware
import errorHandlerMiddleware from './middleware/error-handler';
import notFoundMiddleware from './middleware/not-found';
import rateLimiter from './middleware/rate-limiter';
import authMiddleware from './middleware/auth';

// Import routes
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import searchRoutes from './routes/search';
import reviewRoutes from './routes/reviews';
import wishlistRoutes from './routes/wishlists';
import adminRoutes from './routes/admin';

// Initialize express app
const app: Express = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Limit requests from same IP
app.use(rateLimiter);

// Parse JSON request body
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies
app.use(cookieParser());

// Sanitize request data against XSS
app.use(xss());

// Compress responses
app.use(compression());

// HTTP request logger
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', authMiddleware, orderRoutes); // Protected routes
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/wishlists', wishlistRoutes);
app.use('/api/v1/admin', adminRoutes); // Admin routes

// Handle 404 errors
app.use(notFoundMiddleware);

// Handle errors
app.use(errorHandlerMiddleware);

// Start server
const start = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to MongoDB');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION! Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated!');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for testing
export { app, start };

// Start server if file is executed directly
if (require.main === module) {
  start();
}

