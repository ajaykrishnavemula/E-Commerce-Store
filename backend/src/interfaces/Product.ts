import { Document, Types } from 'mongoose';

// Product variant interface
export interface IProductVariant {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  inventory: number;
  attributes: {
    [key: string]: string; // e.g., { color: 'red', size: 'XL' }
  };
  images?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}

// Product category interface
export interface IProductCategory {
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId;
}

// Product review interface
export interface IProductReview {
  userId: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product interface
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  inventory: number;
  lowInventoryThreshold?: number;
  isTrackingInventory: boolean;
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  images: string[];
  thumbnailImage?: string;
  featured: boolean;
  isActive: boolean;
  categories: Types.ObjectId[];
  tags: string[];
  brand?: string;
  manufacturer?: string;
  attributes: {
    [key: string]: string; // e.g., { color: 'red', material: 'cotton' }
  };
  variants?: IProductVariant[];
  hasVariants: boolean;
  tax?: {
    taxable: boolean;
    taxClass?: string;
    taxRate?: number;
  };
  shipping?: {
    requiresShipping: boolean;
    shippingClass?: string;
    shippingWeight?: number;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  reviews?: IProductReview[];
  relatedProducts?: Types.ObjectId[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}

