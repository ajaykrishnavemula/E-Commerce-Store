import express from 'express';
import { authenticateUser } from '../middleware/auth';
import adminMiddleware from '../middleware/admin';
import {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getUserAnalytics
} from '../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateUser, adminMiddleware);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// Analytics routes
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/products', getProductAnalytics);
router.get('/analytics/users', getUserAnalytics);

export default router;

