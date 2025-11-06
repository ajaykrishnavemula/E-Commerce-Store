import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'manager';
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  addresses?: IAddress[];
  defaultBillingAddress?: number; // Index of the address in the addresses array
  defaultShippingAddress?: number; // Index of the address in the addresses array
  phone?: string;
  avatar?: string;
  wishlist?: string[]; // Array of product IDs
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  createJWT(): string;
  createRefreshToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

export interface IAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
  type: 'billing' | 'shipping' | 'both';
}

export interface IUserMethods {
  createJWT(): string;
  createRefreshToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

export interface UserModel extends Document, IUserMethods {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'manager';
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  addresses?: IAddress[];
  defaultBillingAddress?: number;
  defaultShippingAddress?: number;
  phone?: string;
  avatar?: string;
  wishlist?: string[];
  createdAt: Date;
  updatedAt: Date;
}

