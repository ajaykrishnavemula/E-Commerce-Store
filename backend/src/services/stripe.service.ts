import Stripe from 'stripe';
import config from '../config';
import { logger } from '../utils/logger';

interface PaymentIntentMetadata {
  orderId?: string;
  userId?: string;
  email?: string;
  [key: string]: string | undefined;
}

interface RefundOptions {
  paymentIntentId: string;
  amount?: number;
  reason?: Stripe.RefundCreateParams.Reason;
}

class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.payment.stripeSecretKey, {
      apiVersion: '2022-11-15',
      typescript: true,
    });
    logger.info('Stripe service initialized');
  }

  /**
   * Create a payment intent
   * @param amount - Amount in dollars (will be converted to cents)
   * @param currency - Currency code (default: 'usd')
   * @param metadata - Additional metadata to attach to the payment
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: PaymentIntentMetadata
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert dollars to cents
        currency: currency.toLowerCase(),
        metadata: metadata as Stripe.MetadataParam || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Retrieve a payment intent by ID
   * @param paymentIntentId - The payment intent ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   * @param paymentIntentId - The payment intent ID
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      logger.info(`Payment intent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  /**
   * Cancel a payment intent
   * @param paymentIntentId - The payment intent ID
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      logger.info(`Payment intent cancelled: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error cancelling payment intent:', error);
      throw error;
    }
  }

  /**
   * Create a refund for a payment
   * @param options - Refund options
   */
  async createRefund(options: RefundOptions): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: options.paymentIntentId,
      };

      if (options.amount) {
        refundParams.amount = Math.round(options.amount * 100); // Convert to cents
      }

      if (options.reason) {
        refundParams.reason = options.reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);
      logger.info(`Refund created: ${refund.id} for payment ${options.paymentIntentId}`);
      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Get refund details
   * @param refundId - The refund ID
   */
  async getRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.retrieve(refundId);
      return refund;
    } catch (error) {
      logger.error('Error retrieving refund:', error);
      throw error;
    }
  }

  /**
   * List all refunds for a payment intent
   * @param paymentIntentId - The payment intent ID
   */
  async listRefunds(paymentIntentId: string): Promise<Stripe.ApiList<Stripe.Refund>> {
    try {
      const refunds = await this.stripe.refunds.list({
        payment_intent: paymentIntentId,
      });
      return refunds;
    } catch (error) {
      logger.error('Error listing refunds:', error);
      throw error;
    }
  }

  /**
   * Construct and verify a webhook event
   * @param payload - The raw request body
   * @param signature - The Stripe signature header
   */
  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.payment.stripeWebhookSecret
      );
      return event;
    } catch (error) {
      logger.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  /**
   * Create a customer in Stripe
   * @param email - Customer email
   * @param name - Customer name
   * @param metadata - Additional metadata
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
      logger.info(`Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   * @param customerId - The customer ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      logger.error('Error retrieving customer:', error);
      throw error;
    }
  }

  /**
   * Update customer information
   * @param customerId - The customer ID
   * @param updates - Fields to update
   */
  async updateCustomer(
    customerId: string,
    updates: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, updates);
      logger.info(`Customer updated: ${customerId}`);
      return customer;
    } catch (error) {
      logger.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Get payment method details
   * @param paymentMethodId - The payment method ID
   */
  async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      logger.error('Error retrieving payment method:', error);
      throw error;
    }
  }

  /**
   * Attach payment method to customer
   * @param paymentMethodId - The payment method ID
   * @param customerId - The customer ID
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      logger.info(`Payment method ${paymentMethodId} attached to customer ${customerId}`);
      return paymentMethod;
    } catch (error) {
      logger.error('Error attaching payment method:', error);
      throw error;
    }
  }

  /**
   * List customer's payment methods
   * @param customerId - The customer ID
   * @param type - Payment method type (default: 'card')
   */
  async listCustomerPaymentMethods(
    customerId: string,
    type: Stripe.PaymentMethodListParams.Type = 'card'
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type,
      });
      return paymentMethods;
    } catch (error) {
      logger.error('Error listing payment methods:', error);
      throw error;
    }
  }
}

export default new StripeService();


