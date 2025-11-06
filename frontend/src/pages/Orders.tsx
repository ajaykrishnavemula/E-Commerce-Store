import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import orderService from '../services/order.service';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import type { Order } from '../types';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await orderService.getOrders(page, 10);
        setOrders(response.orders);
        setTotalPages(response.pages);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading orders..." fullScreen />;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to place your first order</p>
          <Link to="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} hover>
            <Link to={`/orders/${order._id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Order Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono font-semibold">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-2">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border-2 border-white"
                        >
                          <img
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-white">
                          <span className="text-sm font-semibold text-gray-600">
                            +{order.orderItems.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Payment & Delivery Status */}
                    <div className="flex gap-2">
                      {order.isPaid ? (
                        <Badge variant="success">Paid</Badge>
                      ) : (
                        <Badge variant="warning">Unpaid</Badge>
                      )}
                      {order.isDelivered ? (
                        <Badge variant="success">Delivered</Badge>
                      ) : (
                        <Badge variant="info">In Transit</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <ChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? 'primary' : 'outline'}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Orders;


