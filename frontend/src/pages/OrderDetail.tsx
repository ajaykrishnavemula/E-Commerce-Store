import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, Truck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import orderService from '../services/order.service';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import type { Order } from '../types';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const orderData = await orderService.getOrder(id);
        setOrder(orderData);
      } catch (error) {
        toast.error('Failed to load order');
        navigate('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setIsCancelling(true);
    try {
      await orderService.cancelOrder(order._id);
      toast.success('Order cancelled successfully');
      setOrder({ ...order, status: 'cancelled' });
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error',
    };

    return (
      <Badge variant={variants[status] || 'default'} size="lg">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading order details..." fullScreen />;
  }

  if (!order) {
    return null;
  }

  const canCancel = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        onClick={() => navigate('/orders')}
        className="mb-6"
      >
        Back to Orders
      </Button>

      {/* Order Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Details</h1>
          <p className="text-gray-600">
            Order ID: <span className="font-mono font-semibold">{order._id}</span>
          </p>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(order.status)}
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancelOrder}
              isLoading={isCancelling}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">Order Items</h2>
            </div>

            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Price: ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">Shipping Address</h2>
            </div>
            <div className="text-gray-600">
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </Card>

          {/* Payment Information */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">Payment Information</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                {order.isPaid ? (
                  <Badge variant="success">Paid</Badge>
                ) : (
                  <Badge variant="warning">Unpaid</Badge>
                )}
              </div>
              {order.isPaid && order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At</span>
                  <span className="font-medium">
                    {new Date(order.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery Status */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">Delivery Status</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Status</span>
                {order.isDelivered ? (
                  <Badge variant="success">Delivered</Badge>
                ) : (
                  <Badge variant="info">In Transit</Badge>
                )}
              </div>
              {order.isDelivered && order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered At</span>
                  <span className="font-medium">
                    {new Date(order.deliveredAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Items Price</span>
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
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {order.isPaid && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Payment Confirmed</p>
                      <p className="text-sm text-gray-500">
                        {order.paidAt && new Date(order.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {order.isDelivered && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-gray-500">
                        {order.deliveredAt && new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


