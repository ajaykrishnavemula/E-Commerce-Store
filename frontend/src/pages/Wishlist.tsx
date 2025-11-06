import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import type { Product } from '../types';

const Wishlist = () => {
  const { isAuthenticated } = useAuthStore();
  const { wishlist, isLoading, fetchWishlist, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      try {
        await clearWishlist();
        toast.success('Wishlist cleared');
      } catch (error) {
        toast.error('Failed to clear wishlist');
      }
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading wishlist..." fullScreen />;
  }

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save items you love for later</p>
          <Link to="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-600 mt-1">{wishlist.products.length} items</p>
        </div>
        <Button variant="ghost" onClick={handleClearWishlist}>
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.products.map((product) => (
          <Card key={product._id} className="group overflow-hidden" hover>
            {/* Product Image */}
            <Link to={`/products/${product._id}`}>
              <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg mb-4">
                <img
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveItem(product._id);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                  {product.featured && (
                    <Badge variant="warning">Featured</Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge variant="error">Out of Stock</Badge>
                  )}
                </div>
              </div>
            </Link>

            {/* Product Info */}
            <div>
              <Link
                to={`/products/${product._id}`}
                className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 mb-2"
              >
                {product.name}
              </Link>

              <div className="flex items-center gap-2 mb-3">
                <Badge size="sm">{product.category}</Badge>
                <span className="text-xs text-gray-500">{product.brand}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({product.numReviews})</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                leftIcon={<ShoppingCart className="h-4 w-4" />}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              {/* Stock Info */}
              {product.stock > 0 && product.stock <= 10 && (
                <p className="text-xs text-orange-600 mt-2 text-center">
                  Only {product.stock} left
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;


