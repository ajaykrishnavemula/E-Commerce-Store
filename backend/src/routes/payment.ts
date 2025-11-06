import * as express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  handleWebhook,
  createRefund,
} from '../controllers/paymentController';
import authMiddleware from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = express.Router();

/**
 * @route   POST /api/v1/payment/create-intent
 * @desc    Create a payment intent
 * @access  Private
 */
router.post('/create-intent', authMiddleware, createPaymentIntent);

/**
 * @route   POST /api/v1/payment/confirm
 * @desc    Confirm payment and update order
 * @access  Private
 */
router.post('/confirm', authMiddleware, confirmPayment);

/**
 * @route   GET /api/v1/payment/:paymentIntentId
 * @desc    Get payment status
 * @access  Private
 */
router.get('/:paymentIntentId', authMiddleware, getPaymentStatus);

/**
 * @route   POST /api/v1/payment/webhook
 * @desc    Handle Stripe webhooks
 * @access  Public (Stripe only - verified by signature)
 * @note    This endpoint must use raw body, not JSON parsed body
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

/**
 * @route   POST /api/v1/payment/refund
 * @desc    Create a refund for an order
 * @access  Private/Admin
 */
router.post('/refund', authMiddleware, adminMiddleware, createRefund);

export default router;


