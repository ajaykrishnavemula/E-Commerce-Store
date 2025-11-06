import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Truck, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../services/product.service';
import reviewService from '../services/review.service';
import type { Product, Review } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem: addToCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [productData, reviewsData] = await Promise.all([
          productService.getProduct(id),
          reviewService.getProductReviews(id),
        ]);
        setProduct(productData);
        setReviews(reviewsData.reviews);
      } catch (error) {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product._id);
      toast.success(
        isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist'
      );
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading product..." fullScreen />;
  }

  if (!product) {
    return null;
  }

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        leftIcon={<ArrowLeft className="h-5 w-5" />}
        onClick={() => navigate('/products')}
        className="mb-6"
      >
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images Section */}
        <div>
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[selectedImage] || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-primary-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div>
          {/* Category & Brand */}
          <div className="flex items-center gap-2 mb-4">
            <Badge>{product.category}</Badge>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{product.brand}</span>
          </div>

          {/* Product Name */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-gray-500">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <Badge variant="success" size="lg">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="error" size="lg">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<ShoppingCart className="h-5 w-5" />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              isLoading={isAddingToCart}
              className="flex-1"
            >
              Add to Cart
            </Button>
            <Button
              variant={inWishlist ? 'secondary' : 'outline'}
              size="lg"
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-500">On orders over $50</p>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-gray-500">100% protected</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No reviews yet. Be the first to review this product!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">
                      {typeof review.user === 'object' ? review.user.name : 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;


