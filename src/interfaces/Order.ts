import mongoose, { Document, Types } from 'mongoose';
import { IAddress } from './User';

// Order item interface
export interface IOrderItem {
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
}

// Shipping method interface
export interface IShippingMethod {
  name: string;
  carrier: string;
  price: number;
  estimatedDelivery?: {
    min: number; // days
    max: number; // days
  };
}

// Payment interface
export interface IPayment {
  method: 'credit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash_on_delivery';
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'failed';
  transactionId?: string;
  amount: number;
  currency: string;
  paidAt?: Date;
}

// Discount interface
export interface IDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
}

// Tax interface
export interface ITax {
  name: string;
  rate: number;
  amount: number;
}

// Order status history interface
export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: Types.ObjectId;
}

// Order interface
export interface IOrderModel extends mongoose.Model<IOrder> {
  generateOrderNumber(): Promise<string>;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  email: string;
  items: IOrderItem[];
  billingAddress: IAddress;
  shippingAddress: IAddress;
  shippingMethod: IShippingMethod;
  payment: IPayment;
  subtotal: number;
  shippingCost: number;
  discount?: IDiscount;
  tax?: ITax[];
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  statusHistory: IOrderStatusHistory[];
  notes?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  invoiceUrl?: string;
  refunds?: {
    amount: number;
    reason: string;
    date: Date;
    transactionId?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

