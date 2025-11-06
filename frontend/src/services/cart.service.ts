import apiService from './api';
import type { Cart } from '../types';

class CartService {
  async getCart(): Promise<Cart> {
    return await apiService.get<Cart>('/cart');
  }

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    return await apiService.post<Cart>('/cart/items', { productId, quantity });
  }

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    return await apiService.put<Cart>(`/cart/items/${productId}`, { quantity });
  }

  async removeFromCart(productId: string): Promise<Cart> {
    return await apiService.delete<Cart>(`/cart/items/${productId}`);
  }

  async clearCart(): Promise<void> {
    await apiService.delete('/cart');
  }

  async syncCart(items: { productId: string; quantity: number }[]): Promise<Cart> {
    return await apiService.post<Cart>('/cart/sync', { items });
  }
}

export const cartService = new CartService();
export default cartService;


