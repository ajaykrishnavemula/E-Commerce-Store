import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Shield, HeadphonesIcon } from 'lucide-react';
import productService from '../services/product.service';
import type { Product } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts();
        setFeaturedProducts(products.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Commerce Pro
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, secure delivery.
            </p>
            <Link to="/products">
              <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center" hover>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <ShoppingBag className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600 text-sm">
                Thousands of products across multiple categories
              </p>
            </Card>

            <Card className="text-center" hover>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Truck className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Quick and reliable shipping to your doorstep
              </p>
            </Card>

            <Card className="text-center" hover>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">
                Safe and encrypted payment processing
              </p>
            </Card>

            <Card className="text-center" hover>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <HeadphonesIcon className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">
                Always here to help with your questions
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-2">Check out our handpicked selection</p>
            </div>
            <Link to="/products">
              <Button variant="outline" rightIcon={<ArrowRight className="h-5 w-5" />}>
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" text="Loading products..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover amazing deals today.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;


