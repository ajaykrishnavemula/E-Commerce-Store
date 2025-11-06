import apiService from './api';
import type { Wishlist, Product } from '../types';

class WishlistService {
  async getWishlist(): Promise<Wishlist> {
    return await apiService.get<Wishlist>('/wishlist');
  }

  async addToWishlist(productId: string): Promise<Wishlist> {
    return await apiService.post<Wishlist>('/wishlist/items', { productId });
  }

  async removeFromWishlist(productId: string): Promise<Wishlist> {
    return await apiService.delete<Wishlist>(`/wishlist/items/${productId}`);
  }

  async clearWishlist(): Promise<void> {
    await apiService.delete('/wishlist');
  }

  async isInWishlist(productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.products.some((p: Product) => p._id === productId);
    } catch {
      return false;
    }
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;


