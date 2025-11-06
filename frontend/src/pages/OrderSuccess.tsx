import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import orderService from '../services/order.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import type { Order } from '../types';

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const orderData = await orderService.getOrder(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return <Loading size="lg" text="Loading order details..." fullScreen />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your order</p>
          <Link to="/orders">
            <Button variant="primary">View Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <Card className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p className="text-sm text-gray-500">
            Order ID: <span className="font-mono font-semibold">{order._id}</span>
          </p>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-bold">Order Details</h2>
          </div>

          <div className="space-y-4">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.product as string} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-gray-600">
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Payment Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.isPaid && order.paidAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={`/orders/${order._id}`} className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              View Order Details
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Email Confirmation Notice */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            📧 A confirmation email has been sent to your email address with order details and
            tracking information.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;


