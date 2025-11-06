import apiService from './api';

interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
}

interface PaymentConfirmResponse {
  success: boolean;
  message: string;
  order: any;
}

interface PaymentStatusResponse {
  success: boolean;
  status: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
}

class PaymentService {
  /**
   * Create a payment intent for an order
   * @param amount - Amount in dollars
   * @param orderId - Order ID
   * @param currency - Currency code (default: 'usd')
   */
  async createPaymentIntent(
    amount: number,
    orderId: string,
    currency: string = 'usd'
  ): Promise<PaymentIntentResponse> {
    const response = await apiService.post<PaymentIntentResponse>(
      '/payment/create-intent',
      { amount, orderId, currency }
    );
    return response;
  }

  /**
   * Confirm payment and update order
   * @param paymentIntentId - Stripe payment intent ID
   * @param orderId - Order ID
   */
  async confirmPayment(
    paymentIntentId: string,
    orderId: string
  ): Promise<PaymentConfirmResponse> {
    const response = await apiService.post<PaymentConfirmResponse>(
      '/payment/confirm',
      { paymentIntentId, orderId }
    );
    return response;
  }

  /**
   * Get payment status
   * @param paymentIntentId - Stripe payment intent ID
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResponse> {
    const response = await apiService.get<PaymentStatusResponse>(
      `/payment/${paymentIntentId}`
    );
    return response;
  }

  /**
   * Create a refund (Admin only)
   * @param orderId - Order ID
   * @param amount - Amount to refund (optional, full refund if not provided)
   * @param reason - Refund reason
   */
  async createRefund(
    orderId: string,
    amount?: number,
    reason?: string
  ): Promise<any> {
    const response = await apiService.post('/payment/refund', {
      orderId,
      amount,
      reason,
    });
    return response;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
