import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config';
import { UserModel } from '../interfaces/User';

// Address schema
const AddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true,
  },
  addressLine1: {
    type: String,
    required: [true, 'Please provide address line 1'],
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please provide city'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'Please provide state/province'],
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, 'Please provide postal code'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Please provide country'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['billing', 'shipping', 'both'],
    default: 'both',
  },
});

// User schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      maxlength: 50,
      minlength: 3,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'manager'],
      default: 'customer',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    lastLogin: Date,
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    defaultBillingAddress: {
      type: Number,
    },
    defaultShippingAddress: {
      type: Number,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (this: UserModel) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
UserSchema.methods.createJWT = function (this: UserModel) {
  const payload = {
    userId: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
  };
  
  // Use type assertion to avoid TypeScript errors
  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as any
  );
};

// Generate refresh token
UserSchema.methods.createRefreshToken = function (this: UserModel) {
  const payload = { userId: this._id };
  
  // Use type assertion to avoid TypeScript errors
  return jwt.sign(
    payload,
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiresIn } as any
  );
};

// Compare password
UserSchema.methods.comparePassword = async function (this: UserModel, candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
UserSchema.methods.isLocked = function (this: UserModel) {
  // Check if account is locked and lock time has not expired
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function (this: UserModel) {
  // Increment login attempts
  this.loginAttempts += 1;

  // Lock account if max attempts reached
  if (this.loginAttempts >= config.maxLoginAttempts) {
    this.lockUntil = new Date(Date.now() + config.lockTime);
  }

  await this.save();
};

// Generate verification token
UserSchema.methods.generateVerificationToken = function (this: UserModel) {
  // Generate token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to verificationToken field
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expiration (24 hours)
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return verificationToken;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function (this: UserModel) {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (10 minutes)
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// Add product to wishlist
UserSchema.methods.addToWishlist = async function (this: UserModel, productId: string) {
  if (!this.wishlist) {
    this.wishlist = [];
  }
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    await this.save();
  }
};

// Remove product from wishlist
UserSchema.methods.removeFromWishlist = async function (this: UserModel, productId: string) {
  if (this.wishlist) {
    this.wishlist = this.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await this.save();
  }
};

export default mongoose.model<UserModel>('User', UserSchema);

