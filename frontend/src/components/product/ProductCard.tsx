import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated } = useAuthStore();
  const { addItem: addToCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      await toggleWishlist(product._id);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link to={`/products/${product._id}`}>
      <Card className="group overflow-hidden" hover>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.featured && (
              <Badge variant="warning">Featured</Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="error">Out of Stock</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform ${
              inWishlist ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 mb-2">
            <Badge size="sm">{product.category}</Badge>
            <span className="text-xs text-gray-500">{product.brand}</span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({product.numReviews})</span>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<ShoppingCart className="h-4 w-4" />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add
            </Button>
          </div>

          {/* Stock Info */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-orange-600 mt-2">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;


