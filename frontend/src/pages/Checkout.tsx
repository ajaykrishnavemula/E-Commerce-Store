import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import orderService from '../services/order.service';
import paymentService from '../services/payment.service';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import type { CheckoutFormData, Product } from '../types';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData['shippingAddress']>({
    defaultValues: {
      address: '',
      city: '',
      postalCode: '',
      country: 'United States',
    },
  });

  const onSubmit = async (shippingAddress: CheckoutFormData['shippingAddress']) => {
    if (!stripe || !elements || !cart) {
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate total amount
      const subtotal = cart.totalPrice;
      const shipping = subtotal >= 50 ? 0 : 5;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      // Create order first (with pending payment status)
      const order = await orderService.createOrder({
        shippingAddress,
        paymentMethod: 'stripe',
      });

      // Create payment intent with the total amount
      const { clientSecret } = await paymentService.createPaymentIntent(
        total,
        order._id
      );

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name,
            email: user?.email,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend (updates order status and sends email)
        await paymentService.confirmPayment(paymentIntent.id, order._id);
        
        // Clear cart
        await clearCart();
        
        toast.success('Order placed successfully!');
        navigate(`/order-success/${order._id}`);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = cart.totalPrice;
  const shipping = subtotal >= 50 ? 0 : 5;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Shipping Address */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-bold">Shipping Address</h2>
        </div>

        <div className="space-y-4">
          <Input
            label="Street Address"
            placeholder="123 Main St"
            error={errors.address?.message}
            {...register('address', { required: 'Address is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="New York"
              error={errors.city?.message}
              {...register('city', { required: 'City is required' })}
            />

            <Input
              label="Postal Code"
              placeholder="10001"
              error={errors.postalCode?.message}
              {...register('postalCode', { required: 'Postal code is required' })}
            />
          </div>

          <Input
            label="Country"
            placeholder="United States"
            error={errors.country?.message}
            {...register('country', { required: 'Country is required' })}
          />
        </div>
      </Card>

      {/* Payment Method */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-bold">Payment Method</h2>
        </div>

        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Your payment information is secure and encrypted
        </p>
      </Card>

      {/* Order Summary */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-bold">Order Summary</h2>
        </div>

        <div className="space-y-3">
          {cart.items.map((item) => {
            const product = item.product as Product;
            return (
              <div key={product._id} className="flex justify-between">
                <span className="text-gray-600">
                  {product.name} x {item.quantity}
                </span>
                <span className="font-medium">
                  ${(product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            );
          })}

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isProcessing}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchCart();
  }, [isAuthenticated, fetchCart, navigate]);

  if (isLoading) {
    return <Loading size="lg" text="Loading checkout..." fullScreen />;
  }

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="max-w-2xl mx-auto">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;


