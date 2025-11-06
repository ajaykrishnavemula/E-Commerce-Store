import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, Product } from '../types';
import cartService from '../services/cart.service';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      itemCount: 0,
      totalPrice: 0,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const cart = await cartService.getCart();
          set({
            cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: cart.totalPrice,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addItem: async (product, quantity = 1) => {
        set({ isLoading: true });
        try {
          const cart = await cartService.addToCart(product._id, quantity);
          set({
            cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: cart.totalPrice,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateItem: async (productId, quantity) => {
        set({ isLoading: true });
        try {
          const cart = await cartService.updateCartItem(productId, quantity);
          set({
            cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: cart.totalPrice,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (productId) => {
        set({ isLoading: true });
        try {
          const cart = await cartService.removeFromCart(productId);
          set({
            cart,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: cart.totalPrice,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartService.clearCart();
          set({
            cart: null,
            itemCount: 0,
            totalPrice: 0,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getItemQuantity: (productId) => {
        const { cart } = get();
        if (!cart) return 0;
        const item = cart.items.find((item) => 
          typeof item.product === 'string' 
            ? item.product === productId 
            : item.product._id === productId
        );
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
        itemCount: state.itemCount,
        totalPrice: state.totalPrice,
      }),
    }
  )
);


