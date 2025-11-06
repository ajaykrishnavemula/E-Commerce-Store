import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
} from '../controllers/orderController';
import authMiddleware from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = express.Router();

// All routes require authentication
// authMiddleware is applied in app.ts before these routes

// User routes
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes - require admin role
router.use(adminMiddleware);
router.patch('/:id/status', updateOrderStatus);
router.get('/admin/all', getAllOrders);
router.get('/admin/stats', getOrderStats);

export default router;

