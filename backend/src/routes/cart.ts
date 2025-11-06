import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyDiscount,
  setShippingMethod,
  mergeCart,
} from '../controllers/cartController';
import authMiddleware from '../middleware/auth';
import optionalAuthMiddleware from '../middleware/optional-auth';

const router = express.Router();

// Routes that work with or without authentication
router.use(optionalAuthMiddleware);
router.get('/', getCart);
router.post('/items', addItemToCart);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);
router.post('/discount', applyDiscount);
router.post('/shipping', setShippingMethod);

// Routes that require authentication
router.use(authMiddleware);
router.post('/merge', mergeCart);

export default router;

