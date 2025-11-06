import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import apiService from '../../services/api';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  usersGrowth: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface TopProduct {
  _id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        apiService.get<DashboardStats>('/admin/stats'),
        apiService.get<{ orders: RecentOrder[] }>('/admin/orders/recent'),
        apiService.get<{ products: TopProduct[] }>('/admin/products/top'),
      ]);

      setStats(statsRes);
      setRecentOrders(ordersRes.orders);
      setTopProducts(productsRes.products);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">
                {stats && formatCurrency(stats.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                {stats && stats.revenueGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      +{stats.revenueGrowth}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">
                      {stats?.revenueGrowth}%
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              <div className="flex items-center mt-2">
                {stats && stats.ordersGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      +{stats.ordersGrowth}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">
                      {stats?.ordersGrowth}%
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Products */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              <div className="flex items-center mt-2">
                {stats && stats.productsGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      +{stats.productsGrowth}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">
                      {stats?.productsGrowth}%
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Total Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              <div className="flex items-center mt-2">
                {stats && stats.usersGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      +{stats.usersGrowth}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">
                      {stats?.usersGrowth}%
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Products</h2>
            <Link
              to="/admin/products"
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products data</p>
            ) : (
              topProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


