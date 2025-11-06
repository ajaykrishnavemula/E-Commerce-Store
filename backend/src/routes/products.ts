import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
  getProductCategories,
  addProductReview,
  updateProductInventory,
} from '../controllers/productController';
import authMiddleware from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

// Protected routes - require authentication
router.use(authMiddleware);
router.post('/:id/reviews', addProductReview);

// Admin routes - require admin role
router.use(adminMiddleware);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/inventory', updateProductInventory);

export default router;

