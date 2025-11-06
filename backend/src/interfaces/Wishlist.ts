import mongoose, { Document, Types } from 'mongoose';

export interface IWishlistItem {
  product: Types.ObjectId;
  addedAt: Date;
  notes?: string;
}

export interface IWishlist extends Document {
  user: Types.ObjectId;
  name: string;
  description?: string;
  isPublic: boolean;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlistMethods {
  addItem(productId: Types.ObjectId, notes?: string): Promise<void>;
  removeItem(productId: Types.ObjectId): Promise<void>;
  hasItem(productId: Types.ObjectId): boolean;
  getItemCount(): number;
}

export interface WishlistModel extends mongoose.Model<IWishlist, {}, IWishlistMethods> {
  createDefaultWishlist(userId: mongoose.Types.ObjectId): Promise<IWishlist>;
}

export interface IWishlistDocument extends mongoose.Document, IWishlistMethods {
  user: Types.ObjectId;
  name: string;
  description?: string;
  isPublic: boolean;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

