import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/product.service';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import Loading from '../components/common/Loading';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const filters = {
          search: searchParams.get('search') || undefined,
          category: searchParams.get('category') || undefined,
        };
        const response = await productService.getProducts(filters);
        setProducts(response.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading size="lg" text="Loading products..." fullScreen />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;


