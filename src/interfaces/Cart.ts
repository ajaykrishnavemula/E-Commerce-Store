import { Document, Types } from 'mongoose';

// Cart item interface
export interface ICartItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  variant?: {
    id: string;
    attributes: {
      [key: string]: string; // e.g., { color: 'red', size: 'XL' }
    };
  };
  image?: string;
  sku?: string;
  subtotal: number;
  maxQuantity?: number; // Based on inventory
}

// Cart interface
export interface ICart extends Document {
  customer?: Types.ObjectId; // Optional for guest carts
  sessionId?: string; // For guest carts
  items: ICartItem[];
  subtotal: number;
  discountCode?: string;
  discount?: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  };
  tax?: {
    rate: number;
    amount: number;
  };
  shippingMethod?: {
    id: string;
    name: string;
    price: number;
  };
  total: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // For guest carts
}

// Cart methods interface
export interface ICartMethods {
  addItem(productId: string, quantity: number, variantId?: string): Promise<void>;
  updateItemQuantity(itemId: string, quantity: number): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clearCart(): Promise<void>;
  applyDiscount(code: string): Promise<boolean>;
  calculateTotals(): Promise<void>;
  setShippingMethod(methodId: string): Promise<void>;
}

export interface CartModel extends Document, ICartMethods {
  customer?: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  subtotal: number;
  discountCode?: string;
  discount?: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  };
  tax?: {
    rate: number;
    amount: number;
  };
  shippingMethod?: {
    id: string;
    name: string;
    price: number;
  };
  total: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

