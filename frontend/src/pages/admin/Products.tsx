import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import apiService from '../../services/api';
import type { Product } from '../../types';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get<{ products: Product[] }>('/products');
      setProducts(response.products);
      setFilteredProducts(response.products);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      await apiService.delete(`/admin/products/${selectedProduct._id}`);
      toast.success('Product deleted successfully!');
      setProducts(products.filter((p) => p._id !== selectedProduct._id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Link to="/admin/products/new">
          <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search products by name, category, or description..."
              leftIcon={<Search className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && (
              <Link to="/admin/products/new">
                <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
                  Add Product
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {product.stock === 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Out of Stock
                  </div>
                )}
                {product.stock > 0 && product.stock <= 10 && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Low Stock
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {product.category}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock: {product.stock} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Rating: {product.rating.toFixed(1)} ⭐
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.numReviews} reviews
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/products/${product._id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="h-4 w-4" />}
                      className="w-full"
                    >
                      View
                    </Button>
                  </Link>
                  <Link to={`/admin/products/${product._id}/edit`} className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Edit className="h-4 w-4" />}
                      className="w-full"
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => handleDeleteClick(product)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{selectedProduct?.name}"? This action
            cannot be undone.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="h-5 w-5" />}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;


