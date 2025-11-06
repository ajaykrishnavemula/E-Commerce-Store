import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth';
import adminMiddleware from '../middleware/admin';
import {
  searchProducts,
  getProductRecommendations,
  reindexProducts
} from '../controllers/searchController';

const router = express.Router();

// Public search routes
router.get('/products', searchProducts);
router.get('/recommendations/:productId', getProductRecommendations);

// Admin-only routes
router.post('/reindex', authenticateUser, adminMiddleware, reindexProducts);

export default router;

