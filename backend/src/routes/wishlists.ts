import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createWishlist,
  getUserWishlists,
  getWishlist,
  updateWishlist,
  deleteWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  getPublicWishlists,
  checkProductInWishlists
} from '../controllers/wishlistController';

const router = express.Router();

// Public routes
router.get('/public', getPublicWishlists);

// Protected routes (require authentication)
router.post('/', authenticateUser, createWishlist);
router.get('/', authenticateUser, getUserWishlists);
router.get('/check/:productId', authenticateUser, checkProductInWishlists);
router.get('/:id', getWishlist); // This can be public if the wishlist is public
router.patch('/:id', authenticateUser, updateWishlist);
router.delete('/:id', authenticateUser, deleteWishlist);
router.post('/:id/items', authenticateUser, addItemToWishlist);
router.delete('/:id/items/:productId', authenticateUser, removeItemFromWishlist);

export default router;

