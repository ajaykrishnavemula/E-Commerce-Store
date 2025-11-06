import { StatusCodes } from 'http-status-codes';

// Using any to bypass TypeScript issues - runtime types are correct via express.d.ts
type Request = any;
type Response = any;
import stripeService from '../services/stripe.service';
import emailService from '../services/email.service';
import Order from '../models/Order';
import { BadRequestError, NotFoundError } from '../errors';
import { logger } from '../utils/logger';

/**
 * @desc    Create a payment intent for an order
 * @route   POST /api/v1/payment/create-intent
 * @access  Private
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
  const { amount, orderId, currency = 'usd' } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    throw new BadRequestError('Invalid payment amount');
  }

  // Validate order ID if provided
  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order not found with id: ${orderId}`);
    }

    // Verify order belongs to user
    if (!req.user) {
      throw new BadRequestError('Authentication required');
    }

    if (order.customer.toString() !== req.user.userId) {
      throw new BadRequestError('Not authorized to pay for this order');
    }

    // Check if order is already paid
    if (order.payment.status === 'completed') {
      throw new BadRequestError('Order is already paid');
    }
  }

  try {
    // Create payment intent with Stripe
    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      currency,
      {
        orderId: orderId || 'pending',
        userId: req.user?.userId || 'guest',
        email: req.user?.email || '',
      }
    );

    logger.info(`Payment intent created: ${paymentIntent.id} for amount: $${amount}`);

    res.status(StatusCodes.OK).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw new BadRequestError('Failed to create payment intent');
  }
};

/**
 * @desc    Confirm payment and update order
 * @route   POST /api/v1/payment/confirm
 * @access  Private
 */
export const confirmPayment = async (req: Request, res: Response) => {
  const { paymentIntentId, orderId } = req.body;

  if (!paymentIntentId) {
    throw new BadRequestError('Payment intent ID is required');
  }

  if (!orderId) {
    throw new BadRequestError('Order ID is required');
  }

  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

    // Check payment status
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestError(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    // Find and update order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order not found with id: ${orderId}`);
    }

    // Verify order belongs to user
    if (!req.user) {
      throw new BadRequestError('Authentication required');
    }

    if (order.customer.toString() !== req.user.userId) {
      throw new BadRequestError('Not authorized to access this order');
    }

    // Check if order is already paid
    if (order.payment.status === 'completed') {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Order is already paid',
        order,
      });
    }

    // Update order payment status
    order.payment.status = 'completed';
    order.payment.transactionId = paymentIntentId;
    order.payment.paidAt = new Date();
    order.status = 'processing';
    await order.save();

    logger.info(`Payment confirmed for order: ${orderId}`);

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(order.email, {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        tax: order.tax && order.tax.length > 0
          ? order.tax.reduce((sum, t) => sum + t.amount, 0)
          : 0,
        shipping: order.shippingCost,
        total: order.total,
        shippingAddress: {
          street: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
      });
      logger.info(`Order confirmation email sent to: ${order.email}`);
    } catch (emailError) {
      logger.error('Error sending order confirmation email:', emailError);
      // Don't throw error - order is still confirmed
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Payment confirmed successfully',
      order,
    });
  } catch (error) {
    logger.error('Error confirming payment:', error);
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Failed to confirm payment');
  }
};

/**
 * @desc    Get payment status
 * @route   GET /api/v1/payment/:paymentIntentId
 * @access  Private
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    throw new BadRequestError('Payment intent ID is required');
  }

  try {
    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

    res.status(StatusCodes.OK).json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert cents to dollars
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method,
    });
  } catch (error) {
    logger.error('Error retrieving payment status:', error);
    throw new BadRequestError('Failed to retrieve payment status');
  }
};

/**
 * @desc    Handle Stripe webhooks
 * @route   POST /api/v1/payment/webhook
 * @access  Public (Stripe only)
 */
export const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    throw new BadRequestError('Missing Stripe signature');
  }

  try {
    // Construct and verify webhook event
    const event = await stripeService.constructWebhookEvent(
      req.body,
      signature
    );

    logger.info(`Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        logger.info(`Payment succeeded: ${paymentIntent.id}`);
        
        // Update order if orderId is in metadata
        if (paymentIntent.metadata?.orderId) {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order && order.payment.status !== 'completed') {
            order.payment.status = 'completed';
            order.payment.transactionId = paymentIntent.id;
            order.payment.paidAt = new Date();
            order.status = 'processing';
            await order.save();
            logger.info(`Order ${order._id} updated via webhook`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        logger.error(`Payment failed: ${paymentIntent.id}`);
        
        // Update order if orderId is in metadata
        if (paymentIntent.metadata?.orderId) {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order) {
            order.payment.status = 'failed';
            await order.save();
            logger.info(`Order ${order._id} marked as failed via webhook`);
          }
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as any;
        logger.info(`Payment canceled: ${paymentIntent.id}`);
        
        // Update order if orderId is in metadata
        if (paymentIntent.metadata?.orderId) {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order) {
            order.payment.status = 'failed';
            await order.save();
            logger.info(`Order ${order._id} marked as cancelled via webhook`);
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        logger.info(`Charge refunded: ${charge.id}`);
        
        // Find order by payment intent ID
        const order = await Order.findOne({ 'payment.transactionId': charge.payment_intent });
        if (order) {
          order.payment.status = 'refunded';
          order.status = 'refunded';
          await order.save();
          logger.info(`Order ${order._id} marked as refunded via webhook`);
        }
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    res.status(StatusCodes.OK).json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: 'Webhook processing failed',
    });
  }
};

/**
 * @desc    Create a refund for an order
 * @route   POST /api/v1/payment/refund
 * @access  Private/Admin
 */
export const createRefund = async (req: Request, res: Response) => {
  const { orderId, amount, reason } = req.body;

  if (!orderId) {
    throw new BadRequestError('Order ID is required');
  }

  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError(`Order not found with id: ${orderId}`);
  }

  // Check if order has a payment transaction
  if (!order.payment.transactionId) {
    throw new BadRequestError('Order has no payment transaction');
  }

  // Check if order is already refunded
  if (order.payment.status === 'refunded') {
    throw new BadRequestError('Order is already refunded');
  }

  try {
    // Create refund with Stripe
    const refund = await stripeService.createRefund({
      paymentIntentId: order.payment.transactionId,
      amount: amount || order.total,
      reason: reason || 'requested_by_customer',
    });

    // Update order
    order.payment.status = 'refunded';
    order.status = 'refunded';
    await order.save();

    logger.info(`Refund created for order: ${orderId}, refund ID: ${refund.id}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Refund created successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
      order,
    });
  } catch (error) {
    logger.error('Error creating refund:', error);
    throw new BadRequestError('Failed to create refund');
  }
};


