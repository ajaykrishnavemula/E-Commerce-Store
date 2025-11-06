import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import type { Product } from '../types';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      await updateItem(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Please login to view your cart</p>
          <Link to="/login">
            <Button variant="primary">Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <Loading size="lg" text="Loading cart..." fullScreen />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link to="/products">
            <Button variant="primary" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Continue Shopping
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="ghost" onClick={handleClearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = item.product as Product;
            return (
              <Card key={product._id}>
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/products/${product._id}`}
                    className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product._id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.category} • {product.brand}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveItem(product._id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(product._id, Math.max(1, item.quantity - 1))
                        }
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            product._id,
                            Math.min(product.stock, item.quantity + 1)
                          )
                        }
                        disabled={item.quantity >= product.stock}
                        className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-900">
                      ${(product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{cart.totalPrice >= 50 ? 'FREE' : '$5.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${(cart.totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    $
                    {(
                      cart.totalPrice +
                      (cart.totalPrice >= 50 ? 0 : 5) +
                      cart.totalPrice * 0.1
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Proceed to Checkout
            </Button>

            <Link to="/products">
              <Button variant="outline" size="lg" className="w-full mt-3">
                Continue Shopping
              </Button>
            </Link>

            {/* Free Shipping Notice */}
            {cart.totalPrice < 50 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Add ${(50 - cart.totalPrice).toFixed(2)} more to get FREE shipping!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;


