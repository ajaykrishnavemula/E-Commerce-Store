import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  updatePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import authMiddleware from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes - require authentication
router.use(authMiddleware);
router.get('/me', getCurrentUser);
router.patch('/me', updateProfile);
router.patch('/update-password', updatePassword);
router.delete('/me', deleteAccount);

// Admin routes - require admin role
router.use(adminMiddleware);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

