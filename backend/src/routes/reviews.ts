import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth';
import adminMiddleware from '../middleware/admin';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  moderateReview,
  voteOnReview,
  getPendingReviews
} from '../controllers/reviewController';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes (require authentication)
router.post('/', authenticateUser, createReview);
router.get('/user/:userId', authenticateUser, getUserReviews);
router.patch('/:id', authenticateUser, updateReview);
router.delete('/:id', authenticateUser, deleteReview);
router.post('/:id/vote', authenticateUser, voteOnReview);

// Admin-only routes
router.patch('/:id/moderate', authenticateUser, adminMiddleware, moderateReview);
router.get('/pending', authenticateUser, adminMiddleware, getPendingReviews);

export default router;

