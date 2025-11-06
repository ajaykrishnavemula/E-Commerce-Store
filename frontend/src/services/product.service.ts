import apiService from './api';
import type { Product, ProductsResponse, ProductFilters } from '../types';

class ProductService {
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    return await apiService.get<ProductsResponse>('/products', filters);
  }

  async getProduct(id: string): Promise<Product> {
    return await apiService.get<Product>(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await apiService.get<ProductsResponse>('/products', { featured: true });
    return response.products;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiService.get<ProductsResponse>('/products/search', { q: query });
    return response.products;
  }

  async getCategories(): Promise<string[]> {
    return await apiService.get<string[]>('/products/categories');
  }

  async getBrands(): Promise<string[]> {
    return await apiService.get<string[]>('/products/brands');
  }

  // Admin methods
  async createProduct(productData: Partial<Product>): Promise<Product> {
    return await apiService.post<Product>('/products', productData);
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return await apiService.put<Product>(`/products/${id}`, productData);
  }

  async deleteProduct(id: string): Promise<void> {
    await apiService.delete(`/products/${id}`);
  }

  async uploadProductImage(id: string, file: File): Promise<string> {
    const response = await apiService.uploadFile<{ url: string }>(`/products/${id}/image`, file);
    return response.url;
  }
}

export const productService = new ProductService();
export default productService;


