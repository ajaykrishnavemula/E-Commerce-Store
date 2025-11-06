import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wishlist, Product } from '../types';
import wishlistService from '../services/wishlist.service';

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: null,
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const wishlist = await wishlistService.getWishlist();
          set({ wishlist, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addItem: async (productId) => {
        set({ isLoading: true });
        try {
          const wishlist = await wishlistService.addToWishlist(productId);
          set({ wishlist, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (productId) => {
        set({ isLoading: true });
        try {
          const wishlist = await wishlistService.removeFromWishlist(productId);
          set({ wishlist, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearWishlist: async () => {
        set({ isLoading: true });
        try {
          await wishlistService.clearWishlist();
          set({ wishlist: null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      isInWishlist: (productId) => {
        const { wishlist } = get();
        if (!wishlist) return false;
        return wishlist.products.some((p: Product) => p._id === productId);
      },

      toggleWishlist: async (productId) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(productId)) {
          await removeItem(productId);
        } else {
          await addItem(productId);
        }
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        wishlist: state.wishlist,
      }),
    }
  )
);


