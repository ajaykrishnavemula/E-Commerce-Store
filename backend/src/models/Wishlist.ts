import mongoose, { Schema } from 'mongoose';
import { IWishlist, IWishlistMethods, WishlistModel, IWishlistDocument } from '../interfaces/Wishlist';

const WishlistSchema = new Schema<IWishlistDocument, WishlistModel, IWishlistMethods>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Wishlist name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          maxlength: [500, 'Notes cannot be more than 500 characters'],
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ isPublic: 1 });
WishlistSchema.index({ 'items.product': 1 });

// Methods
WishlistSchema.method('addItem', async function (this: IWishlistDocument, productId: mongoose.Types.ObjectId, notes?: string) {
  // Check if product already exists in wishlist
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    // Update notes if provided
    if (notes) {
      existingItem.notes = notes;
    }
    await this.save();
    return;
  }

  // Add new item
  this.items.push({
    product: productId,
    addedAt: new Date(),
    notes,
  });

  await this.save();
});

WishlistSchema.method('removeItem', async function (this: IWishlistDocument, productId: mongoose.Types.ObjectId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  await this.save();
});

WishlistSchema.method('hasItem', function (this: IWishlistDocument, productId: mongoose.Types.ObjectId): boolean {
  return this.items.some(
    (item) => item.product.toString() === productId.toString()
  );
});

WishlistSchema.method('getItemCount', function (this: IWishlistDocument): number {
  return this.items.length;
});

// Create a default wishlist for new users
WishlistSchema.statics.createDefaultWishlist = async function (userId: mongoose.Types.ObjectId) {
  return this.create({
    user: userId,
    name: 'My Wishlist',
    description: 'Default wishlist',
    isPublic: false,
    items: [],
  });
};

const Wishlist = mongoose.model<IWishlistDocument, WishlistModel>('Wishlist', WishlistSchema);

export default Wishlist;

